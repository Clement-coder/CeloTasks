"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { IconArrowRight, IconCheck, IconClock, IconCoin, IconZap } from "@/components/Icons";
import { type Task, type TaskStatus } from "@/lib/taskStore";

const STATUS_STYLES: Record<TaskStatus, string> = {
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  open: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  in_progress: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  submitted: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  approved: "text-green-300 bg-green-400/10 border-green-400/20",
  paid: "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Draft",
  open: "Open",
  in_progress: "In Progress",
  submitted: "Needs Review",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

interface TaskCardProps {
  task: Task;
  onAccept?: (id: string) => void;
  primaryAction?: { label: string; onClick: (id: string) => void };
  loading?: boolean;
}

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`).getTime();
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/** Returns time-remaining label based on acceptedAt + durationHours */
function dueLabel(task: Task, now: number): { text: string; urgent: boolean } | null {
  if (!task.acceptedAt || task.status === "paid" || task.status === "cancelled") return null;
  const dueMs = new Date(task.acceptedAt).getTime() + Number(task.durationHours) * 3600000;
  const diffMs = dueMs - now;
  const diffH = Math.ceil(diffMs / 3600000);
  if (diffMs < 0) return { text: "Overdue", urgent: true };
  if (diffH <= 1) return { text: "< 1h left", urgent: true };
  if (diffH <= 3) return { text: `${diffH}h left`, urgent: true };
  return { text: `${diffH}h left`, urgent: false };
}

export default function TaskCard({ task, onAccept, primaryAction, loading }: TaskCardProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const due = dueLabel(task, now);

  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
            {due?.urgent && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-red-400/30 text-red-400 bg-red-400/10 font-medium">
                {due.text}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-slate-400">
              {task.category}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-slate-500">
              {task.difficulty}
            </span>
          </div>
          <Link href={`/task/${task.id}`} className="text-white font-semibold text-lg leading-snug hover:text-teal-300 transition-colors">
            {task.title}
          </Link>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{task.description}</p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl p-3 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-slate-500 mb-1">Complete within</p>
          <p className="text-white">{task.durationHours}h of accepting</p>
          {due && !due.urgent && <p className="text-slate-500 mt-0.5">{due.text}</p>}
        </div>
        <div className="rounded-2xl p-3 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-slate-500 mb-1">Posted</p>
          <p className="text-white">{timeAgo(task.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <IconClock className="w-3.5 h-3.5" />
          {timeAgo(task.createdAt)}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="font-mono truncate">{task.creator}</span>
      </div>

      <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <IconCoin className="w-4 h-4 text-teal-400" />
          <span className="gradient-text text-xl font-bold">{task.reward}</span>
          <span className="text-slate-400 text-sm">{task.currency}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/task/${task.id}`} className="outline-btn text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
            Details <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
          {task.status === "open" && onAccept && (
            <button
              onClick={() => onAccept(task.id)}
              disabled={loading}
              className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Accepting</>
              ) : (
                <><IconZap className="w-3.5 h-3.5" />Accept</>
              )}
            </button>
          )}
          {primaryAction && task.status !== "open" && (
            <button
              onClick={() => primaryAction.onClick(task.id)}
              disabled={loading}
              className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Working</>
              ) : (
                <><IconCheck className="w-3.5 h-3.5" />{primaryAction.label}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
