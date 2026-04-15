"use client";
import { use, useState } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import Link from "next/link";
import { IconCoin, IconArrowRight, IconSearch, IconCheck, IconZap, IconExternalLink } from "@/components/Icons";

const STATUS_STYLES = {
  open:        "text-teal-400 bg-teal-400/10 border-teal-400/20",
  in_progress: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  completed:   "text-green-400 bg-green-400/10 border-green-400/20",
};
const STATUS_LABELS = { open: "Open", in_progress: "In Progress", completed: "Completed" };

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTask, acceptTask, completeTask, releasePayment } = useTaskStore();
  const task = getTask(id);
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<null | { fn: () => void; title: string; message: string; label: string; danger?: boolean }>(null);

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

  const handle = async (action: (id: string) => void, msg: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate tx
    action(id);
    addToast(msg, "success");
    setLoading(false);
    setConfirm(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors w-fit">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </Link>

      <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white leading-snug">{task.title}</h1>
          <span className={`text-xs px-3 py-1.5 rounded-full border shrink-0 ${STATUS_STYLES[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(20,184,166,0.15)" }}>
            <IconCoin className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Reward</p>
            <p className="gradient-text font-bold text-2xl">{task.reward} <span className="text-base">{task.currency}</span></p>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Description</p>
          <p className="text-slate-200 text-sm leading-relaxed">{task.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Posted by</p>
            <p className="text-white text-sm font-mono">{task.creator}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Posted on</p>
            <p className="text-white text-sm">{task.createdAt}</p>
          </div>
          {task.acceptor && (
            <div className="glass-card rounded-xl p-3 col-span-2">
              <p className="text-slate-500 text-xs mb-1">Accepted by</p>
              <p className="text-white text-sm font-mono">{task.acceptor}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          {task.status === "open" && (
            <button disabled={loading}
              onClick={() => setConfirm({ fn: () => handle(acceptTask, "Task accepted! Check My Tasks."), title: "Accept Task", message: "Once accepted you're committing to complete this task.", label: "Accept Task" })}
              className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Accepting...</> : <><IconZap className="w-4 h-4" />Accept Task</>}
            </button>
          )}
          {task.status === "in_progress" && (
            <button disabled={loading}
              onClick={() => handle(completeTask, "Task marked as completed!")}
              className="outline-btn text-white font-semibold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : <><IconCheck className="w-4 h-4" />Mark Completed</>}
            </button>
          )}
          {task.status === "completed" && (
            <button disabled={loading}
              onClick={() => setConfirm({ fn: () => handle(releasePayment, "Payment released!"), title: "Release Payment", message: `Send ${task.reward} ${task.currency} to the acceptor. This cannot be undone.`, label: "Release Payment", danger: true })}
              className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : <><IconCoin className="w-4 h-4" />Release Payment</>}
            </button>
          )}
          <a href="https://celoscan.io" target="_blank" rel="noopener noreferrer"
            className="outline-btn text-slate-400 text-sm px-4 py-3 rounded-xl flex items-center gap-1.5">
            Explorer <IconExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <ConfirmDialog open={!!confirm} title={confirm?.title ?? ""} message={confirm?.message ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"} danger={confirm?.danger}
        onConfirm={() => confirm?.fn()} onCancel={() => setConfirm(null)} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
