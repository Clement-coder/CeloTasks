// lib/abi.ts — CeloTasks contract ABI
export const CELOTASKS_ADDRESS = "0x307e7Ae2c36033a894b9a72a8e42529F61c86F0a" as const;
export const CUSD_ADDRESS      = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;

export const CELOTASKS_ABI = [
  // ── Write ──────────────────────────────────────────────────────────────────
  {
    name: "createTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reward",      type: "uint256" },
      { name: "deadline",    type: "uint256" },
      { name: "metadataUri", type: "string"  },
    ],
    outputs: [{ name: "taskId", type: "uint256" }],
  },
  {
    name: "assignWorker",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "worker", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "submitWork",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId",   type: "uint256" },
      { name: "proofUri", type: "string"  },
    ],
    outputs: [],
  },
  {
    name: "requestRevision",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "approveTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "releasePayment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimAfterTimeout",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  // ── Read ───────────────────────────────────────────────────────────────────
  {
    name: "getTask",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id",            type: "uint256" },
          { name: "creator",       type: "address" },
          { name: "worker",        type: "address" },
          { name: "reward",        type: "uint256" },
          { name: "deadline",      type: "uint256" },
          { name: "submittedAt",   type: "uint256" },
          { name: "status",        type: "uint8"   },
          { name: "revisionCount", type: "uint8"   },
          { name: "metadataUri",   type: "string"  },
          { name: "proofUri",      type: "string"  },
        ],
      },
    ],
  },
  {
    name: "getStatus",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "isTimedOut",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "taskCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ── Events ─────────────────────────────────────────────────────────────────
  {
    name: "TaskCreated",
    type: "event",
    inputs: [
      { name: "taskId",      type: "uint256", indexed: true  },
      { name: "creator",     type: "address", indexed: true  },
      { name: "reward",      type: "uint256", indexed: false },
      { name: "metadataUri", type: "string",  indexed: false },
    ],
  },
  {
    name: "WorkerAssigned",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "worker", type: "address", indexed: true },
    ],
  },
  {
    name: "WorkSubmitted",
    type: "event",
    inputs: [
      { name: "taskId",   type: "uint256", indexed: true  },
      { name: "worker",   type: "address", indexed: true  },
      { name: "proofUri", type: "string",  indexed: false },
    ],
  },
  {
    name: "TaskApproved",
    type: "event",
    inputs: [{ name: "taskId", type: "uint256", indexed: true }],
  },
  {
    name: "PaymentReleased",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true  },
      { name: "worker", type: "address", indexed: true  },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TaskCancelled",
    type: "event",
    inputs: [{ name: "taskId", type: "uint256", indexed: true }],
  },
] as const;

// cUSD ERC-20 ABI — only what we need
export const CUSD_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
