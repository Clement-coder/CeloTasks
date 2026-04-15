"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconCheck, IconCoin, IconPlus, IconZap } from "@/components/Icons";
import { useTaskStore, type ActivityType } from "@/lib/taskStore";

const LABELS = {
  created: { title: "Task Created", color: "text-teal-300", Icon: IconPlus },
  accepted: { title: "Task Accepted", color: "text-amber-300", Icon: IconZap },
  submitted: { title: "Work Submitted", color: "text-sky-300", Icon: IconCheck },
  revision_requested: { title: "Revision Requested", color: "text-orange-300", Icon: IconArrowRight },
  approved: { title: "Submission Approved", color: "text-green-300", Icon: IconCheck },
  paid: { title: "Payment Released", color: "text-fuchsia-300", Icon: IconCoin },
  cancelled: { title: "Task Cancelled", color: "text-red-400", Icon: IconArrowRight },
};

const FILTERS: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Created", value: "created" },
  { label: "Accepted", value: "accepted" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ActivityPage() {
  const { activity, stats } = useTaskStore();
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const filtered = filter === "all" ? activity : activity.filter((a) => a.type === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Activity Feed</p>
        <h1 className="text-4xl font-bold text-white leading-tight">Everything happening in the product, one stream.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open", value: stats.openTasks },
          { label: "Active", value: stats.inProgressTasks },
          { label: "Review", value: stats.reviewQueue },
          { label: "Payout", value: stats.readyForPayout },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-3xl p-5">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{item.label}</p>
            <p className="text-white text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === value ? "border-sky-500/50 text-sky-400 bg-sky-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-10">No activity for this filter yet.</p>
        )}
        {filtered.map((item) => {
          const meta = LABELS[item.type] ?? LABELS.created;
          const { title, color, Icon } = meta;
          return (
            <div key={item.id} className="rounded-2xl border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-11 h-11 rounded-2xl border border-white/[0.08] flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold ${color}`}>{title}</p>
                  <span className="text-xs text-slate-500">{new Date(item.at).toLocaleString()}</span>
                </div>
                <p className="text-white font-medium">{item.taskTitle}</p>
                <p className="text-slate-400 text-sm mt-1">{item.note}</p>
                <p className="text-slate-600 text-xs mt-2 font-mono">{item.actor}</p>
              </div>
              <Link href={`/task/${item.taskId}`} className="outline-btn text-slate-200 text-sm px-4 py-2 rounded-xl self-start sm:self-center">
                Open Task
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
