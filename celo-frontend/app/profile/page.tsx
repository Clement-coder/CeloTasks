"use client";

import { IconCheck, IconCoin, IconPlus, IconStar, IconTrendingUp, IconWallet } from "@/components/Icons";
import { useTaskStore } from "@/lib/taskStore";

export default function ProfilePage() {
  const { currentUser, myAcceptedTasks, myCreatedTasks, stats } = useTaskStore();

  const categoryCounts = [...myAcceptedTasks, ...myCreatedTasks].reduce<Record<string, number>>((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6">
      <section className="rounded-[2rem] p-8 sm:p-10 border border-white/[0.08] relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.18), rgba(34,197,94,0.08), rgba(217,70,239,0.08))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 30%)" }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div>
            <p className="text-teal-300 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Profile</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Worker reputation and creator history</h1>
            <p className="text-slate-200/80 mt-3 max-w-2xl">
              A frontend-first profile for earnings, payout behavior, review health, and the kind of work you tend to create or complete.
            </p>
          </div>
          <div className="rounded-3xl px-5 py-4 border border-white/[0.08]" style={{ background: "rgba(11,15,20,0.35)" }}>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Active identity</p>
            <p className="text-white font-mono">{currentUser}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Tasks Created", value: myCreatedTasks.length, icon: <IconPlus className="w-5 h-5 text-teal-400" /> },
          { label: "Tasks Worked", value: myAcceptedTasks.length, icon: <IconCheck className="w-5 h-5 text-green-300" /> },
          { label: "Total Earned", value: `${stats.earnings.toFixed(0)} cUSD`, icon: <IconCoin className="w-5 h-5 text-fuchsia-300" /> },
          { label: "Success Rate", value: `${stats.successRate}%`, icon: <IconTrendingUp className="w-5 h-5 text-amber-300" /> },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-3xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              {item.icon}
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-white text-2xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <IconStar className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Role Breakdown</p>
              <p className="text-slate-500 text-sm">How you behave as both creator and worker.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Creator Metrics</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Tasks posted</span><span className="text-white">{myCreatedTasks.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Paid out</span><span className="text-white">{stats.spend.toFixed(0)} cUSD</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Waiting review</span><span className="text-white">{stats.reviewQueue}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Ready to release</span><span className="text-white">{stats.readyForPayout}</span></div>
              </div>
            </div>
            <div className="rounded-2xl p-5 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Worker Metrics</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Accepted tasks</span><span className="text-white">{myAcceptedTasks.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Paid completions</span><span className="text-white">{myAcceptedTasks.filter((task) => task.status === "paid").length}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Current earnings</span><span className="text-white">{stats.earnings.toFixed(0)} cUSD</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Current reliability</span><span className="text-white">{stats.successRate}%</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <IconWallet className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Top Categories</p>
              <p className="text-slate-500 text-sm">What your frontend history says about your work profile.</p>
            </div>
          </div>

          <div className="space-y-3">
            {topCategories.length > 0 ? topCategories.map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300">{category}</span>
                  <span className="text-white font-medium">{count} task{count === 1 ? "" : "s"}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, count * 20)}%`, background: "linear-gradient(90deg, #14b8a6, #22c55e, #38bdf8)" }} />
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm">No category data yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
