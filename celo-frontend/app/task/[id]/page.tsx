"use client";

import Link from "next/link";
import { use, useState, useCallback, useEffect, useRef } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useTaskStore } from "@/lib/taskStore";
import RatingModal from "@/components/RatingModal";
import { getSupabase } from "@/utils/supabase/client";
import {
  IconArrowRight,
  IconCheck,
  IconCoin,
  IconExternalLink,
  IconSearch,
  IconWallet,
  IconZap,
} from "@/components/Icons";
import { usePrivy } from "@privy-io/react-auth";

const STATUS_STYLES = {
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  open: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  in_progress: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  submitted: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  approved: "text-green-300 bg-green-400/10 border-green-400/20",
  paid: "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_LABELS = {
  draft: "Draft",
  open: "Open",
  in_progress: "In Progress",
  submitted: "Needs Review",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTask, currentUser, loading: storeLoading, acceptTask, approveTask, releasePayment, requestRevision, submitTask, cancelTask, editTask, applyToTask, selectApplicant, claimAfterTimeout } = useTaskStore();
  const { login, authenticated } = usePrivy();
  const { toasts, addToast, removeToast } = useToast();
  const task = getTask(id);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editReward, setEditReward] = useState("");
  const [editDurationHours, setEditDurationHours] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDeliverables, setEditDeliverables] = useState("");
  const [editGuide, setEditGuide] = useState("");
  const [editTags, setEditTags] = useState("");
  const [applyNote, setApplyNote] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; data: string } | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // Tick every 60s so the countdown stays accurate while the page is open
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const hasApplied = task?.applications?.some((a) => a.applicant === currentUser);

  // Fetch the payment tx hash from onchain_payments (not the create tx)
  useEffect(() => {
    if (!task || task.status !== "paid") return;
    getSupabase()
      .from("onchain_payments")
      .select("tx_hash")
      .eq("task_id", task.id)
      .single()
      .then(({ data }: { data: { tx_hash: string } | null }) => {
        if (data?.tx_hash) setPaymentTxHash(data.tx_hash);
      });
  }, [task?.id, task?.status]);

  if (storeLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
          <IconSearch className="w-7 h-7 text-teal-500/50" />
        </div>
        <h2 className="text-xl font-bold text-white">Task not found</h2>
        <Link href="/dashboard" className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
          <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCreator = task.creator === currentUser;
  const isWorker = task.acceptor === currentUser;

  const runAction = useCallback(async (fn: () => Promise<void>, message: string, actionKey?: string) => {
    if (actionKey) setActionLoading(actionKey); else setLoading(true);
    try {
      await fn();
      addToast(message, "success");
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Something went wrong. Please try again.", "error");
    } finally {
      if (actionKey) setActionLoading(null); else setLoading(false);
    }
  }, [addToast]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5 sm:gap-6">
      <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors w-fit">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_360px] gap-6">
        <section className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-3 py-1.5 rounded-full border ${STATUS_STYLES[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-slate-400">{task.category}</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-slate-500">{task.difficulty}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{task.title}</h1>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="rounded-2xl px-4 py-3 border border-teal-500/15" style={{ background: "rgba(20,184,166,0.08)" }}>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Reward</p>
                <p className="gradient-text text-3xl font-bold">
                  {task.reward} <span className="text-base">{task.currency}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({ title: task.title, text: `${task.reward} ${task.currency} task on CeloTasks`, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    addToast("Task link copied to clipboard!", "success");
                  }
                }}
                className="outline-btn text-slate-400 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <IconExternalLink className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Creator</p>
              <p className="text-white font-mono text-xs break-all">{task.creator}</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Completion Window</p>
              <p className="text-white">{task.durationHours}h after accepting</p>
              {task.acceptedAt && task.status !== "paid" && task.status !== "cancelled" && (() => {
                const dueMs = new Date(task.acceptedAt).getTime() + Number(task.durationHours) * 3600000;
                const diffMs = dueMs - now;
                const diffH = Math.ceil(diffMs / 3600000);
                const label = diffMs < 0 ? "Overdue" : diffH < 1 ? "< 1h left" : `${diffH}h left`;
                const urgent = diffMs < 3 * 3600000;
                return <p className={`text-xs mt-1 font-semibold ${urgent ? "text-red-400" : "text-slate-500"}`}>{label}</p>;
              })()}
              {!task.acceptedAt && task.status === "open" && (
                <p className="text-slate-600 text-xs mt-1">Starts when accepted</p>
              )}
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Effort</p>
              <p className="text-white">{task.durationHours} hours</p>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Brief</p>
            <p className="text-slate-200 leading-relaxed">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Deliverables</p>
              <ul className="flex flex-col gap-2 text-sm text-slate-200">
                {task.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Submission Guide</p>
              <p className="text-sm text-slate-200 leading-relaxed">{task.submissionGuide}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {task.submission && (
            <div className="rounded-2xl p-5 border border-sky-400/15" style={{ background: "rgba(56,189,248,0.07)" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Latest Submission</p>
                  <p className="text-white text-sm">Submitted {new Date(task.submission.submittedAt).toLocaleString()}</p>
                </div>
                {task.submission.proofLink && (
                  <a href={task.submission.proofLink} target="_blank" rel="noreferrer" className="outline-btn text-slate-200 text-sm px-4 py-2 rounded-xl flex items-center gap-1.5">
                    Open Proof <IconExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{task.submission.proofText}</p>
              {task.submission.attachmentName && (
                <div className="mt-3">
                  {task.submission.attachmentData?.startsWith("data:image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={task.submission.attachmentData} alt={task.submission.attachmentName} className="max-h-48 rounded-xl border border-white/[0.08] object-contain" />
                  ) : (
                    <a href={task.submission.attachmentData} download={task.submission.attachmentName}
                      className="outline-btn text-slate-200 text-xs px-3 py-2 rounded-xl inline-flex items-center gap-1.5">
                      📎 {task.submission.attachmentName}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {task.creatorFeedback && (
            <div className="rounded-2xl p-5 border border-amber-400/15" style={{ background: "rgba(251,191,36,0.08)" }}>
              <p className="text-amber-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Creator Feedback</p>
              <p className="text-slate-200 text-sm leading-relaxed">{task.creatorFeedback}</p>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">
            <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold">Workflow Actions</p>

            {task.status === "open" && !isCreator && (
              !authenticated ? (
                <div className="rounded-2xl p-4 border border-teal-400/15" style={{ background: "rgba(20,184,166,0.08)" }}>
                  <p className="text-teal-300 text-sm font-semibold mb-2">Connect wallet to apply</p>
                  <button onClick={login} className="gradient-btn text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2">
                    <IconWallet className="w-4 h-4" /> Connect Wallet
                  </button>
                </div>
              ) : hasApplied ? (
                <div className="rounded-2xl p-4 border border-teal-400/15" style={{ background: "rgba(20,184,166,0.08)" }}>
                  <p className="text-teal-300 text-sm font-semibold">Application submitted ✓</p>
                  <p className="text-slate-400 text-xs mt-1">Waiting for the creator to select a worker.</p>
                </div>
              ) : (
                <>
                  <textarea value={applyNote} onChange={(e) => setApplyNote(e.target.value)} placeholder="Why are you a good fit? (optional)"
                    className="w-full min-h-20 px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <button disabled={loading} onClick={async () => {
                    setLoading(true);
                    try {
                      await applyToTask(task.id, applyNote.trim());
                      addToast("Application submitted!", "success");
                    } catch (e: unknown) {
                      addToast(e instanceof Error ? e.message : "Failed to submit application.", "error");
                    } finally { setLoading(false); }
                  }}
                    className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                    <IconZap className="w-4 h-4" /> Apply for Task
                  </button>
                </>
              )
            )}

            {task.status === "open" && isCreator && (task.applications?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold">Applicants ({task.applications!.length})</p>
                {task.applications!.map((app) => (
                  <div key={app.applicant} className="rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-white font-mono text-xs">{app.applicant}</p>
                    {app.note && <p className="text-slate-400 text-sm">{app.note}</p>}
                    <button onClick={async () => {
                      await runAction(() => selectApplicant(task.id, app.applicant), "Worker selected!", `select-${app.applicant}`);
                    }}
                      disabled={actionLoading === `select-${app.applicant}`}
                      className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer self-start disabled:opacity-60">
                      {actionLoading === `select-${app.applicant}` ? "Selecting…" : "Select Worker"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {task.status === "in_progress" && isWorker && (
              <>
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Summarize what you completed, key decisions, and any context the creator should know."
                  className="w-full min-h-28 px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <input
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="Proof link (Figma, Loom, Notion, Drive, etc.)"
                  className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors">
                  <span className="px-4 py-2.5 rounded-2xl border border-white/[0.08] text-xs" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {attachment ? `📎 ${attachment.name}` : "Attach file (optional)"}
                  </span>
                  <input type="file" accept="image/*,.pdf,.zip" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { addToast("Attachment must be under 5 MB", "error"); return; }
                    const reader = new FileReader();
                    reader.onload = () => setAttachment({ name: file.name, data: reader.result as string });
                    reader.readAsDataURL(file);
                  }} />
                  {attachment && <button onClick={() => setAttachment(null)} className="text-red-400 text-xs">✕</button>}
                </label>
                <button
                  disabled={actionLoading === "submit" || !proofText.trim()}
                  onClick={() => runAction(() => submitTask(task.id, { proofText: proofText.trim(), proofLink: proofLink.trim(), attachmentName: attachment?.name, attachmentData: attachment?.data }), "Submission sent to the creator for review.", "submit")}
                  className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <IconCheck className="w-4 h-4" />
                  {actionLoading === "submit" ? "Submitting..." : "Submit Work"}
                </button>
              </>
            )}

            {task.status === "submitted" && isWorker && (
              <div className="rounded-2xl p-4 border border-sky-400/15" style={{ background: "rgba(56,189,248,0.07)" }}>
                <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Work Submitted</p>
                <p className="text-slate-400 text-sm">Your submission is under review. The creator will approve or request changes.</p>
                <button
                  onClick={() => setDisputeOpen(true)}
                  className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2 cursor-pointer"
                >
                  Creator not responding? Flag for dispute
                </button>
                {task.chainTaskId && (
                  <button
                    disabled={actionLoading === "claim"}
                    onClick={() => runAction(() => claimAfterTimeout(task.id), "Payment claimed after 7-day timeout.", "claim")}
                    className="mt-2 text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline underline-offset-2 cursor-pointer disabled:opacity-50"
                  >
                    Claim payment after 7-day timeout
                  </button>
                )}
              </div>
            )}

            {task.status === "submitted" && isCreator && (
              <>
                <p className="text-slate-500 text-xs">Revision requests used: <span className={task.revisionCount >= 3 ? "text-red-400 font-semibold" : "text-white"}>{task.revisionCount}/3</span></p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="If changes are needed, explain what should be revised before approval."
                  className="w-full min-h-28 px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    disabled={actionLoading === "approve"}
                    onClick={() => runAction(() => approveTask(task.id), "Submission approved. Payment can now be released.", "approve")}
                    className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <IconCheck className="w-4 h-4" />
                    {actionLoading === "approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    disabled={actionLoading === "revision" || !feedback.trim()}
                    onClick={() => runAction(() => requestRevision(task.id, feedback.trim()), "Revision requested and sent back to the worker.", "revision")}
                    className="outline-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading === "revision" ? "Requesting..." : "Request Revision"}
                  </button>
                </div>
              </>
            )}

            {task.status === "approved" && isCreator && (
              <button
                disabled={actionLoading === "release"}
                onClick={() => setConfirmOpen(true)}
                className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <IconCoin className="w-4 h-4" />
                {actionLoading === "release" ? "Paying..." : "Release Payment"}
              </button>
            )}

            {task.status === "paid" && (
              <div className="rounded-2xl p-4 border border-fuchsia-400/15" style={{ background: "rgba(217,70,239,0.08)" }}>
                <p className="text-fuchsia-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Workflow Complete</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Payment has been released. This task is fully complete.
                </p>
                {paymentTxHash && (
                  <a
                    href={`https://celoscan.io/tx/${paymentTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2"
                  >
                    View payment on Celoscan <IconExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {isCreator && task.acceptor && (
                  <button
                    onClick={() => setRatingOpen(true)}
                    className="mt-3 block text-xs text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    ⭐ Rate the worker
                  </button>
                )}
              </div>
            )}

            {task.status === "cancelled" && (
              <div className="rounded-2xl p-4 border border-red-400/15" style={{ background: "rgba(248,113,113,0.08)" }}>
                <p className="text-red-400 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Task Cancelled</p>
                <p className="text-sm text-slate-200">This task was cancelled by the creator.</p>
              </div>
            )}

            {isCreator && (task.status === "open" || task.status === "in_progress") && (
              <button
                disabled={loading}
                onClick={() => runAction(() => cancelTask(task.id), "Task cancelled.")}
                className="outline-btn text-red-400 border-red-400/20 font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 text-sm"
              >
                Cancel Task
              </button>
            )}

            {isCreator && task.status === "open" && !editing && (
              <button onClick={() => { setEditing(true); setEditTitle(task.title); setEditReward(task.reward); setEditDurationHours(task.durationHours); setEditDesc(task.description); setEditDeliverables(task.deliverables.join("\n")); setEditGuide(task.submissionGuide); setEditTags(task.tags.join(", ")); }}
                className="outline-btn text-slate-300 font-semibold px-5 py-3 rounded-2xl cursor-pointer text-sm">
                Edit Task
              </button>
            )}

            {isCreator && task.status === "open" && editing && (
              <div className="flex flex-col gap-3">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title"
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" rows={3}
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="flex gap-2">
                  <input value={editReward} onChange={(e) => setEditReward(e.target.value)} placeholder="Reward" type="number"
                    className="flex-1 px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <input value={editDurationHours} onChange={(e) => setEditDurationHours(e.target.value)} type="number" min="1" placeholder="Hours to complete"
                    className="flex-1 px-4 py-3 rounded-2xl text-white text-sm focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
                <textarea value={editDeliverables} onChange={(e) => setEditDeliverables(e.target.value)} placeholder={"Deliverables (one per line)"} rows={3}
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <textarea value={editGuide} onChange={(e) => setEditGuide(e.target.value)} placeholder="Submission instructions" rows={2}
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma separated)"
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="flex gap-2">
                  <button onClick={async () => {
                    await editTask(task.id, {
                      title: editTitle, description: editDesc, reward: editReward, durationHours: editDurationHours,
                      deliverables: editDeliverables.split("\n").map((s) => s.trim()).filter(Boolean),
                      submissionGuide: editGuide,
                      tags: editTags.split(",").map((s) => s.trim()).filter(Boolean),
                    });
                    setEditing(false); addToast("Task updated.", "success");
                  }}
                    className="gradient-btn text-white font-semibold px-4 py-2.5 rounded-2xl cursor-pointer text-sm flex-1">Save</button>
                  <button onClick={() => setEditing(false)} className="outline-btn text-slate-300 px-4 py-2.5 rounded-2xl cursor-pointer text-sm">Cancel</button>
                </div>
              </div>
            )}

            {!isCreator && !isWorker && task.status !== "open" && (
              <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-slate-300 text-sm leading-relaxed">This task already has an active workflow. You can still inspect the creator brief and submission history.</p>
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-semibold">Task Snapshot</p>
            <div className="flex items-center gap-3 rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <IconWallet className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-white text-sm font-medium">Role awareness</p>
                <p className="text-slate-500 text-xs">{isCreator ? "You are the creator on this task." : isWorker ? "You are the active worker on this task." : "You are viewing as an observer."}</p>
              </div>
            </div>
            {task.txHash && (
              <a href={`https://celoscan.io/tx/${task.txHash}`} target="_blank" rel="noreferrer"
                className="outline-btn text-slate-400 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5">
                <IconExternalLink className="w-3.5 h-3.5" /> View creation tx on Celoscan
              </a>
            )}
            {task.chainTaskId && (
              <div className="rounded-2xl px-4 py-2.5 border border-white/[0.06] text-xs text-slate-500"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                Chain task ID: <span className="text-slate-300 font-mono">#{task.chainTaskId}</span>
              </div>
            )}
            <Link href="/activity" className="outline-btn text-slate-200 text-sm px-4 py-3 rounded-2xl flex items-center justify-between">
              Review global activity feed <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/profile" className="outline-btn text-slate-200 text-sm px-4 py-3 rounded-2xl flex items-center justify-between">
              Open reputation profile <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={disputeOpen}
        title="Flag for Dispute"
        message="This will record a dispute against this task in the platform log. The creator will be notified. Continue?"
        confirmLabel="Flag Dispute"
        danger
        onCancel={() => setDisputeOpen(false)}
        onConfirm={async () => {
          setDisputeOpen(false);
          try {
            await getSupabase().from("activity").insert({
              task_id: task.id,
              task_title: task.title,
              type: "revision_requested",
              actor: currentUser,
              note: "Worker flagged this task for dispute — creator not responding.",
            });
            addToast("Dispute flagged and recorded.", "info");
          } catch {
            addToast("Dispute flagged. The creator has been notified.", "info");
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Release Payment"
        message={`Release ${task.reward} ${task.currency} to the worker and mark this workflow complete?`}
        confirmLabel="Release Payment"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void runAction(() => releasePayment(task.id), "Payment released. This task is now complete.", "release");
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {task.acceptor && (
        <RatingModal
          open={ratingOpen}
          taskId={task.id}
          taskTitle={task.title}
          workerAddress={task.acceptor}
          raterAddress={currentUser}
          onClose={() => setRatingOpen(false)}
          onDone={() => { setRatingOpen(false); addToast("Rating submitted. Thank you!", "success"); }}
        />
      )}
    </div>
  );
}
