"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTaskStore } from "@/lib/taskStore";
import { getSupabase } from "@/utils/supabase/client";
import {
  IconUsers, IconCheck, IconCoin, IconSearch, IconX, IconZap,
  IconShield, IconTrendingUp, IconStar, IconArrowRight, IconClock,
} from "@/components/Icons";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  wallet: string;
  display_name: string | null;
  email: string | null;
  role: "user" | "admin";
  is_verified: boolean;
  created_at: string;
}

type AdminTab = "overview" | "users" | "tasks" | "activity";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, desc, color, bg, border }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; desc: string;
  color: string; bg: string; border: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-white text-3xl font-bold leading-none">{value}</p>
      <p className="text-slate-600 text-xs">{desc}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { profile, tasks, activity } = useTaskStore();
  const { toasts, addToast, removeToast } = useToast();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Guard — redirect non-admins
  useEffect(() => {
    if (profile !== null && profile.role !== "admin") router.replace("/dashboard");
  }, [profile, router]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const { data } = await getSupabase().from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data ?? []) as AdminUser[]);
    setUsersLoading(false);
  }, []);

  useEffect(() => { if (profile?.role === "admin") fetchUsers(); }, [profile, fetchUsers]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function setRole(wallet: string, role: "user" | "admin") {
    setActionLoading(wallet);
    const { error } = await getSupabase().from("profiles").update({ role }).eq("wallet", wallet);
    if (error) { addToast("Failed to update role", "error"); }
    else { addToast(`Role updated to ${role}`, "success"); await fetchUsers(); }
    setActionLoading(null);
  }

  async function cancelTask(id: string) {
    setActionLoading(id);
    const { error } = await getSupabase().from("tasks").update({ status: "cancelled" }).eq("id", id);
    if (error) { addToast("Failed to cancel task", "error"); }
    else addToast("Task cancelled", "success");
    setActionLoading(null);
  }

  async function deleteTask(id: string) {
    setActionLoading(id);
    const { error } = await getSupabase().from("tasks").delete().eq("id", id);
    if (error) { addToast("Failed to delete task", "error"); }
    else addToast("Task deleted", "success");
    setActionLoading(null);
  }

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const totalPaid     = tasks.filter((t) => t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);
  const verifiedCount = users.filter((u) => u.is_verified).length;
  const adminCount    = users.filter((u) => u.role === "admin").length;

  const filteredUsers = users.filter((u) =>
    !search || u.wallet.includes(search.toLowerCase()) ||
    (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.creator.includes(search.toLowerCase())
  );

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview",  label: "Overview",  icon: IconTrendingUp },
    { id: "users",     label: "Users",     icon: IconUsers },
    { id: "tasks",     label: "Tasks",     icon: IconZap },
    { id: "activity",  label: "Activity",  icon: IconClock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5 sm:gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IconShield className="w-4 h-4 text-teal-400" />
            <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold">Admin Panel</p>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">CeloTasks Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Full platform control — users, tasks, activity, and roles.</p>
        </div>
        <Link href="/dashboard"
          className="outline-btn text-slate-300 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <IconArrowRight className="w-4 h-4 rotate-180" /> Back to App
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-1 justify-center ${
              tab === id ? "gradient-btn text-white" : "text-slate-400 hover:text-white"
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Search bar (tasks + users tabs) */}
      {(tab === "users" || tab === "tasks") && (
        <div className="relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "users" ? "Search by wallet, name, or email…" : "Search by title or creator…"}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={IconUsers}      label="Total Users"       value={users.length}                                  desc="Registered wallets"              color="text-teal-400"    bg="rgba(20,184,166,0.08)"  border="rgba(20,184,166,0.2)" />
            <StatCard icon={IconZap}        label="Total Tasks"       value={tasks.length}                                  desc="All time across all statuses"    color="text-amber-300"   bg="rgba(234,179,8,0.08)"   border="rgba(234,179,8,0.2)" />
            <StatCard icon={IconCoin}       label="Total Paid Out"    value={`$${totalPaid.toFixed(0)}`}                    desc="cUSD released to workers"        color="text-fuchsia-300" bg="rgba(217,70,239,0.08)"  border="rgba(217,70,239,0.2)" />
            <StatCard icon={IconShield}     label="KYC Verified"      value={verifiedCount}                                 desc={`${adminCount} admin(s)`}        color="text-green-400"   bg="rgba(34,197,94,0.08)"   border="rgba(34,197,94,0.2)" />
            <StatCard icon={IconCheck}      label="Open Tasks"        value={tasks.filter(t=>t.status==="open").length}     desc="Available to accept"             color="text-teal-400"    bg="rgba(20,184,166,0.08)"  border="rgba(20,184,166,0.2)" />
            <StatCard icon={IconTrendingUp} label="In Progress"       value={tasks.filter(t=>t.status==="in_progress").length} desc="Actively being worked"        color="text-amber-300"   bg="rgba(234,179,8,0.08)"   border="rgba(234,179,8,0.2)" />
            <StatCard icon={IconSearch}     label="Needs Review"      value={tasks.filter(t=>t.status==="submitted").length} desc="Awaiting creator approval"     color="text-sky-300"     bg="rgba(56,189,248,0.08)"  border="rgba(56,189,248,0.2)" />
            <StatCard icon={IconX}          label="Cancelled"         value={tasks.filter(t=>t.status==="cancelled").length} desc="Cancelled by creators"         color="text-red-400"     bg="rgba(248,113,113,0.08)" border="rgba(248,113,113,0.2)" />
          </div>

          {/* Recent activity preview */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconClock className="w-4 h-4 text-slate-400" />
                <p className="text-white font-semibold">Recent Activity</p>
              </div>
              <button onClick={() => setTab("activity")} className="text-teal-400 text-xs hover:text-teal-300 transition-colors flex items-center gap-1">
                View all <IconArrowRight className="w-3 h-3" />
              </button>
            </div>
            {activity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3 border border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
                  <IconZap className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{item.taskTitle}</p>
                  <p className="text-slate-500 text-xs">{item.type.replace("_", " ")} · {new Date(item.at).toLocaleString()}</p>
                </div>
                <Link href={`/task/${item.taskId}`} className="text-slate-500 hover:text-teal-400 transition-colors shrink-0">
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === "users" && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center gap-3">
            <IconUsers className="w-4 h-4 text-teal-400" />
            <p className="text-white font-semibold">All Users</p>
            <span className="text-slate-500 text-xs ml-auto">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-12">No users found.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filteredUsers.map((u) => (
                <div key={u.wallet} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ background: "linear-gradient(135deg,#14b8a6,#22c55e)", color: "#fff" }}>
                    {(u.display_name ?? u.wallet).slice(0, 2).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-white text-sm font-medium">{u.display_name ?? "—"}</p>
                      {u.role === "admin" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.3)" }}>
                          Admin
                        </span>
                      )}
                      {u.is_verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                          ✓ KYC
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs font-mono truncate">{u.wallet}</p>
                    {u.email && <p className="text-slate-600 text-xs">{u.email}</p>}
                    <p className="text-slate-700 text-xs mt-0.5">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  {/* Role toggle */}
                  <div className="flex gap-2 shrink-0">
                    {u.role === "user" ? (
                      <button
                        disabled={actionLoading === u.wallet}
                        onClick={() => setRole(u.wallet, "admin")}
                        className="text-xs px-3 py-1.5 rounded-xl border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors cursor-pointer disabled:opacity-50">
                        Make Admin
                      </button>
                    ) : (
                      <button
                        disabled={actionLoading === u.wallet || u.wallet === profile.wallet}
                        onClick={() => setRole(u.wallet, "user")}
                        className="text-xs px-3 py-1.5 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
                        Revoke Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TASKS ── */}
      {tab === "tasks" && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center gap-3">
            <IconZap className="w-4 h-4 text-amber-400" />
            <p className="text-white font-semibold">All Tasks</p>
            <span className="text-slate-500 text-xs ml-auto">{filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filteredTasks.map((task) => {
              const STATUS_COLOR: Record<string, string> = {
                open: "text-teal-400", in_progress: "text-amber-300", submitted: "text-sky-300",
                approved: "text-green-300", paid: "text-fuchsia-300", cancelled: "text-red-400",
              };
              return (
                <div key={task.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      <span className={`text-xs font-semibold ${STATUS_COLOR[task.status] ?? "text-slate-400"}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      <span className="text-teal-400 font-semibold">{task.reward} {task.currency}</span>
                      {" · "}{task.category}{" · "}{task.difficulty}
                    </p>
                    <p className="text-slate-600 text-xs font-mono mt-0.5">Creator: {task.creator}</p>
                    <p className="text-slate-700 text-xs">Deadline: {task.deadline}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/task/${task.id}`}
                      className="text-xs px-3 py-1.5 rounded-xl border border-white/[0.08] text-slate-300 hover:border-white/20 transition-colors flex items-center gap-1">
                      View <IconArrowRight className="w-3 h-3" />
                    </Link>
                    {task.status !== "cancelled" && task.status !== "paid" && (
                      <button
                        disabled={actionLoading === task.id}
                        onClick={() => cancelTask(task.id)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-amber-400/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50">
                        Cancel
                      </button>
                    )}
                    <button
                      disabled={actionLoading === task.id}
                      onClick={() => deleteTask(task.id)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === "activity" && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center gap-3">
            <IconClock className="w-4 h-4 text-sky-400" />
            <p className="text-white font-semibold">All Activity</p>
            <span className="text-slate-500 text-xs ml-auto">{activity.length} events</span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
            {activity.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}>
                  <IconZap className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white text-xs font-semibold">{item.type.replace("_", " ").toUpperCase()}</p>
                    <span className="text-slate-600 text-xs">{new Date(item.at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 text-xs truncate">{item.taskTitle}</p>
                  <p className="text-slate-500 text-xs font-mono">{item.actor}</p>
                  {item.note && <p className="text-slate-600 text-xs italic mt-0.5">&ldquo;{item.note}&rdquo;</p>}
                </div>
                <Link href={`/task/${item.taskId}`}
                  className="text-slate-600 hover:text-teal-400 transition-colors shrink-0">
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
