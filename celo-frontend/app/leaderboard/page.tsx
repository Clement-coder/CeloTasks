"use client";
import { useMemo } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { IconCoin, IconCheck, IconTrendingUp, IconStar } from "@/components/Icons";
import Link from "next/link";

export default function LeaderboardPage() {
  const { tasks } = useTaskStore();

  const workers = useMemo(() => {
    const map: Record<string, { wallet: string; earned: number; completed: number; accepted: number }> = {};
    for (const t of tasks) {
      if (!t.acceptor) continue;
      if (!map[t.acceptor]) map[t.acceptor] = { wallet: t.acceptor, earned: 0, completed: 0, accepted: 0 };
      map[t.acceptor].accepted++;
      if (t.status === "paid") {
        map[t.acceptor].earned += Number(t.reward);
        map[t.acceptor].completed++;
      }
    }
    return Object.values(map)
      .sort((a, b) => b.earned - a.earned || b.completed - a.completed)
      .slice(0, 20);
  }, [tasks]);

  const creators = useMemo(() => {
    const map: Record<string, { wallet: string; posted: number; paid: number; spend: number }> = {};
    for (const t of tasks) {
      if (!map[t.creator]) map[t.creator] = { wallet: t.creator, posted: 0, paid: 0, spend: 0 };
      map[t.creator].posted++;
      if (t.status === "paid") {
        map[t.creator].paid++;
        map[t.creator].spend += Number(t.reward);
      }
    }
    return Object.values(map)
      .sort((a, b) => b.spend - a.spend || b.paid - a.paid)
      .slice(0, 20);
  }, [tasks]);

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-6">
      <div>
        <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Rankings</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">Top earners and most active task creators on CeloTasks.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Workers */}
        <section className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(20,184,166,0.1)" }}>
              <IconCoin className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Top Earners</p>
              <p className="text-slate-500 text-xs">Workers ranked by cUSD earned</p>
            </div>
          </div>
          {workers.length === 0 ? (
            <p className="text-slate-500 text-sm">No completed tasks yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {workers.map((w, i) => (
                <div key={w.wallet} className="flex items-center gap-3 rounded-2xl p-3 border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-lg w-7 text-center shrink-0">{MEDAL[i] ?? `${i + 1}`}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-mono text-xs truncate">{w.wallet}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{w.completed} task{w.completed !== 1 ? "s" : ""} completed</p>
                  </div>
                  <span className="text-teal-400 font-bold text-sm shrink-0">{w.earned.toFixed(0)} cUSD</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Creators */}
        <section className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(217,70,239,0.1)" }}>
              <IconStar className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Top Creators</p>
              <p className="text-slate-500 text-xs">Task posters ranked by total paid out</p>
            </div>
          </div>
          {creators.length === 0 ? (
            <p className="text-slate-500 text-sm">No paid tasks yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {creators.map((c, i) => (
                <div key={c.wallet} className="flex items-center gap-3 rounded-2xl p-3 border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-lg w-7 text-center shrink-0">{MEDAL[i] ?? `${i + 1}`}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-mono text-xs truncate">{c.wallet}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{c.posted} posted · {c.paid} paid</p>
                  </div>
                  <span className="text-fuchsia-400 font-bold text-sm shrink-0">{c.spend.toFixed(0)} cUSD</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="outline-btn text-slate-300 text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
          <IconTrendingUp className="w-4 h-4" /> Browse Tasks
        </Link>
        <Link href="/profile" className="outline-btn text-slate-300 text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
          <IconCheck className="w-4 h-4" /> My Profile
        </Link>
      </div>
    </div>
  );
}
