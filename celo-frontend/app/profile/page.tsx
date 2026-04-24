"use client";

import { useAccount } from "wagmi";
import { usePrivy, useLoginWithOAuth } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { IconCheck, IconCoin, IconPlus, IconStar, IconTrendingUp, IconWallet, IconArrowRight, IconUsers, IconShield } from "@/components/Icons";
import { useTaskStore, type TaskStatus } from "@/lib/taskStore";
import Link from "next/link";
import { shortenAddress } from "@/lib/wagmi";
import ConfirmDialog from "@/components/ConfirmDialog";
import WalletModal from "@/components/WalletModal";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import KYCButton from "@/components/KYCButton";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import { getSupabase } from "@/utils/supabase/client";
import { useReputationScore } from "@/hooks/useReputationScore";

export default function ProfilePage() {
  const { address } = useAccount();
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { currentUser, myAcceptedTasks, myCreatedTasks, stats, profile, loading: storeLoading } = useTaskStore();
  const { score: repScore, level: repLevel } = useReputationScore(address);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [payments, setPayments] = useState<{ tx_hash: string; amount_cusd: number; confirmed_at: string; to_address: string }[]>([]);

  useEffect(() => {
    if (!address) return;
    const lower = address.toLowerCase();
    getSupabase()
      .from("ratings")
      .select("stars")
      .eq("ratee_wallet", lower)
      .then(({ data }: { data: { stars: number }[] | null }) => {
        if (!data || data.length === 0) return;
        const avg = data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setRatingCount(data.length);
      });
    getSupabase()
      .from("onchain_payments")
      .select("tx_hash, amount_cusd, confirmed_at, to_address")
      .or(`from_address.eq.${lower},to_address.eq.${lower}`)
      .order("confirmed_at", { ascending: false })
      .limit(10)
      .then(({ data }: { data: { tx_hash: string; amount_cusd: number; confirmed_at: string; to_address: string }[] | null }) => {
        if (data) setPayments(data);
      });
  }, [address]);

  const privyEmail = user?.email?.address ?? user?.google?.email ?? null;
  const privyName  = user?.google?.name ?? null;

  const displayName  = profile?.displayName ?? privyName ?? null;
  const displayEmail = profile?.email ?? privyEmail ?? null;
  const avatarUrl    = profile?.avatarUrl ?? null;
  const isVerified   = profile?.isVerified ?? false;

  const isProfileIncomplete = authenticated && (!displayName || !displayEmail);

  const categoryCounts = [...myAcceptedTasks, ...myCreatedTasks].reduce<Record<string, number>>((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  if (storeLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5 sm:gap-6">

      {/* ── KYC banner ── */}
      {authenticated && !isVerified && (
        <div className="rounded-2xl px-5 py-4 border border-sky-400/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ background: "rgba(56,189,248,0.07)" }}>
          <div className="flex items-start gap-3">
            <IconShield className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sky-300 text-sm font-semibold">Verify your identity</p>
              <p className="text-slate-400 text-xs mt-0.5">Complete KYC to build trust with task creators and workers.</p>
            </div>
          </div>
          <div className="self-start sm:self-auto shrink-0">
            <KYCButton
              wallet={address ?? null}
              onSuccess={(vid) => addToast(`Verification successful ✅ (ID: ${vid.slice(0, 8)}…)`, "success")}
              onFailure={() => addToast("Verification failed. Please try again.", "error")}
            />
          </div>
        </div>
      )}
      {isProfileIncomplete && (
        <div className="rounded-2xl px-5 py-4 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ background: "rgba(234,179,8,0.07)" }}>
          <div className="flex items-start gap-3">
            <IconUsers className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-semibold">Complete your profile</p>
              <p className="text-slate-400 text-xs mt-0.5">Add your name and email so task creators and workers can identify you.</p>
            </div>
          </div>
          <button onClick={() => setProfileOpen(true)}
            className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shrink-0 self-start sm:self-auto">
            Complete Profile
          </button>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="rounded-[2rem] p-5 sm:p-10 border border-white/[0.08] relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.18), rgba(34,197,94,0.08), rgba(217,70,239,0.08))" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 30%)" }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <button onClick={() => setProfileOpen(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-teal-500/40 transition-colors shrink-0 cursor-pointer flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.1)" }}>
              {avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <IconUsers className="w-7 h-7 text-teal-400/60" />}
            </button>
            <div>
              <p className="text-teal-300 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Profile</p>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
                {displayName ?? (address ? shortenAddress(address) : "Anonymous")}
                {isVerified && <VerifiedBadge />}
              </h1>
              {displayEmail && <p className="text-slate-400 text-sm mt-1">{displayEmail}</p>}
              {!displayName && (
                <button onClick={() => setProfileOpen(true)}
                  className="text-teal-400 text-xs mt-1 hover:text-teal-300 transition-colors underline underline-offset-2 cursor-pointer">
                  + Add display name
                </button>
              )}
              {repScore > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2.5 py-1 rounded-full border border-teal-500/30 text-teal-300"
                    style={{ background: "rgba(20,184,166,0.1)" }}>
                    {repLevel} · {repScore}/100
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl px-5 py-4 border border-white/[0.08] flex flex-col gap-3"
            style={{ background: "rgba(11,15,20,0.35)" }}>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Wallet</p>
              <p className="text-white font-mono text-sm">{authenticated && address ? shortenAddress(address) : "Not connected"}</p>
            </div>
            {authenticated ? (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setWalletOpen(true)}
                  className="gradient-btn text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5">
                  <IconWallet className="w-3.5 h-3.5" /> Wallet
                </button>
                <button onClick={() => setProfileOpen(true)}
                  className="outline-btn text-slate-300 text-xs px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5">
                  <IconUsers className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button onClick={() => setConfirmLogout(true)}
                  className="outline-btn text-slate-300 text-xs px-3 py-1.5 rounded-xl cursor-pointer">
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={() => initOAuth({ provider: "google" })} disabled={!ready}
                  className="gradient-btn text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                  <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button onClick={login} disabled={!ready}
                  className="outline-btn text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                  <IconWallet className="w-3.5 h-3.5" /> More
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Tasks Created", value: myCreatedTasks.length,          icon: <IconPlus className="w-5 h-5 text-teal-400" /> },
          { label: "Tasks Worked",  value: myAcceptedTasks.length,         icon: <IconCheck className="w-5 h-5 text-green-300" /> },
          { label: "Total Earned",  value: `${stats.earnings.toFixed(0)} cUSD`, icon: <IconCoin className="w-5 h-5 text-fuchsia-300" /> },
          { label: "Success Rate",  value: `${stats.successRate}%`,        icon: <IconTrendingUp className="w-5 h-5 text-amber-300" /> },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-3xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              {item.icon}
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-white text-2xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Rating badge ── */}
      {avgRating !== null && (
        <div className="rounded-2xl px-5 py-4 border border-amber-400/20 flex items-center gap-4"
          style={{ background: "rgba(234,179,8,0.07)" }}>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <IconStar key={n} className={`w-5 h-5 ${n <= Math.round(avgRating) ? "text-amber-400" : "text-slate-600"}`} />
            ))}
          </div>
          <div>
            <p className="text-amber-300 font-semibold text-sm">{avgRating} / 5 average rating</p>
            <p className="text-slate-500 text-xs">Based on {ratingCount} review{ratingCount !== 1 ? "s" : ""} from task creators</p>
          </div>
        </div>
      )}

      {/* ── Role breakdown + categories ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <IconStar className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Role Breakdown</p>
              <p className="text-slate-500 text-sm">Creator vs worker metrics.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Creator</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Tasks posted</span><span className="text-white">{myCreatedTasks.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Paid out</span><span className="text-white">{stats.spend.toFixed(0)} cUSD</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Waiting review</span><span className="text-white">{stats.reviewQueue}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ready to release</span><span className="text-white">{stats.readyForPayout}</span></div>
              </div>
            </div>
            <div className="rounded-2xl p-5 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Worker</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Accepted</span><span className="text-white">{myAcceptedTasks.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Paid completions</span><span className="text-white">{myAcceptedTasks.filter((t) => t.status === "paid").length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Earnings</span><span className="text-white">{stats.earnings.toFixed(0)} cUSD</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Reliability</span><span className="text-white">{stats.successRate}%</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <IconWallet className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Top Categories</p>
              <p className="text-slate-500 text-sm">Based on your task history.</p>
            </div>
          </div>
          <div className="space-y-3">
            {topCategories.length > 0 ? topCategories.map(([cat, count]) => {
              const maxCount = topCategories[0][1];
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-white font-medium">{count} task{count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: "linear-gradient(90deg, #14b8a6, #22c55e, #38bdf8)" }} />
                  </div>
                </div>
              );
            }) : <p className="text-slate-500 text-sm">No category data yet.</p>}
          </div>
        </section>
      </div>

      {/* ── Task history ── */}
      <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
        <div>
          <p className="text-white font-semibold">Task History</p>
          <p className="text-slate-500 text-sm">All tasks you created or worked on.</p>
        </div>
        {[...myCreatedTasks, ...myAcceptedTasks.filter((t) => !myCreatedTasks.find((c) => c.id === t.id))].length === 0 ? (
          <p className="text-slate-500 text-sm">No tasks yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...myCreatedTasks, ...myAcceptedTasks.filter((t) => !myCreatedTasks.find((c) => c.id === t.id))]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((task) => {
                const STATUS_COLORS: Record<TaskStatus, string> = {
                  draft: "text-slate-400", open: "text-teal-400", in_progress: "text-amber-300", submitted: "text-sky-300",
                  approved: "text-green-300", paid: "text-fuchsia-300", cancelled: "text-red-400",
                };
                const role = task.creator === currentUser ? "Creator" : "Worker";
                return (
                  <Link key={task.id} href={`/task/${task.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl p-4 border border-white/[0.08] hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        <span className={STATUS_COLORS[task.status]}>{task.status.replace("_", " ")}</span>
                        {" · "}{role}{" · "}{task.reward} {task.currency}
                      </p>
                    </div>
                    <IconArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </Link>
                );
              })}
          </div>
        )}
      </section>

      {/* ── Onchain payment history ── */}
      {payments.length > 0 && (
        <section className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <div>
            <p className="text-white font-semibold">Onchain Payment History</p>
            <p className="text-slate-500 text-sm">Verified cUSD transfers recorded on Celo.</p>
          </div>
          <div className="flex flex-col gap-2">
            {payments.map((p) => (
              <a key={p.tx_hash} href={`https://celoscan.io/tx/${p.tx_hash}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl p-4 border border-white/[0.08] hover:border-white/20 transition-colors"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-mono text-xs truncate">{p.tx_hash}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {p.to_address === address?.toLowerCase() ? "Received" : "Sent"} · {new Date(p.confirmed_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-bold text-sm shrink-0 ${p.to_address === address?.toLowerCase() ? "text-teal-400" : "text-fuchsia-400"}`}>
                  {p.to_address === address?.toLowerCase() ? "+" : "-"}{p.amount_cusd} cUSD
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmLogout}
        title="Disconnect wallet?"
        message="You'll be signed out and your wallet will be disconnected. You can reconnect anytime."
        confirmLabel="Disconnect"
        danger
        onConfirm={() => { setConfirmLogout(false); logout(); }}
        onCancel={() => setConfirmLogout(false)}
      />
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <CompleteProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
