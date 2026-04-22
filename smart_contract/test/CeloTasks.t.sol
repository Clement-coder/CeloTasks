// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CeloTasks} from "../src/CeloTasks.sol";

// ─── Mock cUSD ERC-20 ─────────────────────────────────────────────────────────

contract MockCUSD {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to]         += amount;
        return true;
    }
}

// ─── Base test setup ──────────────────────────────────────────────────────────

contract CeloTasksTest is Test {
    CeloTasks  public ct;
    MockCUSD   public cusd;

    address creator = address(0xA1);
    address worker  = address(0xB2);
    address other   = address(0xC3);

    uint256 constant REWARD   = 10e18;   // 10 cUSD
    uint256 constant DEADLINE = 7 days;  // relative, set in each test

    string constant META  = "ipfs://QmMetadata";
    string constant PROOF = "ipfs://QmProof";

    function setUp() public {
        cusd = new MockCUSD();
        ct   = new CeloTasks(address(cusd));

        // Fund creator with 100 cUSD
        cusd.mint(creator, 100e18);
    }

    // ── Helper: create a task as creator ──────────────────────────────────────
    function _createTask() internal returns (uint256 taskId) {
        vm.startPrank(creator);
        cusd.approve(address(ct), REWARD);
        taskId = ct.createTask(REWARD, block.timestamp + DEADLINE, META);
        vm.stopPrank();
    }

    // ── Helper: create + assign worker ───────────────────────────────────────
    function _assignedTask() internal returns (uint256 taskId) {
        taskId = _createTask();
        vm.prank(creator);
        ct.assignWorker(taskId, worker);
    }

    // ── Helper: create + assign + submit ─────────────────────────────────────
    function _submittedTask() internal returns (uint256 taskId) {
        taskId = _assignedTask();
        vm.prank(worker);
        ct.submitWork(taskId, PROOF);
    }
}

// ─── test_CreateTask ──────────────────────────────────────────────────────────

contract TestCreateTask is CeloTasksTest {
    function test_CreateTask() public {
        uint256 taskId = _createTask();

        CeloTasks.Task memory t = ct.getTask(taskId);
        assertEq(t.id,      taskId);
        assertEq(t.creator, creator);
        assertEq(t.reward,  REWARD);
        assertEq(uint8(t.status), uint8(CeloTasks.Status.Open));
        assertEq(t.metadataUri, META);

        // escrow: contract holds the reward
        assertEq(cusd.balanceOf(address(ct)), REWARD);
        assertEq(cusd.balanceOf(creator),     100e18 - REWARD);
    }

    function test_CreateTask_RevertZeroReward() public {
        vm.startPrank(creator);
        cusd.approve(address(ct), 0);
        vm.expectRevert(bytes("reward must be > 0"));
        ct.createTask(0, block.timestamp + 1 days, META);
        vm.stopPrank();
    }

    function test_CreateTask_RevertPastDeadline() public {
        vm.startPrank(creator);
        cusd.approve(address(ct), REWARD);
        vm.expectRevert(bytes("deadline must be in the future"));
        ct.createTask(REWARD, block.timestamp - 1, META);
        vm.stopPrank();
    }
}

// ─── test_AssignWorker ────────────────────────────────────────────────────────

contract TestAssignWorker is CeloTasksTest {
    function test_AssignWorker() public {
        uint256 taskId = _createTask();
        vm.prank(creator);
        ct.assignWorker(taskId, worker);

        CeloTasks.Task memory t = ct.getTask(taskId);
        assertEq(t.worker, worker);
        assertEq(uint8(t.status), uint8(CeloTasks.Status.InProgress));
    }

    function test_AssignWorker_RevertNotCreator() public {
        uint256 taskId = _createTask();
        vm.prank(other);
        vm.expectRevert(CeloTasks.NotCreator.selector);
        ct.assignWorker(taskId, worker);
    }

    function test_AssignWorker_RevertSelfAssign() public {
        uint256 taskId = _createTask();
        vm.prank(creator);
        vm.expectRevert(bytes("creator cannot be own worker"));
        ct.assignWorker(taskId, creator);
    }
}

// ─── test_SubmitWork ──────────────────────────────────────────────────────────

contract TestSubmitWork is CeloTasksTest {
    function test_SubmitWork() public {
        uint256 taskId = _assignedTask();
        vm.prank(worker);
        ct.submitWork(taskId, PROOF);

        CeloTasks.Task memory t = ct.getTask(taskId);
        assertEq(uint8(t.status), uint8(CeloTasks.Status.Submitted));
        assertEq(t.proofUri, PROOF);
        assertGt(t.submittedAt, 0);
    }

    function test_SubmitWork_RevertNotWorker() public {
        uint256 taskId = _assignedTask();
        vm.prank(other);
        vm.expectRevert(CeloTasks.NotWorker.selector);
        ct.submitWork(taskId, PROOF);
    }

    function test_SubmitWork_RevertEmptyProof() public {
        uint256 taskId = _assignedTask();
        vm.prank(worker);
        vm.expectRevert(bytes("proofUri cannot be empty"));
        ct.submitWork(taskId, "");
    }
}

// ─── test_RequestRevision ─────────────────────────────────────────────────────

contract TestRequestRevision is CeloTasksTest {
    function test_RequestRevision() public {
        uint256 taskId = _submittedTask();
        vm.prank(creator);
        ct.requestRevision(taskId);

        CeloTasks.Task memory t = ct.getTask(taskId);
        assertEq(uint8(t.status), uint8(CeloTasks.Status.InProgress));
        assertEq(t.revisionCount, 1);
    }

    function test_RequestRevision_ThreeTimes() public {
        uint256 taskId = _submittedTask();
        for (uint8 i = 0; i < 3; i++) {
            vm.prank(creator);
            ct.requestRevision(taskId);
            // worker resubmits
            vm.prank(worker);
            ct.submitWork(taskId, PROOF);
        }
        assertEq(ct.getRevisionCount(taskId), 3);
    }
}

// ─── test_ApproveAndRelease ───────────────────────────────────────────────────

contract TestApproveAndRelease is CeloTasksTest {
    function test_ApproveAndRelease() public {
        uint256 taskId = _submittedTask();

        vm.prank(creator);
        ct.approveTask(taskId);
        assertEq(uint8(ct.getStatus(taskId)), uint8(CeloTasks.Status.Approved));

        vm.prank(creator);
        ct.releasePayment(taskId);

        assertEq(uint8(ct.getStatus(taskId)), uint8(CeloTasks.Status.Paid));
        // worker received the reward
        assertEq(cusd.balanceOf(worker), REWARD);
        // contract escrow is empty
        assertEq(cusd.balanceOf(address(ct)), 0);
    }

    function test_ReleasePayment_RevertNotApproved() public {
        uint256 taskId = _submittedTask();
        vm.prank(creator);
        vm.expectRevert();
        ct.releasePayment(taskId); // status is Submitted, not Approved
    }
}

// ─── test_CancelTask ──────────────────────────────────────────────────────────

contract TestCancelTask is CeloTasksTest {
    function test_CancelTask_WhenOpen() public {
        uint256 taskId = _createTask();
        uint256 balBefore = cusd.balanceOf(creator);

        vm.prank(creator);
        ct.cancelTask(taskId);

        assertEq(uint8(ct.getStatus(taskId)), uint8(CeloTasks.Status.Cancelled));
        // creator gets refund
        assertEq(cusd.balanceOf(creator), balBefore + REWARD);
    }

    function test_CancelTask_WhenInProgress() public {
        uint256 taskId = _assignedTask();
        vm.prank(creator);
        ct.cancelTask(taskId);
        assertEq(uint8(ct.getStatus(taskId)), uint8(CeloTasks.Status.Cancelled));
    }

    function test_CancelTask_RevertAfterSubmission() public {
        uint256 taskId = _submittedTask();
        vm.prank(creator);
        vm.expectRevert();
        ct.cancelTask(taskId);
    }
}

// ─── test_ClaimAfterTimeout ───────────────────────────────────────────────────

contract TestClaimAfterTimeout is CeloTasksTest {
    function test_ClaimAfterTimeout() public {
        uint256 taskId = _submittedTask();

        // fast-forward 7 days + 1 second
        vm.warp(block.timestamp + 7 days + 1);

        assertTrue(ct.isTimedOut(taskId));

        vm.prank(worker);
        ct.claimAfterTimeout(taskId);

        assertEq(uint8(ct.getStatus(taskId)), uint8(CeloTasks.Status.Paid));
        assertEq(cusd.balanceOf(worker), REWARD);
    }

    function test_ClaimAfterTimeout_RevertTooEarly() public {
        uint256 taskId = _submittedTask();

        vm.warp(block.timestamp + 6 days);

        vm.prank(worker);
        vm.expectRevert(CeloTasks.TimeoutNotReached.selector);
        ct.claimAfterTimeout(taskId);
    }
}

// ─── test_RevisionCapReverts ──────────────────────────────────────────────────

contract TestRevisionCap is CeloTasksTest {
    function test_RevisionCapReverts() public {
        uint256 taskId = _submittedTask();

        // Use all 3 revisions
        for (uint8 i = 0; i < 3; i++) {
            vm.prank(creator);
            ct.requestRevision(taskId);
            vm.prank(worker);
            ct.submitWork(taskId, PROOF);
        }

        // 4th revision must revert
        vm.prank(creator);
        vm.expectRevert(CeloTasks.MaxRevisionsReached.selector);
        ct.requestRevision(taskId);
    }
}
