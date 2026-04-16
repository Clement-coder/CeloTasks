"use client";
import { IconCheck, IconCoin, IconClock, IconUsers } from "@/components/Icons";
import { useTaskStore } from "@/lib/taskStore";

export default function LiveStats() {
  const { tasks, activity } = useTaskStore();
  const paid = tasks.filter((t) => t.status === "paid");
  const totalEarnings = paid.reduce((sum, t) => sum + Number(t.reward), 0);
  const uniqueUsers = new Set(tasks.flatMap((t) => [t.creator, t.acceptor].filter(Boolean))).size;

  const stats = [
    { Icon: IconCheck,      value: `${activity.length}+`,        label: "Tasks Completed" },
    { Icon: IconCoin,       value: `$${totalEarnings.toFixed(0)}+`, label: "Paid Out" },
    { Icon: IconUsers,      value: `${uniqueUsers}+`,            label: "Active Users" },
    { Icon: IconClock,      value: "< 3s",                        label: "Avg. Settlement" },
  ];

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
      {stats.map(({ Icon, value, label }) => (
        <div key={label} className="flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
            <Icon className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="gradient-text font-bold text-3xl leading-none">{value}</p>
            <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-wider">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
