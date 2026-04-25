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
 * INTERACTION BREAKDOWN (≥100):
 *   - 1  approve cUSD allowance
 *   - 20 full lifecycle tasks × 5 txs (create/assign/submit/approve/release) = 100 txs
 *   - 5  cancelled tasks × 2 txs (create/cancel)                             =  10 txs
 *   - ~30 read calls scattered throughout
 *   TOTAL: ~141 interactions
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

// ── Config ────────────────────────────────────────────────────────────────────

const REWARD       = parseUnits("0.01", 18); // 0.01 cUSD per task
const FULL_TASKS   = 20;
const CANCEL_TASKS = 5;

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

const creator = privateKeyToAccount(CREATOR_KEY);
const worker  = privateKeyToAccount(WORKER_KEY);

const pub     = createPublicClient({ chain: celo, transport: http() });
const creatorW = createWalletClient({ account: creator, chain: celo, transport: http() });
const workerW  = createWalletClient({ account: worker,  chain: celo, transport: http() });

async function sendTx(client, params) {
  const nonce = await pub.getTransactionCount({ address: client.account.address, blockTag: "pending" });
  return client.writeContract({ ...params, nonce });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let n = 0;

async function tx(hash, label) {
  const r = await pub.waitForTransactionReceipt({ hash });
  console.log(`[${++n}] WRITE ${label} → ${r.status} | https://celoscan.io/tx/${hash}`);
  return r;
}

// Extract taskId from TaskCreated event log (topic[1] is the indexed taskId)
function taskIdFromReceipt(receipt) {
  const log = receipt.logs.find(l => l.address.toLowerCase() === CELOTASKS.toLowerCase());
  if (!log) throw new Error("TaskCreated log not found in receipt");
  return BigInt(log.topics[1]);
}

async function read(label, fn) {
  const v = await fn();
  console.log(`[${++n}] READ  ${label}: ${v}`);
  return v;
}

const deadline = () => BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("CeloTasks — Live Mainnet Interactions");
  console.log("=".repeat(60));
  console.log(`Creator : ${creator.address}`);
  console.log(`Worker  : ${worker.address}`);
  console.log(`Contract: ${CELOTASKS}`);
  console.log("=".repeat(60) + "\n");

  // Pre-flight checks
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

  // Approve cUSD allowance for all tasks at once
  console.log("\n── Step 1: Approve cUSD ──");
  await tx(
    await sendTx(creatorW, { address: CUSD, abi: CUSD_ABI, functionName: "approve", args: [CELOTASKS, totalNeeded] }),
    "cUSD.approve"
  );
  await read("allowance confirmed", () =>
    pub.readContract({ address: CUSD, abi: CUSD_ABI, functionName: "allowance", args: [creator.address, CELOTASKS] })
  );

  // ── 20 full lifecycle tasks ───────────────────────────────────────────────
  console.log(`\n── Step 2: ${FULL_TASKS} Full Lifecycle Tasks (create→assign→submit→approve→release) ──`);

  for (let i = 1; i <= FULL_TASKS; i++) {
    console.log(`\n  [Task ${i}/${FULL_TASKS}]`);

    // 1. createTask — get taskId directly from receipt logs
    const createReceipt = await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "createTask",
        args: [REWARD, deadline(), `ipfs://QmCeloTaskScript${i}`],
      }),
      `createTask #${i}`
    );
    const taskId = taskIdFromReceipt(createReceipt);
    console.log(`       taskId=${taskId}`);

    // 2. assignWorker
    await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "assignWorker",
        args: [taskId, worker.address],
      }),
      `assignWorker taskId=${taskId}`
    );

    // 3. submitWork
    await tx(
      await sendTx(workerW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "submitWork",
        args: [taskId, `ipfs://QmProofScript${i}`],
      }),
      `submitWork taskId=${taskId}`
    );

    // Read status after submission
    await read(`getStatus taskId=${taskId}`, () =>
      pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "getStatus", args: [taskId] })
    );

    // 4. approveTask
    await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "approveTask",
        args: [taskId],
      }),
      `approveTask taskId=${taskId}`
    );

    // 5. releasePayment
    await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "releasePayment",
        args: [taskId],
      }),
      `releasePayment taskId=${taskId}`
    );

    // Read full task state every 5 tasks
    if (i % 5 === 0) {
      await read(`getTask taskId=${taskId} (final state)`, () =>
        pub.readContract({ address: CELOTASKS, abi: TASKS_ABI, functionName: "getTask", args: [taskId] })
      );
    }
  }

  // ── 5 cancelled tasks ─────────────────────────────────────────────────────
  console.log(`\n── Step 3: ${CANCEL_TASKS} Cancelled Tasks (create→cancel) ──`);

  for (let i = 1; i <= CANCEL_TASKS; i++) {
    console.log(`\n  [Cancel ${i}/${CANCEL_TASKS}]`);

    const createReceipt2 = await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "createTask",
        args: [REWARD, deadline(), `ipfs://QmCancelScript${i}`],
      }),
      `createTask (cancel) #${i}`
    );
    const taskId = taskIdFromReceipt(createReceipt2);
    console.log(`       taskId=${taskId}`);

    await tx(
      await sendTx(creatorW, {
        address: CELOTASKS, abi: TASKS_ABI, functionName: "cancelTask",
        args: [taskId],
      }),
      `cancelTask taskId=${taskId}`
    );
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
  console.log(`🔍 Verify on celoscan: https://celoscan.io/address/${CELOTASKS}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n❌ Error:", err.shortMessage || err.message);
  process.exit(1);
});

// retry: attempt fn up to 3 times on failure
async function retry(fn, label, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === attempts) throw e;
      console.log(`  ⚠ Retry ${i}/${attempts} for ${label}: ${e.shortMessage || e.message}`);
      await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
}

// Summary logged at process exit
process.on('exit', () => {
  console.log(`\nSummary: ${n} total interactions recorded.`);
});
