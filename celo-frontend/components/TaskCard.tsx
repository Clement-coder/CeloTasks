"use client";
import Link from "next/link";
import { Task } from "@/lib/mockData";
import { IconClock, IconCheck, IconZap, IconCoin } from "@/components/Icons";

const STATUS_STYLES: Record<Task["status"], string> = {
  open:        "text-teal-400 bg-teal-400/10 border-teal-400/20",
  in_progress: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  completed:   "text-green-400 bg-green-400/10 border-green-400/20",
};
const STATUS_LABELS: Record<Task["status"], string> = {
  open: "Open", in_progress: "In Progress", completed: "Completed",
};

interface TaskCardProps {
  task: Task;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRelease?: (id: string) => void;
  loading?: boolean;
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function TaskCard({ task, onAccept, onComplete, onRelease, loading }: TaskCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-white/20 transition-all duration-250 hover:-translate-y-0.5 group">
      {/* Title + status */}
      <div className="flex items-start justify-between gap-2">
        <Link href={`/task/${task.id}`}
          className="font-semibold text-white text-base leading-snug group-hover:text-teal-300 transition-colors line-clamp-2">
          {task.title}
        </Link>
        <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 font-medium ${STATUS_STYLES[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <IconClock className="w-3.5 h-3.5" />
          {timeAgo(task.createdAt)}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="font-mono truncate">{task.creator}</span>
      </div>

      {/* Reward + action */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <IconCoin className="w-4 h-4 text-teal-400" />
          <span className="gradient-text font-bold text-lg leading-none">{task.reward}</span>
          <span className="text-slate-400 text-sm">{task.currency}</span>
        </div>

        <div className="flex gap-2">
          {task.status === "open" && onAccept && (
            <button onClick={() => onAccept(task.id)} disabled={loading}
              className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              {loading ? (
                <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Accepting...</>
              ) : (
                <><IconZap className="w-3.5 h-3.5" />Accept</>
              )}
            </button>
          )}
          {task.status === "in_progress" && onComplete && (
            <button onClick={() => onComplete(task.id)} disabled={loading}
              className="outline-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5" />
              {loading ? "..." : "Complete"}
            </button>
          )}
          {task.status === "completed" && onRelease && (
            <button onClick={() => onRelease(task.id)} disabled={loading}
              className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <IconCoin className="w-3.5 h-3.5" />
              {loading ? "..." : "Release"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
