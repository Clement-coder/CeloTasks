"use client";
import { useAccount, useBalance } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
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
  const { setMyAddress, stats, reviewQueue, paymentQueue, myAcceptedTasks } = useTaskStore();

  useEffect(() => { if (address) setMyAddress(address); }, [address, setMyAddress]);

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
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back, <span className="text-white font-mono">{shortenAddress(address!)}</span></p>
        </div>
        <Link href="/create-task"
          className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2">
          <IconPlus className="w-4 h-4" />
          <span>Create Task</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
            <IconWallet className="w-5 h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Wallet</p>
            <p className="text-white font-semibold text-sm font-mono">{shortenAddress(address!)}</p>
            <p className="text-slate-600 text-xs mt-0.5 truncate">{address}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <IconTrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Balance</p>
            <p className="gradient-text font-bold text-xl leading-none">
              {balance ? `${(Number(balance.value) / 1e18).toFixed(4)}` : "—"}
            </p>
            <p className="text-slate-500 text-xs mt-1">{balance?.symbol ?? "CELO"} · Mainnet</p>
            {cusdBalance && <p className="text-slate-400 text-xs mt-0.5">{cusdBalance} <span className="text-slate-600">cUSD</span></p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <IconStar className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Reputation</p>
            <div className="flex items-center gap-2">
              <span className="gradient-text font-bold text-xl leading-none">{stats.successRate}%</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-400">Success rate</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${stats.successRate}%`, background: "linear-gradient(90deg, #14b8a6, #22c55e)" }} />
            </div>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span><span className="text-white font-medium">{myAcceptedTasks.length}</span> assigned</span>
              <span><span className="text-white font-medium">{reviewQueue.length}</span> in review</span>
              <span><span className="text-fuchsia-300 font-medium">{paymentQueue.length}</span> ready to pay</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(217,70,239,0.1)", border: "1px solid rgba(217,70,239,0.2)" }}>
            <IconCoin className="w-5 h-5 text-fuchsia-300" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Frontend Ops</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div>
                <p className="text-white text-lg font-semibold">{stats.openTasks}</p>
                <p>Open tasks</p>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">{stats.inProgressTasks}</p>
                <p>Active work</p>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">{stats.reviewQueue}</p>
                <p>Need review</p>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">{stats.readyForPayout}</p>
                <p>Need payout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/create-task" className="glass-card rounded-3xl p-5 hover:border-white/20 transition-colors">
          <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Creator Flow</p>
          <h3 className="text-white text-xl font-semibold">Post a structured task brief</h3>
          <p className="text-slate-400 text-sm mt-2">Set reward, deadline, deliverables, and review instructions with the full frontend composer.</p>
          <span className="text-teal-300 text-sm mt-4 inline-flex items-center gap-1.5">Open composer <IconArrowRight className="w-4 h-4" /></span>
        </Link>
        <Link href="/activity" className="glass-card rounded-3xl p-5 hover:border-white/20 transition-colors">
          <p className="text-sky-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Operations</p>
          <h3 className="text-white text-xl font-semibold">Track all workflow events</h3>
          <p className="text-slate-400 text-sm mt-2">Watch mock activity for publish, accept, submit, approve, and payout events in one place.</p>
          <span className="text-sky-300 text-sm mt-4 inline-flex items-center gap-1.5">View activity <IconArrowRight className="w-4 h-4" /></span>
        </Link>
        <Link href="/profile" className="glass-card rounded-3xl p-5 hover:border-white/20 transition-colors">
          <p className="text-fuchsia-300 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Reputation</p>
          <h3 className="text-white text-xl font-semibold">See the worker and creator profile</h3>
          <p className="text-slate-400 text-sm mt-2">Earnings, spend, task mix, reliability, and delivery history are all surfaced on the frontend.</p>
          <span className="text-fuchsia-300 text-sm mt-4 inline-flex items-center gap-1.5">Open profile <IconArrowRight className="w-4 h-4" /></span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["browse", "my"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
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
