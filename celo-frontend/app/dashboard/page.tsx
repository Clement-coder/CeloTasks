"use client";
import { useAccount, useBalance } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import Link from "next/link";
import { shortenAddress } from "@/lib/wagmi";
import BrowseTasks from "@/components/BrowseTasks";
import MyTasks from "@/components/MyTasks";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import { IconArrowRight, IconCheck, IconCoin, IconLock, IconPlus, IconStar, IconTrendingUp, IconWallet } from "@/components/Icons";
import { useCUSDBalance } from "@/hooks/useCUSDBalance";
import { useTaskStore } from "@/lib/taskStore";

type Tab = "browse" | "my";

export default function DashboardPage() {
  const { address } = useAccount();
  const { login, ready, authenticated } = usePrivy();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });
  const { balance: cusdBalance } = useCUSDBalance(address);
  const [tab, setTab] = useState<Tab>("browse");
  const { toasts, addToast, removeToast } = useToast();
  const { stats, reviewQueue, paymentQueue, myAcceptedTasks } = useTaskStore();

  if (!authenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
          <IconLock className="w-7 h-7 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect your wallet</h2>
          <p className="text-slate-400 max-w-xs mx-auto">You need a wallet to access the dashboard and interact with tasks.</p>
        </div>
        <button onClick={login} disabled={!ready}
          className="gradient-btn text-white font-semibold px-8 py-3.5 rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50">
          <IconWallet className="w-4 h-4" />
          Connect Wallet
        </button>
        <p className="text-slate-600 text-xs">Works with MiniPay, email, Google, and any wallet</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-5 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Welcome back, <span className="text-white font-mono">{shortenAddress(address!)}</span></p>
        </div>
        <Link href="/create-task"
          className="gradient-btn text-white text-xs sm:text-sm font-semibold px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 sm:gap-2">
          <IconPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Create Task</span>
          <span className="xs:hidden">Create</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-3 sm:p-5 flex gap-2 sm:gap-4 items-start">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
            <IconWallet className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-[10px] sm:text-xs mb-0.5 uppercase tracking-wider">Wallet</p>
            <p className="text-white font-semibold text-xs sm:text-sm font-mono truncate">{shortenAddress(address!)}</p>
            <p className="text-slate-600 text-[10px] mt-0.5 truncate hidden sm:block">{address}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 sm:p-5 flex gap-2 sm:gap-4 items-start">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <IconTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] sm:text-xs mb-0.5 uppercase tracking-wider">Balance</p>
            <p className="gradient-text font-bold text-base sm:text-xl leading-none">
              {balance ? `${(Number(balance.value) / 1e18).toFixed(2)}` : "—"}
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">{balance?.symbol ?? "CELO"}</p>
            {cusdBalance && <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">{cusdBalance} <span className="text-slate-600">cUSD</span></p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 sm:p-5 flex gap-2 sm:gap-4 items-start">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <IconStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[10px] sm:text-xs mb-0.5 uppercase tracking-wider">Reputation</p>
            <span className="gradient-text font-bold text-base sm:text-xl leading-none">{stats.successRate}%</span>
            <div className="mt-1.5 h-1 sm:h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${stats.successRate}%`, background: "linear-gradient(90deg, #14b8a6, #22c55e)" }} />
            </div>
            <div className="flex gap-2 mt-1.5 text-[10px] sm:text-xs text-slate-500 flex-wrap">
              <span><span className="text-white font-medium">{myAcceptedTasks.length}</span> assigned</span>
              <span><span className="text-fuchsia-300 font-medium">{paymentQueue.length}</span> to pay</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 sm:p-5 flex gap-2 sm:gap-4 items-start">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(217,70,239,0.1)", border: "1px solid rgba(217,70,239,0.2)" }}>
            <IconCoin className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-300" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-[10px] sm:text-xs mb-1 uppercase tracking-wider">Ops</p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
              <div><p className="text-white text-sm sm:text-lg font-semibold">{stats.openTasks}</p><p>Open</p></div>
              <div><p className="text-white text-sm sm:text-lg font-semibold">{stats.inProgressTasks}</p><p>Active</p></div>
              <div><p className="text-white text-sm sm:text-lg font-semibold">{stats.reviewQueue}</p><p>Review</p></div>
              <div><p className="text-white text-sm sm:text-lg font-semibold">{stats.readyForPayout}</p><p>Payout</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/create-task" className="glass-card rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-colors">
          <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-1.5">Creator Flow</p>
          <h3 className="text-white text-base sm:text-xl font-semibold">Post a structured task brief</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">Set reward, deadline, deliverables, and review instructions.</p>
          <span className="text-teal-300 text-xs sm:text-sm mt-3 inline-flex items-center gap-1.5">Open composer <IconArrowRight className="w-3.5 h-3.5" /></span>
        </Link>
        <Link href="/activity" className="glass-card rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-colors">
          <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold mb-1.5">Operations</p>
          <h3 className="text-white text-base sm:text-xl font-semibold">Track all workflow events</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">Watch activity for publish, accept, submit, approve, and payout.</p>
          <span className="text-sky-300 text-xs sm:text-sm mt-3 inline-flex items-center gap-1.5">View activity <IconArrowRight className="w-3.5 h-3.5" /></span>
        </Link>
        <Link href="/profile" className="glass-card rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-colors">
          <p className="text-fuchsia-300 text-xs uppercase tracking-[0.2em] font-semibold mb-1.5">Reputation</p>
          <h3 className="text-white text-base sm:text-xl font-semibold">Worker and creator profile</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">Earnings, spend, task mix, reliability, and delivery history.</p>
          <span className="text-fuchsia-300 text-xs sm:text-sm mt-3 inline-flex items-center gap-1.5">Open profile <IconArrowRight className="w-3.5 h-3.5" /></span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-full sm:w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["browse", "my"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              tab === t ? "gradient-btn text-white" : "text-slate-400 hover:text-white"
            }`}>
            {t === "browse" ? "Browse Tasks" : "My Tasks"}
          </button>
        ))}
      </div>

      {tab === "browse"
        ? <BrowseTasks onToast={addToast} />
        : <MyTasks onToast={addToast} />
      }

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
