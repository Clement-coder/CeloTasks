// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

// ─── CeloTasks ────────────────────────────────────────────────────────────────

contract CeloTasks {
    // ── Types ──────────────────────────────────────────────────────────────────

    enum Status { Open, InProgress, Submitted, Approved, Paid, Cancelled }

    struct Task {
        uint256 id;
        address creator;
        address worker;
        uint256 reward;          // cUSD amount in wei (18 decimals)
        uint256 deadline;        // unix timestamp
        uint256 submittedAt;     // unix timestamp, set on submitWork
        Status  status;
        uint8   revisionCount;
        string  metadataUri;     // IPFS CID — title, description, tags, deliverables
        string  proofUri;        // IPFS CID — worker submission proof
    }

    // ── State ──────────────────────────────────────────────────────────────────

    IERC20  public immutable cUSD;
    uint256 public taskCount;
    uint256 public constant TIMEOUT = 7 days;
    uint8   public constant MAX_REVISIONS = 3;

    mapping(uint256 => Task) public tasks;

    // ── Events ─────────────────────────────────────────────────────────────────

    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward, string metadataUri);
    event WorkerAssigned(uint256 indexed taskId, address indexed worker);
    event WorkSubmitted(uint256 indexed taskId, address indexed worker, string proofUri);
    event RevisionRequested(uint256 indexed taskId, uint8 revisionCount);
    event TaskApproved(uint256 indexed taskId);
    event PaymentReleased(uint256 indexed taskId, address indexed worker, uint256 amount);
    event TaskCancelled(uint256 indexed taskId);

    // ── Errors ─────────────────────────────────────────────────────────────────

    error NotCreator();
    error NotWorker();
    error WrongStatus(Status current, Status expected);
    error MaxRevisionsReached();
    error DeadlineNotPassed();
    error TimeoutNotReached();
    error TransferFailed();

    // ── Constructor ────────────────────────────────────────────────────────────

    /// @param _cUSD cUSD ERC-20 address on Celo mainnet: 0x765DE816845861e75A25fCA122bb6898B8B1282a
    constructor(address _cUSD) {
        cUSD = IERC20(_cUSD);
    }

    // ── Modifiers ──────────────────────────────────────────────────────────────

    modifier onlyCreator(uint256 taskId) {
        if (tasks[taskId].creator != msg.sender) revert NotCreator();
        _;
    }

    modifier onlyWorker(uint256 taskId) {
        if (tasks[taskId].worker != msg.sender) revert NotWorker();
        _;
    }

    modifier inStatus(uint256 taskId, Status expected) {
        if (tasks[taskId].status != expected) revert WrongStatus(tasks[taskId].status, expected);
        _;
    }

    // ── Write functions ────────────────────────────────────────────────────────

    /// @notice Creator posts a task and deposits cUSD reward into escrow.
    /// @dev Caller must first call cUSD.approve(address(this), reward).
    ///      reward must be > 0 and deadline must be in the future.
    function createTask(
        uint256 reward,
        uint256 deadline,
        string calldata metadataUri
    ) external returns (uint256 taskId) {
        require(reward > 0, "reward must be > 0");
        require(deadline > block.timestamp, "deadline must be in the future");
        taskId = ++taskCount;
        tasks[taskId] = Task({
            id:            taskId,
            creator:       msg.sender,
            worker:        address(0),
            reward:        reward,
            deadline:      deadline,
            submittedAt:   0,
            status:        Status.Open,
            revisionCount: 0,
            metadataUri:   metadataUri,
            proofUri:      ""
        });
        if (!cUSD.transferFrom(msg.sender, address(this), reward)) revert TransferFailed();
        emit TaskCreated(taskId, msg.sender, reward, metadataUri);
    }

    /// @notice Creator selects a worker from applicants (applicant list managed off-chain in Supabase).
    ///         Worker address must be non-zero.
    function assignWorker(uint256 taskId, address worker)
        external
        onlyCreator(taskId)
        inStatus(taskId, Status.Open)
    {
        require(worker != address(0), "worker cannot be zero address");
        require(worker != tasks[taskId].creator, "creator cannot be own worker");
        tasks[taskId].worker = worker;
        tasks[taskId].status = Status.InProgress;
        emit WorkerAssigned(taskId, worker);
    }

    /// @notice Worker submits proof of work. proofUri is an IPFS CID or URL.
    ///         Records submittedAt timestamp used for timeout enforcement.
    function submitWork(uint256 taskId, string calldata proofUri)
        external
        onlyWorker(taskId)
        inStatus(taskId, Status.InProgress)
    {
        require(bytes(proofUri).length > 0, "proofUri cannot be empty");
        tasks[taskId].proofUri     = proofUri;
        tasks[taskId].submittedAt  = block.timestamp;
        tasks[taskId].status       = Status.Submitted;
        emit WorkSubmitted(taskId, msg.sender, proofUri);
    }

    /// @notice Creator requests a revision — sends task back to InProgress.
    ///         Capped at MAX_REVISIONS (3). After cap, creator must approve or cancel.
    function requestRevision(uint256 taskId)
        external
        onlyCreator(taskId)
        inStatus(taskId, Status.Submitted)
    {
        if (tasks[taskId].revisionCount >= MAX_REVISIONS) revert MaxRevisionsReached();
        tasks[taskId].revisionCount++;
        tasks[taskId].status = Status.InProgress;
        emit RevisionRequested(taskId, tasks[taskId].revisionCount);
    }

    /// @notice Creator approves the submission, moving task to Approved.
    ///         Creator must then call releasePayment to transfer cUSD to worker.
    function approveTask(uint256 taskId)
        external
        onlyCreator(taskId)
        inStatus(taskId, Status.Submitted)
    {
        tasks[taskId].status = Status.Approved;
        emit TaskApproved(taskId);
    }

    /// @notice Creator releases escrowed cUSD to the worker.
    ///         Marks task as Paid and transfers reward. Final state — irreversible.
    function releasePayment(uint256 taskId)
        external
        onlyCreator(taskId)
        inStatus(taskId, Status.Approved)
    {
        Task storage t = tasks[taskId];
        t.status = Status.Paid;
        if (!cUSD.transfer(t.worker, t.reward)) revert TransferFailed();
        emit PaymentReleased(taskId, t.worker, t.reward);
    }

    /// @notice Creator cancels the task and gets escrowed cUSD refunded.
    ///         Allowed only when Open (no worker yet) or InProgress (before submission).
    ///         Once work is submitted the creator must approve or request revision.
    function cancelTask(uint256 taskId) external onlyCreator(taskId) {
        Status s = tasks[taskId].status;
        if (s != Status.Open && s != Status.InProgress) {
            revert WrongStatus(s, Status.Open);
        }
        tasks[taskId].status = Status.Cancelled;
        if (!cUSD.transfer(tasks[taskId].creator, tasks[taskId].reward)) revert TransferFailed();
        emit TaskCancelled(taskId);
    }

    /// @notice Worker claims payment if creator hasn't responded within TIMEOUT (7 days) after submission.
    ///         Protects workers from creators who ghost after work is delivered.
    function claimAfterTimeout(uint256 taskId)
        external
        onlyWorker(taskId)
        inStatus(taskId, Status.Submitted)
    {
        Task storage t = tasks[taskId];
        if (block.timestamp < t.submittedAt + TIMEOUT) revert TimeoutNotReached();
        t.status = Status.Paid;
        if (!cUSD.transfer(t.worker, t.reward)) revert TransferFailed();
        emit PaymentReleased(taskId, t.worker, t.reward);
    }

    // ── View functions ─────────────────────────────────────────────────────────

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getStatus(uint256 taskId) external view returns (Status) {
        return tasks[taskId].status;
    }
}
