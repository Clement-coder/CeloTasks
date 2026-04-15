"use client";

import Link from "next/link";
import { use, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useTaskStore } from "@/lib/taskStore";
import {
  IconArrowRight,
  IconCheck,
  IconCoin,
  IconExternalLink,
  IconSearch,
  IconWallet,
  IconZap,
} from "@/components/Icons";

const STATUS_STYLES = {
  open: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  in_progress: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  submitted: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  approved: "text-green-300 bg-green-400/10 border-green-400/20",
  paid: "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  submitted: "Needs Review",
  approved: "Approved",
  paid: "Paid",
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTask, currentUser, acceptTask, approveTask, releasePayment, requestRevision, submitTask } = useTaskStore();
  const { toasts, addToast, removeToast } = useToast();
  const task = getTask(id);
  const [loading, setLoading] = useState(false);
  const [proofText, setProofText] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const runAction = async (fn: () => void, message: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    fn();
    addToast(message, "success");
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6">
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
              <h1 className="text-3xl font-bold text-white leading-tight">{task.title}</h1>
            </div>

            <div className="rounded-2xl px-4 py-3 border border-teal-500/15" style={{ background: "rgba(20,184,166,0.08)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Reward</p>
              <p className="gradient-text text-3xl font-bold">
                {task.reward} <span className="text-base">{task.currency}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Creator</p>
              <p className="text-white font-mono text-xs break-all">{task.creator}</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-white">{task.deadline}</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Effort</p>
              <p className="text-white">{task.estimatedHours} hours</p>
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
              <button
                disabled={loading}
                onClick={() => runAction(() => acceptTask(task.id), "Task accepted and moved into your work queue.")}
                className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <IconZap className="w-4 h-4" />
                {loading ? "Accepting..." : "Accept Task"}
              </button>
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
                <button
                  disabled={loading || !proofText.trim()}
                  onClick={() => runAction(() => submitTask(task.id, { proofText: proofText.trim(), proofLink: proofLink.trim() }), "Submission sent to the creator for review.")}
                  className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <IconCheck className="w-4 h-4" />
                  {loading ? "Submitting..." : "Submit Work"}
                </button>
              </>
            )}

            {task.status === "submitted" && isCreator && (
              <>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="If changes are needed, explain what should be revised before approval."
                  className="w-full min-h-28 px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    disabled={loading}
                    onClick={() => runAction(() => approveTask(task.id), "Submission approved. Payment can now be released.")}
                    className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <IconCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    disabled={loading || !feedback.trim()}
                    onClick={() => runAction(() => requestRevision(task.id, feedback.trim()), "Revision requested and sent back to the worker.")}
                    className="outline-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60"
                  >
                    Request Revision
                  </button>
                </div>
              </>
            )}

            {task.status === "approved" && isCreator && (
              <button
                disabled={loading}
                onClick={() => setConfirmOpen(true)}
                className="gradient-btn text-white font-semibold px-5 py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <IconCoin className="w-4 h-4" />
                {loading ? "Paying..." : "Release Payment"}
              </button>
            )}

            {task.status === "paid" && (
              <div className="rounded-2xl p-4 border border-fuchsia-400/15" style={{ background: "rgba(217,70,239,0.08)" }}>
                <p className="text-fuchsia-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Workflow Complete</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  This mock task is fully complete. Use the activity feed and profile page to see how paid work rolls into frontend analytics.
                </p>
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
        open={confirmOpen}
        title="Release Payment"
        message={`Release ${task.reward} ${task.currency} to the worker and mark this workflow complete?`}
        confirmLabel="Release Payment"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void runAction(() => releasePayment(task.id), "Payment released. This task is now complete.");
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
