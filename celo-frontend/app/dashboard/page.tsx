"use client";
import { useAccount, useConnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect } from "react";
import { shortenAddress } from "@/lib/wagmi";
import BrowseTasks from "@/components/BrowseTasks";
import MyTasks from "@/components/MyTasks";
import Modal from "@/components/Modal";
import CreateTaskForm from "@/components/CreateTaskForm";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import { IconWallet, IconTrendingUp, IconStar, IconLock, IconPlus } from "@/components/Icons";
import { useCUSDBalance } from "@/hooks/useCUSDBalance";
import { useTaskStore } from "@/lib/taskStore";

type Tab = "browse" | "my";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });
  const { balance: cusdBalance } = useCUSDBalance(address);
  const [tab, setTab] = useState<Tab>("browse");
  const [showCreate, setShowCreate] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const { setMyAddress } = useTaskStore();

  // Sync wallet address into task store
  useEffect(() => {
    if (address) setMyAddress(address);
  }, [address, setMyAddress]);

  if (!isConnected) {
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
        <button onClick={() => connect({ connector: injected() })}
          className="gradient-btn text-white font-semibold px-8 py-3.5 rounded-xl cursor-pointer flex items-center gap-2">
          <IconWallet className="w-4 h-4" />
          Connect Wallet
        </button>
        <p className="text-slate-600 text-xs">Works with MiniPay, MetaMask, and any injected wallet</p>
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
        <button onClick={() => setShowCreate(true)}
          className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2">
          <IconPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Task</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <span className="gradient-text font-bold text-xl leading-none">847</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-400">Top 12%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "84.7%", background: "linear-gradient(90deg, #14b8a6, #22c55e)" }} />
            </div>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span><span className="text-white font-medium">12</span> completed</span>
              <span><span className="text-white font-medium">3</span> created</span>
              <span><span className="text-green-400 font-medium">92%</span> success</span>
            </div>
          </div>
        </div>
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
        ? <BrowseTasks onToast={addToast} onCreateTask={() => setShowCreate(true)} />
        : <MyTasks onToast={addToast} />
      }

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <CreateTaskForm
          onSuccess={() => { setShowCreate(false); addToast("Task created!", "success"); }}
          onToast={addToast}
        />
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
