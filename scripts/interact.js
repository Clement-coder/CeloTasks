/**
 * CeloTasks Mainnet Interaction Script
 * =====================================
 * Executes 100+ REAL onchain transactions on Celo Mainnet.
 *
 * SETUP:
 *   cd scripts && npm install viem
 *
 * USAGE:
 *   CREATOR_KEY=0x... WORKER_KEY=0x... node interact.js
 *
 * REQUIREMENTS:
 *   - Creator wallet: ~0.30 cUSD + small CELO for gas
 *   - Worker wallet:  small CELO for gas (submitWork tx)
 *
 * CONTRACT: 0xe289c5F77Bf51BB187C302364b779f4CAF572aEb (Celo Mainnet)
 * NETWORK:  Celo Mainnet (chainId 42220)
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

// ── Addresses ─────────────────────────────────────────────────────────────────

const CELOTASKS = "0xe289c5F77Bf51BB187C302364b779f4CAF572aEb";
const CUSD      = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

// TaskCreated event topic0 — keccak256("TaskCreated(uint256,address,uint256,uint256)")
// Verified from live tx 0x75e09de896ea1d92615a27e30ce9506103ea2e5602db31668ca61e64e6550187
const TASK_CREATED_TOPIC = "0xedce45cc3fc2bea98c94b72104f4a750dcc91bd183a01870ed4f93a365eba5b9";

// ── Config ────────────────────────────────────────────────────────────────────

const REWARD       = parseUnits("0.01", 18); // 0.01 cUSD per task
const FULL_TASKS   = 20;                     // 5 txs each = 100 write txs
const CANCEL_TASKS = 5;                      // 2 txs each = 10 write txs
const TX_DELAY_MS  = 1500;                   // ms between txs — avoids RPC rate limits

const CREATOR_KEY = process.env.CREATOR_KEY;
const WORKER_KEY  = process.env.WORKER_KEY;

if (!CREATOR_KEY || !WORKER_KEY) {
  console.error("ERROR: Set CREATOR_KEY and WORKER_KEY environment variables.");
  process.exit(1);
}

// ── ABIs ──────────────────────────────────────────────────────────────────────

const TASKS_ABI = [
  { name: "createTask",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "reward", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "metadataUri", type: "string" }],
    outputs: [{ name: "taskId", type: "uint256" }] },
  { name: "assignWorker",   type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }, { name: "worker", type: "address" }], outputs: [] },
  { name: "submitWork",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }, { name: "proofUri", type: "string" }], outputs: [] },
  { name: "approveTask",    type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }], outputs: [] },
  { name: "releasePayment", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }], outputs: [] },
  { name: "cancelTask",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }], outputs: [] },
  { name: "getTask",        type: "function", stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "id", type: "uint256" }, { name: "creator", type: "address" },
      { name: "worker", type: "address" }, { name: "reward", type: "uint256" },
      { name: "deadline", type: "uint256" }, { name: "submittedAt", type: "uint256" },
      { name: "status", type: "uint8" }, { name: "revisionCount", type: "uint8" },
      { name: "metadataUri", type: "string" }, { name: "proofUri", type: "string" },
    ]}] },
  { name: "getStatus",  type: "function", stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }], outputs: [{ name: "", type: "uint8" }] },
  { name: "taskCount",  type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  // Custom errors — allows viem to decode revert reasons
  { name: "NotCreator",        type: "error", inputs: [] },
  { name: "NotWorker",         type: "error", inputs: [] },
  { name: "WrongStatus",       type: "error", inputs: [{ name: "current", type: "uint8" }, { name: "expected", type: "uint8" }] },
  { name: "MaxRevisionsReached", type: "error", inputs: [] },
  { name: "DeadlineNotPassed", type: "error", inputs: [] },
  { name: "TimeoutNotReached", type: "error", inputs: [] },
  { name: "TransferFailed",    type: "error", inputs: [] },
];

const CUSD_ABI = [
  { name: "approve",   type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
];

// ── Clients ───────────────────────────────────────────────────────────────────

const creator  = privateKeyToAccount(CREATOR_KEY);
const worker   = privateKeyToAccount(WORKER_KEY);

const pub      = createPublicClient({ chain: celo, transport: http("https://forno.celo.org", { timeout: 30_000 }) });
const creatorW = createWalletClient({ account: creator, chain: celo, transport: http("https://forno.celo.org", { timeout: 30_000 }) });
const workerW  = createWalletClient({ account: worker,  chain: celo, transport: http("https://forno.celo.org", { timeout: 30_000 }) });

// ── Nonce management ──────────────────────────────────────────────────────────
// Fetch nonce from chain at start of each address's first tx, then increment locally.
// Always use blockTag: "latest" (not "pending") to avoid stale nonce from prior runs.

const nonces = {};

async function getNonce(address) {
  if (nonces[address] == null) {
    nonces[address] = await pub.getTransactionCount({ address, blockTag: "latest" });
  }
  return nonces[address]++;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let n = 0;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Send a tx with manual nonce, wait for receipt, log result. */
async function sendTx(client, params, label) {
  const nonce = await getNonce(client.account.address);
  const hash = await client.writeContract({ ...params, nonce });
  await sleep(TX_DELAY_MS);
  const receipt = await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
  if (receipt.status !== "success") throw new Error(`TX reverted: ${hash}`);
  console.log(`[${++n}] WRITE ${label} → ${receipt.status} | https://celoscan.io/tx/${hash}`);
  return receipt;
}

/** Retry wrapper — 3 attempts with exponential backoff. */
async function retry(fn, label, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === attempts) throw e;
      const wait = 3000 * i;
      console.log(`  ⚠ Retry ${i}/${attempts} for ${label} (${e.shortMessage || e.message}) — waiting ${wait}ms`);
      await sleep(wait);
    }
  }
}

/** Read a contract value and log it. */
async function read(label, fn) {
  const v = await fn();
  console.log(`[${++n}] READ  ${label}: ${v}`);
  return v;
}

/**
 * Extract taskId from a createTask receipt.
 * Matches by TASK_CREATED_TOPIC (topic0) so it's immune to other events in the same tx.
 */
function taskIdFromReceipt(receipt) {
  const log = receipt.logs.find(
    l => l.address.toLowerCase() === CELOTASKS.toLowerCase() &&
         l.topics[0]?.toLowerCase() === TASK_CREATED_TOPIC.toLowerCase()
  );
  if (!log || !log.topics[1]) throw new Error("TaskCreated event not found in receipt");
  return BigInt(log.topics[1]);
}

const deadline = () => BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("CeloTasks — Live Mainnet Interactions");
  console.log("=".repeat(60));
  console.log(`Creator : https://celoscan.io/address/${creator.address}`);
  console.log(`Worker  : https://celoscan.io/address/${worker.address}`);
  console.log(`Contract: https://celoscan.io/address/${CELOTASKS}`);
  console.log("=".repeat(60) + "\n");

  // ── Pre-flight checks ─────────────────────────────────────────────────────
  const creatorBal = await read("creator cUSD balance", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "balanceOf", args: [creator.address] })
  );
  await read("worker cUSD balance", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "balanceOf", args: [worker.address] })
  );
  await read("taskCount (before)", () =>
    pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "taskCount" })
  );

  const totalNeeded = REWARD * BigInt(FULL_TASKS + CANCEL_TASKS);
  if (creatorBal < totalNeeded) {
    console.error(`\nInsufficient cUSD. Need ${formatUnits(totalNeeded, 18)}, have ${formatUnits(creatorBal, 18)}`);
    process.exit(1);
  }

  // ── Fund worker with CELO for gas if balance is low ───────────────────────
  // Worker needs to call submitWork (FULL_TASKS times). Each costs ~100k gas.
  // At 100 gwei base fee: 100k * 100e9 * 20 tasks = 0.2 CELO worst case.
  // Top up to 0.05 CELO minimum per task run.
  const MIN_WORKER_CELO = parseUnits("0.05", 18);
  const workerCelo = await pub.getBalance({ address: worker.address });
  if (workerCelo < MIN_WORKER_CELO) {
    const topUp = MIN_WORKER_CELO - workerCelo;
    console.log(`\n⛽ Worker CELO low (${formatUnits(workerCelo, 18)}). Topping up ${formatUnits(topUp, 18)} CELO from creator...`);
    const nonce = await getNonce(creator.address);
    const hash = await creatorW.sendTransaction({ to: worker.address, value: topUp, nonce });
    await sleep(TX_DELAY_MS);
    await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
    console.log(`[${++n}] WRITE CELO top-up → success | https://celoscan.io/tx/${hash}`);
  }

  // ── Step 1: Approve cUSD ──────────────────────────────────────────────────
  // Check existing allowance — only approve if needed
  console.log("\n── Step 1: Approve cUSD ──");
  const existingAllowance = await read("existing allowance", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "allowance", args: [creator.address, CELOTASKS] })
  );

  if (BigInt(existingAllowance) < totalNeeded) {
    await retry(() => sendTx(
      creatorW,
      { address: CUSD, abi: CUSD_ABI, functionName: "approve", args: [CELOTASKS, totalNeeded] },
      "cUSD.approve"
    ), "cUSD.approve");
    await read("allowance confirmed", () =>
      pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "allowance", args: [creator.address, CELOTASKS] })
    );
  } else {
    console.log(`  ✓ Existing allowance sufficient (${formatUnits(BigInt(existingAllowance), 18)} cUSD)`);
  }

  // ── Step 2: 20 full lifecycle tasks ──────────────────────────────────────
  console.log(`\n── Step 2: ${FULL_TASKS} Full Lifecycle Tasks (create→assign→submit→approve→release) ──`);

  for (let i = 1; i <= FULL_TASKS; i++) {
    console.log(`\n  [Task ${i}/${FULL_TASKS}]`);

    // 1. createTask
    const createReceipt = await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "createTask",
        args: [REWARD, deadline(), `ipfs://QmCeloTasksMeta${i}`] },
      `createTask #${i}`
    ), `createTask #${i}`);

    const taskId = taskIdFromReceipt(createReceipt);
    console.log(`       taskId=${taskId}`);

    // 2. assignWorker (creator)
    await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "assignWorker",
        args: [taskId, worker.address] },
      `assignWorker taskId=${taskId}`
    ), `assignWorker taskId=${taskId}`);

    // 3. submitWork (worker)
    await retry(() => sendTx(
      workerW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "submitWork",
        args: [taskId, `ipfs://QmCeloTasksProof${i}`] },
      `submitWork taskId=${taskId}`
    ), `submitWork taskId=${taskId}`);

    // Read status after submission
    await read(`getStatus taskId=${taskId}`, () =>
      pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "getStatus", args: [taskId] })
    );

    // 4. approveTask (creator)
    await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "approveTask",
        args: [taskId] },
      `approveTask taskId=${taskId}`
    ), `approveTask taskId=${taskId}`);

    // 5. releasePayment (creator)
    await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "releasePayment",
        args: [taskId] },
      `releasePayment taskId=${taskId}`
    ), `releasePayment taskId=${taskId}`);

    // Read full task state every 5 tasks
    if (i % 5 === 0) {
      await read(`getTask taskId=${taskId} (final state)`, () =>
        pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "getTask", args: [taskId] })
      );
    }
  }

  // ── Step 3: 5 cancelled tasks ─────────────────────────────────────────────
  console.log(`\n── Step 3: ${CANCEL_TASKS} Cancelled Tasks (create→cancel) ──`);

  for (let i = 1; i <= CANCEL_TASKS; i++) {
    console.log(`\n  [Cancel ${i}/${CANCEL_TASKS}]`);

    const createReceipt2 = await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "createTask",
        args: [REWARD, deadline(), `ipfs://QmCeloTasksCancel${i}`] },
      `createTask (cancel) #${i}`
    ), `createTask (cancel) #${i}`);

    const taskId = taskIdFromReceipt(createReceipt2);
    console.log(`       taskId=${taskId}`);

    await retry(() => sendTx(
      creatorW,
      { address: CELOTASKS, abi: TASKS_ABI, functionName: "cancelTask",
        args: [taskId] },
      `cancelTask taskId=${taskId}`
    ), `cancelTask taskId=${taskId}`);
  }

  // ── Final reads ───────────────────────────────────────────────────────────
  console.log("\n── Final State ──");
  await read("taskCount (after)", () =>
    pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "taskCount" })
  );
  await read("creator cUSD balance (after)", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "balanceOf", args: [creator.address] })
  );
  await read("worker cUSD balance (after)", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "balanceOf", args: [worker.address] })
  );

  console.log("\n" + "=".repeat(60));
  console.log(`✅ DONE — Total interactions: ${n}`);
  console.log(`🔍 Verify: https://celoscan.io/address/${CELOTASKS}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n❌ Error:", err.shortMessage || err.message);
  console.error(err);
  process.exit(1);
});

process.on("exit", () => {
  console.log(`\nSummary: ${n} total interactions recorded.`);
});
