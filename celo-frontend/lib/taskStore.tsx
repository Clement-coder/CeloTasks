"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getSupabase } from "@/utils/supabase/client";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import { CELOTASKS_ABI, CELOTASKS_ADDRESS, CUSD_ABI, CUSD_ADDRESS } from "@/lib/abi";

// ─── Constants ───────────────────────────────────────────────────────────────

export const TASK_CATEGORIES = ["Writing", "Design", "Development", "Testing", "Marketing", "Video"] as const;
export const TASK_DIFFICULTIES = ["Quick", "Standard", "Advanced"] as const;
export const TASK_CURRENCIES = ["cUSD", "CELO"] as const;

export type TaskCategory   = (typeof TASK_CATEGORIES)[number];
export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];
export type TaskCurrency   = (typeof TASK_CURRENCIES)[number];
export type TaskStatus     = "draft" | "open" | "in_progress" | "submitted" | "approved" | "paid" | "cancelled";
export type ActivityType   =
  | "created" | "accepted" | "submitted"
  | "revision_requested" | "approved" | "paid" | "cancelled";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskSubmission {
  proofText: string;
  proofLink: string;
  submittedAt: string;
  attachmentName?: string;
  attachmentData?: string;
}

export interface TaskApplication {
  applicant: string;
  note: string;
  appliedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  currency: TaskCurrency;
  status: TaskStatus;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  creator: string;
  acceptor?: string;
  createdAt: string;
  /** ISO timestamp when a worker was assigned — delivery window starts here */
  acceptedAt?: string;
  /** Hours the worker has to complete the task after accepting */
  durationHours: string;
  deliverables: string[];
  submissionGuide: string;
  tags: string[];
  submission?: TaskSubmission;
  creatorFeedback?: string;
  approvedAt?: string;
  paidAt?: string;
  applications?: TaskApplication[];
  revisionCount: number;
  // ── Onchain fields ────────────────────────────────────────────────────────
  chainTaskId?: string;
  txHash?: string;
  contractAddress?: string;
}

export interface ActivityItem {
  id: string;
  taskId: string;
  type: ActivityType;
  actor: string;
  taskTitle: string;
  note: string;
  at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  reward: string;
  currency: TaskCurrency;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  /** Hours the worker has to complete after accepting */
  durationHours: string;
  deliverables: string[];
  submissionGuide: string;
  tags: string[];
}

export interface UserProfile {
  wallet: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  verificationId: string | null;
  role: "user" | "admin";
}

interface TaskStore {
  tasks: Task[];
  activity: ActivityItem[];
  myAddress: string | null;
  currentUser: string;
  loading: boolean;
  profile: UserProfile | null;
  setMyAddress: (addr: string) => void;
  updateProfile: (data: { displayName?: string; email?: string; avatarUrl?: string }) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<string>;
  acceptTask: (id: string) => Promise<void>;
  submitTask: (id: string, payload: { proofText: string; proofLink: string; attachmentName?: string; attachmentData?: string }) => Promise<void>;
  requestRevision: (id: string, feedback: string) => Promise<void>;
  approveTask: (id: string) => Promise<void>;
  releasePayment: (id: string) => Promise<void>;
  cancelTask: (id: string) => Promise<void>;
  editTask: (id: string, updates: Partial<Pick<Task, "title" | "description" | "reward" | "durationHours" | "submissionGuide" | "tags" | "deliverables" | "category" | "difficulty">>) => Promise<void>;
  applyToTask: (id: string, note: string) => Promise<void>;
  selectApplicant: (taskId: string, applicant: string) => Promise<void>;
  claimAfterTimeout: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  browseTasks: Task[];
  myCreatedTasks: Task[];
  myAcceptedTasks: Task[];
  reviewQueue: Task[];
  paymentQueue: Task[];
  stats: {
    openTasks: number;
    inProgressTasks: number;
    reviewQueue: number;
    readyForPayout: number;
    earnings: number;
    spend: number;
    successRate: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_USER = "";

/** Map a raw Supabase tasks row → Task */
function rowToTask(row: Record<string, unknown>, apps: TaskApplication[] = [], sub?: TaskSubmission): Task {
  return {
    id:              row.id as string,
    title:           row.title as string,
    description:     row.description as string,
    reward:          String(row.reward),
    currency:        row.currency as TaskCurrency,
    status:          row.status as TaskStatus,
    category:        row.category as TaskCategory,
    difficulty:      row.difficulty as TaskDifficulty,
    creator:         row.creator_wallet as string,
    acceptor:        (row.acceptor_wallet as string) ?? undefined,
    createdAt:       row.created_at ? (row.created_at as string).slice(0, 10) : "",
    acceptedAt:      (row.accepted_at as string) ?? undefined,
    durationHours:   String(row.duration_hours ?? row.estimated_hours ?? ""),
    deliverables:    (row.deliverables as string[]) ?? [],
    submissionGuide: row.submission_guide as string,
    tags:            (row.tags as string[]) ?? [],
    creatorFeedback: (row.creator_feedback as string) ?? undefined,
    approvedAt:      (row.approved_at as string) ?? undefined,
    paidAt:          (row.paid_at as string) ?? undefined,
    applications:    apps,
    submission:      sub,
    revisionCount:   (row.revision_count as number) ?? 0,
    chainTaskId:     (row.chain_task_id as string) ?? undefined,
    txHash:          (row.tx_hash as string) ?? undefined,
    contractAddress: (row.contract_address as string) ?? undefined,
  };
}

/** Map a raw Supabase activity row → ActivityItem */
function rowToActivity(row: Record<string, unknown>): ActivityItem {
  return {
    id:        row.id as string,
    taskId:    row.task_id as string,
    type:      row.type as ActivityType,
    actor:     row.actor as string,
    taskTitle: row.task_title as string,
    note:      row.note as string,
    at:        row.at as string,
  };
}

async function ensureProfile(wallet: string) {
  const db = getSupabase();
  await db.from("profiles").upsert({ wallet: wallet.toLowerCase() }, { onConflict: "wallet" });
}

async function appendActivity(taskId: string, taskTitle: string, type: ActivityType, actor: string, note: string) {
  const db = getSupabase();
  await db.from("activity").insert({ task_id: taskId, task_title: taskTitle, type, actor: actor.toLowerCase(), note });
}

// ─── Context ─────────────────────────────────────────────────────────────────

const TaskContext = createContext<TaskStore | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [myAddress, _setMyAddress] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [profile, setProfile]   = useState<UserProfile | null>(null);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const currentUser = myAddress?.toLowerCase() ?? FALLBACK_USER;

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const db = getSupabase();

    const [{ data: taskRows }, { data: appRows }, { data: subRows }, { data: actRows }] = await Promise.all([
      db.from("tasks").select("*").order("created_at", { ascending: false }),
      db.from("task_applications").select("*").order("applied_at", { ascending: true }),
      db.from("task_submissions").select("*"),
      db.from("activity").select("*").order("at", { ascending: false }),
    ]);

    const appsMap: Record<string, TaskApplication[]> = {};
    for (const row of (appRows ?? []) as Record<string, unknown>[]) {
      const tid = row.task_id as string;
      if (!appsMap[tid]) appsMap[tid] = [];
      appsMap[tid].push({ applicant: row.applicant as string, note: row.note as string, appliedAt: row.applied_at as string });
    }

    const subMap: Record<string, TaskSubmission> = {};
    for (const row of (subRows ?? []) as Record<string, unknown>[]) {
      const tid = row.task_id as string;
      subMap[tid] = {
        proofText:      row.proof_text as string,
        proofLink:      row.proof_link as string,
        submittedAt:    row.submitted_at as string,
        attachmentName: (row.attachment_name as string) ?? undefined,
        attachmentData: (row.attachment_url as string) ?? undefined,
      };
    }

    setTasks((taskRows ?? []).map((r: Record<string, unknown>) => rowToTask(r, appsMap[r.id as string] ?? [], subMap[r.id as string])));
    setActivity((actRows ?? []).map((r: Record<string, unknown>) => rowToActivity(r)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Realtime subscriptions ──────────────────────────────────────────────────
  useEffect(() => {
    const db = getSupabase();
    let timer: ReturnType<typeof setTimeout>;
    const debouncedFetch = () => { clearTimeout(timer); timer = setTimeout(() => fetchAll(), 300); };
    const channel = db
      .channel("celotasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_applications" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_submissions" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity" }, debouncedFetch)
      .subscribe();
    return () => { clearTimeout(timer); db.removeChannel(channel); };
  }, [fetchAll]);

  // ── setMyAddress — also upsert profile ─────────────────────────────────────
  const setMyAddress = useCallback((addr: string) => {
    const lower = addr.toLowerCase();
    _setMyAddress(lower);
    ensureProfile(lower);
    // fetch profile row
    getSupabase().from("profiles").select("*").eq("wallet", lower).single().then(({ data }: { data: Record<string, unknown> | null }) => {
      if (data) setProfile({
        wallet:         data.wallet as string,
        displayName:    (data.display_name as string) ?? null,
        email:          (data.email as string) ?? null,
        avatarUrl:      (data.avatar_url as string) ?? null,
        isVerified:     (data.is_verified as boolean) ?? false,
        verificationId: (data.verification_id as string) ?? null,
        role:           (data.role as "user" | "admin") ?? "user",
      });
    });
  }, []);

  const updateProfile = useCallback(async (data: { displayName?: string; email?: string; avatarUrl?: string }) => {
    if (!myAddress) return;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.email !== undefined)       patch.email        = data.email;
    if (data.avatarUrl !== undefined)   patch.avatar_url   = data.avatarUrl;
    const { error } = await getSupabase().from("profiles").update(patch).eq("wallet", myAddress);
    if (error) throw error;
    setProfile((prev) => prev ? { ...prev, ...data } : null);
  }, [myAddress]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const createTask = useCallback(async (input: CreateTaskInput): Promise<string> => {
    const db = getSupabase();
    if (!currentUser) throw new Error("Connect your wallet before creating a task.");
    await ensureProfile(currentUser);

    // 1. Insert into Supabase as "draft" until contract confirms
    const { data, error } = await db.from("tasks").insert({
      title:            input.title,
      description:      input.description,
      reward:           Number(input.reward),
      currency:         input.currency,
      category:         input.category,
      difficulty:       input.difficulty,
      creator_wallet:   currentUser,
      duration_hours:   Number(input.durationHours),
      deliverables:     input.deliverables,
      submission_guide: input.submissionGuide,
      tags:             input.tags,
      status:           "draft",
      contract_address: CELOTASKS_ADDRESS,
    }).select().single();
    if (error) throw error;

    // 2. Call contract onchain if wallet is connected
    if (walletClient && publicClient) {
      try {
        const rewardWei = parseEther(input.reward);
        // deadline on contract = now + durationHours
        const deadlineUnix = Math.floor(Date.now() / 1000) + Number(input.durationHours) * 3600;

        // approve cUSD
        const approveTx = await walletClient.writeContract({
          address: CUSD_ADDRESS, abi: CUSD_ABI, functionName: "approve",
          args: [CELOTASKS_ADDRESS, rewardWei],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveTx });

        // create onchain
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "createTask",
          args: [rewardWei, BigInt(deadlineUnix), data.id],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

        // parse TaskCreated event to get chain taskId
        let chainTaskId: string | undefined;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({ abi: CELOTASKS_ABI, ...log });
            if (decoded.eventName === "TaskCreated") {
              chainTaskId = String((decoded.args as { taskId: bigint }).taskId);
              break;
            }
          } catch { /* skip non-matching logs */ }
        }

        // contract confirmed — promote to "open" and save tx data
        await db.from("tasks").update({
          status:        "open",
          tx_hash:       receipt.transactionHash,
          chain_task_id: chainTaskId ?? null,
        }).eq("id", data.id);
      } catch (contractErr) {
        // contract failed — delete the draft so no ghost task remains
        await db.from("tasks").delete().eq("id", data.id);
        throw contractErr;
      }
    } else {
      // no wallet connected — promote to open as off-chain only task
      await db.from("tasks").update({ status: "open" }).eq("id", data.id);
    }

    await appendActivity(data.id, input.title, "created", currentUser, "Published a new task.");
    return data.id as string;
  }, [currentUser, walletClient, publicClient]);

  const acceptTask = useCallback(async (id: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!myAddress) throw new Error("Connect your wallet before accepting a task.");
    if (task.status !== "open") throw new Error("This task is no longer open for acceptance.");
    if (task.creator === currentUser) throw new Error("You cannot accept your own task.");
    await ensureProfile(currentUser);
    const now = new Date().toISOString();
    const { error } = await db.from("tasks").update({ status: "in_progress", acceptor_wallet: currentUser, accepted_at: now }).eq("id", id);
    if (error) throw error;
    await appendActivity(id, task.title, "accepted", currentUser, "Accepted the task and started work.");
  }, [tasks, currentUser, myAddress]);

  const submitTask = useCallback(async (id: string, payload: { proofText: string; proofLink: string; attachmentName?: string; attachmentData?: string }): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!currentUser) throw new Error("Connect your wallet before submitting work.");
    const { error: subError } = await db.from("task_submissions").upsert({
      task_id:         id,
      worker_wallet:   currentUser,
      proof_text:      payload.proofText,
      proof_link:      payload.proofLink,
      attachment_name: payload.attachmentName ?? null,
      attachment_url:  payload.attachmentData ?? null,
      submitted_at:    new Date().toISOString(),
    }, { onConflict: "task_id" });
    if (subError) throw subError;
    const { error } = await db.from("tasks").update({ status: "submitted", creator_feedback: null }).eq("id", id);
    if (error) throw error;

    // call contract submitWork with proof link as proofUri
    if (walletClient && publicClient && task.chainTaskId) {
      try {
        const proofUri = payload.proofLink || payload.proofText.slice(0, 200);
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "submitWork",
          args: [BigInt(task.chainTaskId), proofUri],
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
      } catch (e) { console.error("[submitTask] contract call failed:", e); }
    }

    await appendActivity(id, task.title, "submitted", currentUser, "Submitted work proof for creator review.");
  }, [tasks, currentUser, walletClient, publicClient]);

  const requestRevision = useCallback(async (id: string, feedback: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!currentUser) throw new Error("Connect your wallet to request a revision.");
    if (task.creator !== currentUser) throw new Error("Only the task creator can request a revision.");
    if (task.revisionCount >= 3) throw new Error("Maximum of 3 revision requests reached. Please approve or cancel.");
    const { error } = await db.from("tasks").update({ status: "in_progress", creator_feedback: feedback, revision_count: task.revisionCount + 1 }).eq("id", id);
    if (error) throw error;

    if (walletClient && publicClient && task.chainTaskId) {
      try {
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "requestRevision",
          args: [BigInt(task.chainTaskId)],
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
      } catch (e) { console.error("[requestRevision] contract call failed:", e); }
    }

    await appendActivity(id, task.title, "revision_requested", currentUser, feedback);
  }, [tasks, currentUser, walletClient, publicClient]);

  const approveTask = useCallback(async (id: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!currentUser) throw new Error("Connect your wallet to approve a task.");
    if (task.creator !== currentUser) throw new Error("Only the task creator can approve a submission.");
    const { error } = await db.from("tasks").update({ status: "approved", approved_at: new Date().toISOString(), creator_feedback: null }).eq("id", id);
    if (error) throw error;

    if (walletClient && publicClient && task.chainTaskId) {
      try {
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "approveTask",
          args: [BigInt(task.chainTaskId)],
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
      } catch (e) { console.error("[approveTask] contract call failed:", e); }
    }

    await appendActivity(id, task.title, "approved", currentUser, "Approved the submission and queued payment.");
  }, [tasks, currentUser, walletClient, publicClient]);

  const releasePayment = useCallback(async (id: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.creator !== currentUser) throw new Error("Only the task creator can release payment.");
    if (!task.chainTaskId) throw new Error("No onchain task ID — payment cannot be released without a contract record.");
    if (!walletClient || !publicClient) throw new Error("Connect your wallet to release payment.");

    // contract call FIRST — this is the real money transfer
    const tx = await walletClient.writeContract({
      address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "releasePayment",
      args: [BigInt(task.chainTaskId)],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    // save payment audit record
    await db.from("onchain_payments").insert({
      task_id:       id,
      chain_task_id: task.chainTaskId,
      tx_hash:       receipt.transactionHash,
      from_address:  currentUser,
      to_address:    task.acceptor ?? "",
      amount_wei:    parseEther(task.reward).toString(),
      amount_cusd:   Number(task.reward),
      block_number:  Number(receipt.blockNumber),
      confirmed_at:  new Date().toISOString(),
    });

    const { error } = await db.from("tasks").update({
      status:  "paid",
      paid_at: new Date().toISOString(),
      tx_hash: receipt.transactionHash,
    }).eq("id", id);
    if (error) {
      // Payment was released onchain — log the error but don't throw so the UI reflects success
      console.error("[releasePayment] DB update failed after successful onchain tx:", error);
    }
    await appendActivity(id, task.title, "paid", currentUser, `Released ${task.reward} ${task.currency} to the worker.`);
  }, [tasks, currentUser, walletClient, publicClient]);

  const cancelTask = useCallback(async (id: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (!currentUser) throw new Error("Connect your wallet to cancel a task.");
    if (task.creator !== currentUser) throw new Error("Only the task creator can cancel this task.");

    if (walletClient && publicClient && task.chainTaskId) {
      try {
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "cancelTask",
          args: [BigInt(task.chainTaskId)],
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
      } catch (e) { console.error("[cancelTask] contract call failed:", e); }
    }

    const { error } = await db.from("tasks").update({ status: "cancelled" }).eq("id", id);
    if (error) throw error;
    await appendActivity(id, task.title, "cancelled", currentUser, "Task cancelled by creator.");
  }, [tasks, currentUser, walletClient, publicClient]);

  const editTask = useCallback(async (id: string, updates: Partial<Pick<Task, "title" | "description" | "reward" | "durationHours" | "submissionGuide" | "tags" | "deliverables" | "category" | "difficulty">>): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.creator !== currentUser) throw new Error("Only the task creator can edit this task.");
    const patch: Record<string, unknown> = {};
    if (updates.title !== undefined)           patch.title            = updates.title;
    if (updates.description !== undefined)     patch.description      = updates.description;
    if (updates.reward !== undefined)          patch.reward           = Number(updates.reward);
    if (updates.durationHours !== undefined)   patch.duration_hours   = Number(updates.durationHours);
    if (updates.submissionGuide !== undefined) patch.submission_guide = updates.submissionGuide;
    if (updates.tags !== undefined)            patch.tags             = updates.tags;
    if (updates.deliverables !== undefined)    patch.deliverables     = updates.deliverables;
    if (updates.category !== undefined)        patch.category         = updates.category;
    if (updates.difficulty !== undefined)      patch.difficulty       = updates.difficulty;
    const { error } = await db.from("tasks").update(patch).eq("id", id);
    if (error) throw error;
  }, []);

  const applyToTask = useCallback(async (id: string, note: string): Promise<void> => {
    const db = getSupabase();
    if (!currentUser) throw new Error("Connect your wallet before applying to a task.");
    await ensureProfile(currentUser);
    const { error } = await db.from("task_applications").upsert(
      { task_id: id, applicant: currentUser, note },
      { onConflict: "task_id,applicant" }
    );
    if (error) throw error;
  }, [currentUser]);

  const selectApplicant = useCallback(async (taskId: string, applicant: string): Promise<void> => {
    const db = getSupabase();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.creator !== currentUser) throw new Error("Only the task creator can select a worker.");
    const now = new Date().toISOString();
    const { error } = await db.from("tasks").update({ status: "in_progress", acceptor_wallet: applicant, accepted_at: now }).eq("id", taskId);
    if (error) throw error;

    // call contract if task has a chain_task_id
    if (walletClient && publicClient && task.chainTaskId) {
      try {
        const tx = await walletClient.writeContract({
          address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "assignWorker",
          args: [BigInt(task.chainTaskId), applicant as `0x${string}`],
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
      } catch (e) { console.error("[selectApplicant] contract call failed:", e); }
    }

    await appendActivity(taskId, task.title, "accepted", applicant, "Selected by creator to work on this task.");
  }, [tasks, walletClient, publicClient]);

  const getTask = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const claimAfterTimeout = useCallback(async (id: string): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    if (!task?.chainTaskId) throw new Error("No onchain task ID found.");
    if (!walletClient || !publicClient) throw new Error("Wallet not connected.");
    if (task.acceptor !== currentUser) throw new Error("Only the assigned worker can claim after timeout.");
    const tx = await walletClient.writeContract({
      address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "claimAfterTimeout",
      args: [BigInt(task.chainTaskId)],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    const db = getSupabase();
    await db.from("onchain_payments").insert({
      task_id:       id,
      chain_task_id: task.chainTaskId,
      tx_hash:       receipt.transactionHash,
      from_address:  task.creator,
      to_address:    currentUser,
      amount_wei:    parseEther(task.reward).toString(),
      amount_cusd:   Number(task.reward),
      block_number:  Number(receipt.blockNumber),
      confirmed_at:  new Date().toISOString(),
    });
    await db.from("tasks").update({
      status:  "paid",
      paid_at: new Date().toISOString(),
      tx_hash: receipt.transactionHash,
    }).eq("id", id);
    await appendActivity(id, task.title, "paid", currentUser, "Payment claimed after creator timeout.");
  }, [tasks, currentUser, walletClient, publicClient]);

  // ── Derived state ────────────────────────────────────────────────────────────

  const browseTasks     = tasks.filter((t) => t.status === "open" && (myAddress ? t.creator !== currentUser : true));
  const myCreatedTasks  = tasks.filter((t) => t.creator === currentUser);
  const myAcceptedTasks = tasks.filter((t) => t.acceptor === currentUser);
  const reviewQueue     = tasks.filter((t) => t.creator === currentUser && t.status === "submitted");
  const paymentQueue    = tasks.filter((t) => t.creator === currentUser && t.status === "approved");

  const earnings    = myAcceptedTasks.filter((t) => t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);
  const spend       = myCreatedTasks.filter((t) => t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);
  const resolved    = myAcceptedTasks.filter((t) => t.status === "paid");
  const successRate = myAcceptedTasks.length ? Math.round((resolved.length / myAcceptedTasks.length) * 100) : 100;

  const stats = {
    openTasks:       tasks.filter((t) => t.status === "open").length,
    inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
    reviewQueue:     reviewQueue.length,
    readyForPayout:  paymentQueue.length,
    earnings,
    spend,
    successRate,
  };

  return (
    <TaskContext.Provider value={{
      tasks, activity, myAddress, currentUser, loading, profile,
      setMyAddress, updateProfile, createTask, acceptTask, submitTask,
      requestRevision, approveTask, releasePayment, cancelTask,
      editTask, applyToTask, selectApplicant, getTask, claimAfterTimeout,
      browseTasks, myCreatedTasks, myAcceptedTasks,
      reviewQueue, paymentQueue, stats,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within TaskProvider");
  return ctx;
}
