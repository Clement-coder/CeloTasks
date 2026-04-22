"use client";
import { IconCheck, IconCoin, IconUsers, IconZap } from "@/components/Icons";
import { useTaskStore } from "@/lib/taskStore";
import { useOnchainStats } from "@/hooks/useOnchainStats";

const STATS = [
  { icon: IconCheck, label: "Tasks Completed", desc: "Total paid tasks",        color: "text-teal-400",    bg: "rgba(20,184,166,0.1)",  border: "rgba(20,184,166,0.2)" },
  { icon: IconCoin,  label: "Paid Out",         desc: "Total cUSD distributed", color: "text-green-400",   bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)" },
  { icon: IconUsers, label: "Active Users",     desc: "Unique wallets",         color: "text-amber-400",   bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.2)" },
  { icon: IconZap,   label: "Avg. Settlement",  desc: "Payment speed on Celo",  color: "text-fuchsia-400", bg: "rgba(217,70,239,0.1)",  border: "rgba(217,70,239,0.2)" },
] as const;

export default function LiveStats() {
  const { tasks, activity } = useTaskStore();
  const { onchainTaskCount } = useOnchainStats();
  const paid = tasks.filter((t) => t.status === "paid");
  const totalEarnings = paid.reduce((sum, t) => sum + Number(t.reward), 0);
  const uniqueUsers = new Set(tasks.flatMap((t) => [t.creator, t.acceptor].filter(Boolean))).size;

  const values = [
    onchainTaskCount !== null ? `${onchainTaskCount}` : `${activity.length}+`,
    `$${totalEarnings.toFixed(0)}+`,
    `${uniqueUsers}+`,
    "< 3s",
  ];

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
      {STATS.map(({ icon: Icon, label, desc, color, bg, border }, i) => (
        <div key={label} className="flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className={`font-bold text-3xl leading-none ${color}`}>{values[i]}</p>
            <p className="text-white text-sm font-semibold mt-1.5">{label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
