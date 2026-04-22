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
