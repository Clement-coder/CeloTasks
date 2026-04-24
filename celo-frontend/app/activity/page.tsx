"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconCheck, IconCoin, IconPlus, IconZap, IconClock, IconSearch, IconX } from "@/components/Icons";
import { useTaskStore, type ActivityType } from "@/lib/taskStore";

const LABELS: Record<ActivityType, { title: string; desc: string; color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }> = {
  created:            { title: "Task Created",         desc: "A new task was published to the marketplace.",          color: "text-teal-300",    bg: "rgba(20,184,166,0.08)",   border: "rgba(20,184,166,0.2)",   Icon: IconPlus },
  accepted:           { title: "Task Accepted",         desc: "A worker accepted and started this task.",              color: "text-amber-300",   bg: "rgba(234,179,8,0.08)",    border: "rgba(234,179,8,0.2)",    Icon: IconZap },
  submitted:          { title: "Work Submitted",        desc: "The worker submitted proof for creator review.",        color: "text-sky-300",     bg: "rgba(56,189,248,0.08)",   border: "rgba(56,189,248,0.2)",   Icon: IconCheck },
  revision_requested: { title: "Revision Requested",   desc: "The creator requested changes before approval.",        color: "text-orange-300",  bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.2)",   Icon: IconArrowRight },
  approved:           { title: "Submission Approved",  desc: "The creator approved the work — payment queued.",       color: "text-green-300",   bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.2)",    Icon: IconCheck },
  paid:               { title: "Payment Released",     desc: "cUSD was transferred to the worker's wallet.",          color: "text-fuchsia-300", bg: "rgba(217,70,239,0.08)",   border: "rgba(217,70,239,0.2)",   Icon: IconCoin },
  cancelled:          { title: "Task Cancelled",       desc: "The creator cancelled this task.",                      color: "text-red-400",     bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.2)",  Icon: IconX },
};

const FILTERS: { label: string; value: ActivityType | "all"; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "All",       value: "all",               icon: IconZap },
  { label: "Created",   value: "created",           icon: IconPlus },
  { label: "Accepted",  value: "accepted",          icon: IconZap },
  { label: "Submitted", value: "submitted",         icon: IconCheck },
  { label: "Approved",  value: "approved",          icon: IconCheck },
  { label: "Paid",      value: "paid",              icon: IconCoin },
  { label: "Cancelled", value: "cancelled",         icon: IconX },
];

const STAT_ICONS = [
  { label: "Open Tasks",    key: "openTasks",       icon: IconSearch,  color: "text-teal-400",    bg: "rgba(20,184,166,0.08)",  border: "rgba(20,184,166,0.2)",  desc: "Tasks available to accept" },
  { label: "In Progress",   key: "inProgressTasks", icon: IconZap,     color: "text-amber-300",   bg: "rgba(234,179,8,0.08)",   border: "rgba(234,179,8,0.2)",   desc: "Tasks actively being worked" },
  { label: "Needs Review",  key: "reviewQueue",     icon: IconCheck,   color: "text-sky-300",     bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)",  desc: "Submissions awaiting approval" },
  { label: "Ready to Pay",  key: "readyForPayout",  icon: IconCoin,    color: "text-fuchsia-300", bg: "rgba(217,70,239,0.08)",  border: "rgba(217,70,239,0.2)",  desc: "Approved work pending payment" },
] as const;

export default function ActivityPage() {
  const { activity, stats, currentUser, loading: storeLoading } = useTaskStore();
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [myOnly, setMyOnly] = useState(false);

  const filtered = activity
    .filter((a) => myOnly ? a.actor === currentUser : true)
    .filter((a) => filter === "all" ? true : a.type === filter);

  if (storeLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5 sm:gap-6">

      {/* Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <IconZap className="w-4 h-4 text-sky-400" />
          <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold">Activity Feed</p>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">Platform activity</h1>
        <p className="text-slate-400 text-sm">Every task event — created, accepted, submitted, approved, and paid — in one live stream.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_ICONS.map(({ label, key, icon: Icon, color, bg, border, desc }) => (
          <div key={label} className="glass-card rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-slate-400 text-xs font-medium">{label}</p>
            </div>
            <p className="text-white text-3xl font-bold leading-none">{stats[key]}</p>
            <p className="text-slate-600 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {FILTERS.map(({ label, value, icon: Icon }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === value ? "border-sky-500/50 text-sky-400 bg-sky-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
            }`}>
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
        <button onClick={() => setMyOnly((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ml-auto flex items-center gap-1.5 ${
            myOnly ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
          }`}>
          <IconCheck className="w-3 h-3" />{myOnly ? "My Activity" : "All Users"}
        </button>
      </div>

      {/* Feed */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(56,189,248,0.08)" }}>
              <IconZap className="w-6 h-6 text-sky-400/60" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {filter === "all" ? "No activity yet" : `No "${filter}" events yet`}
              </p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                Activity appears here as tasks move through the workflow.
              </p>
            </div>
            {filter === "all" && (
              <Link href="/dashboard" className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
                Browse Tasks <IconArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : filtered.map((item) => {
          const meta = LABELS[item.type] ?? LABELS.created;
          const { title, desc, color, bg, border, Icon } = meta;
          return (
            <div key={item.id}
              className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:border-white/20"
              style={{ background: "rgba(255,255,255,0.025)", borderColor: border }}>
              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className={`text-sm font-semibold ${color}`}>{title}</p>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <IconClock className="w-3 h-3" />{new Date(item.at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white font-medium text-sm truncate">{item.taskTitle}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                {item.note && item.note !== desc && (
                  <p className="text-slate-300 text-xs mt-1 italic">&ldquo;{item.note}&rdquo;</p>
                )}
                <p className="text-slate-600 text-xs mt-1.5 font-mono">{item.actor}</p>
              </div>
              {/* Action */}
              <Link href={`/task/${item.taskId}`}
                className="outline-btn text-slate-200 text-xs px-4 py-2 rounded-xl self-start sm:self-center flex items-center gap-1.5 shrink-0">
                View Task <IconArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
