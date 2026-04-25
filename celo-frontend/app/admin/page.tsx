"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTaskStore } from "@/lib/taskStore";
import { getSupabase } from "@/utils/supabase/client";
import {
  IconUsers, IconCheck, IconCoin, IconSearch, IconX, IconZap,
  IconShield, IconTrendingUp, IconArrowRight, IconClock, IconStar, IconPlus,
} from "@/components/Icons";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";

interface AdminUser {
  wallet: string;
  display_name: string | null;
  email: string | null;
  role: "user" | "admin";
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  verification_id: string | null;
}

type AdminTab = "overview" | "users" | "tasks" | "activity";

const STATUS_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  open:        { color: "#2dd4bf",  bg: "rgba(20,184,166,0.1)",   border: "rgba(20,184,166,0.25)" },
  in_progress: { color: "#fcd34d",  bg: "rgba(234,179,8,0.1)",    border: "rgba(234,179,8,0.25)" },
  submitted:   { color: "#7dd3fc",  bg: "rgba(56,189,248,0.1)",   border: "rgba(56,189,248,0.25)" },
  approved:    { color: "#86efac",  bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)" },
  paid:        { color: "#e879f9",  bg: "rgba(217,70,239,0.1)",   border: "rgba(217,70,239,0.25)" },
  cancelled:   { color: "#f87171",  bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)" },
};

function Stat({ icon: Icon, label, value, desc, color, bg, border }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; desc: string;
  color: string; bg: string; border: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <p className="text-slate-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider leading-tight">{label}</p>
      </div>
      <p className={`text-xl sm:text-2xl font-bold leading-none ${color}`}>{value}</p>
      <p className="text-slate-600 text-[10px] sm:text-xs leading-tight">{desc}</p>
    </div>
  );
}

// ── User Profile Drawer ───────────────────────────────────────────────────────
function UserDrawer({ user, tasks, onClose, onRoleChange, onBan, loading }: {
  user: AdminUser;
  tasks: ReturnType<typeof useTaskStore>["tasks"];
  onClose: () => void;
  onRoleChange: (wallet: string, role: "user" | "admin") => void;
  onBan: (wallet: string) => void;
  loading: boolean;
}) {
  const userTasks = tasks.filter((t) => t.creator === user.wallet || t.acceptor === user.wallet);
  const earned = tasks.filter((t) => t.acceptor === user.wallet && t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);
  const spent  = tasks.filter((t) => t.creator === user.wallet && t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:w-[420px] h-[90vh] sm:h-full sm:max-h-screen overflow-y-auto flex flex-col gap-0 rounded-t-3xl sm:rounded-none sm:rounded-l-3xl"
        style={{ background: "#0b0f14", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
          style={{ background: "rgba(11,15,20,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2">
            <IconUsers className="w-4 h-4 text-teal-400" />
            <p className="text-white font-semibold text-sm">User Profile</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-bold text-white overflow-hidden"
              style={{ background: "linear-gradient(135deg,#14b8a6,#22c55e)" }}>
              {user.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : (user.display_name ?? user.wallet).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-base truncate">{user.display_name ?? "No display name"}</p>
              {user.email && <p className="text-slate-400 text-xs truncate">{user.email}</p>}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={user.role === "admin"
                    ? { background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.3)" }
                    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {user.role === "admin" ? "🛡 Admin" : "👤 User"}
                </span>
                {user.is_verified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                    ✓ KYC Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <IconShield className="w-3 h-3" /> Wallet Address
            </p>
            <p className="text-white text-xs font-mono break-all">{user.wallet}</p>
            <p className="text-slate-600 text-[10px] mt-1">Joined {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Tasks Created", value: tasks.filter(t => t.creator === user.wallet).length, icon: IconPlus, color: "text-teal-400" },
              { label: "Tasks Worked",  value: tasks.filter(t => t.acceptor === user.wallet).length, icon: IconZap,  color: "text-amber-300" },
              { label: "Total Earned",  value: `${earned.toFixed(0)} cUSD`, icon: IconCoin,        color: "text-fuchsia-300" },
              { label: "Total Spent",   value: `${spent.toFixed(0)} cUSD`,  icon: IconTrendingUp,  color: "text-green-300" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-3 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3 h-3 ${color}`} />
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">{label}</p>
                </div>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* KYC info */}
          {user.verification_id && (
            <div className="rounded-2xl p-4 border border-green-400/15" style={{ background: "rgba(34,197,94,0.06)" }}>
              <p className="text-green-400 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <IconCheck className="w-3 h-3" /> KYC Verification ID
              </p>
              <p className="text-slate-300 text-xs font-mono break-all">{user.verification_id}</p>
            </div>
          )}

          {/* Task history */}
          {userTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <IconClock className="w-3 h-3" /> Task History ({userTasks.length})
              </p>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {userTasks.slice(0, 10).map((t) => {
                  const sc = STATUS_COLOR[t.status] ?? STATUS_COLOR.cancelled;
                  return (
                    <Link key={t.id} href={`/task/${t.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl p-2.5 border border-white/[0.06] hover:border-white/20 transition-colors"
                      style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{t.title}</p>
                        <p className="text-slate-500 text-[10px]">
                          {t.creator === user.wallet ? "Creator" : "Worker"} · {t.reward} {t.currency}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium"
                        style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <IconShield className="w-3 h-3" /> Admin Actions
            </p>
            {user.role === "user" ? (
              <button disabled={loading} onClick={() => onRoleChange(user.wallet, "admin")}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors cursor-pointer disabled:opacity-50">
                🛡 Promote to Admin
              </button>
            ) : (
              <button disabled={loading} onClick={() => onRoleChange(user.wallet, "user")}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-amber-400/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50">
                ↓ Demote to User
              </button>
            )}
            <button disabled={loading} onClick={() => onBan(user.wallet)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
              🚫 Suspend Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { profile, tasks, activity } = useTaskStore();
  const { toasts, addToast, removeToast } = useToast();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

  async function setRole(wallet: string, role: "user" | "admin") {
    setActionLoading(wallet);
    const { error } = await getSupabase().from("profiles").update({ role }).eq("wallet", wallet);
    if (error) addToast("Failed to update role", "error");
    else { addToast(`Role updated to ${role}`, "success"); await fetchUsers(); setSelectedUser(null); }
    setActionLoading(null);
  }

  async function banUser(wallet: string) {
    setActionLoading(wallet);
    const { error } = await getSupabase().from("profiles").update({ role: "user", banned: true }).eq("wallet", wallet);
    if (error) addToast("Failed to suspend account", "error");
    else { addToast("Account suspended", "success"); await fetchUsers(); setSelectedUser(null); }
    setActionLoading(null);
  }

  async function cancelTask(id: string) {
    setActionLoading(id);
    const { error } = await getSupabase().from("tasks").update({ status: "cancelled" }).eq("id", id);
    if (error) addToast("Failed to cancel task", "error");
    else addToast("Task cancelled", "success");
    setActionLoading(null);
  }

  async function deleteTask(id: string) {
    setActionLoading(id);
    const { error } = await getSupabase().from("tasks").delete().eq("id", id);
    if (error) addToast("Failed to delete task", "error");
    else { addToast("Task deleted", "success"); await fetchUsers(); }
    setActionLoading(null);
  }

  const totalPaid     = tasks.filter(t => t.status === "paid").reduce((s, t) => s + Number(t.reward), 0);
  const verifiedCount = users.filter(u => u.is_verified).length;
  const adminCount    = users.filter(u => u.role === "admin").length;

  const filteredUsers = users.filter(u =>
    !search ||
    u.wallet.toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.creator.toLowerCase().includes(search.toLowerCase())
  );

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: "overview", label: "Overview",  icon: IconTrendingUp, desc: "Platform stats" },
    { id: "users",    label: "Users",     icon: IconUsers,      desc: "Manage accounts" },
    { id: "tasks",    label: "Tasks",     icon: IconZap,        desc: "Moderate tasks" },
    { id: "activity", label: "Activity",  icon: IconClock,      desc: "Event log" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.25)" }}>
              <IconShield className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <p className="text-teal-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold">Admin Panel</p>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">CeloTasks Admin</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Full platform control — users, tasks, roles, and activity.</p>
        </div>
        <Link href="/dashboard"
          className="outline-btn text-slate-300 text-xs sm:text-sm px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
          <IconArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span className="hidden sm:inline">Back to App</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => { setTab(id); setSearch(""); }}
            className={`flex flex-col sm:flex-row items-center justify-center sm:gap-2 px-2 py-2.5 sm:px-4 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              tab === id ? "gradient-btn text-white" : "text-slate-400 hover:text-white"
            }`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-0">{label}</span>
            <span className="hidden lg:inline text-[10px] text-white/50 font-normal">— {desc}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      {(tab === "users" || tab === "tasks") && (
        <div className="relative">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === "users" ? "Search wallet, name, or email…" : "Search title or creator wallet…"}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Stat icon={IconUsers}      label="Total Users"    value={users.length}                                       desc="Registered wallets"           color="text-teal-400"    bg="rgba(20,184,166,0.08)"  border="rgba(20,184,166,0.2)" />
            <Stat icon={IconZap}        label="Total Tasks"    value={tasks.length}                                       desc="All statuses"                 color="text-amber-300"   bg="rgba(234,179,8,0.08)"   border="rgba(234,179,8,0.2)" />
            <Stat icon={IconCoin}       label="Paid Out"       value={`$${totalPaid.toFixed(0)}`}                         desc="cUSD to workers"              color="text-fuchsia-300" bg="rgba(217,70,239,0.08)"  border="rgba(217,70,239,0.2)" />
            <Stat icon={IconShield}     label="KYC Verified"   value={verifiedCount}                                      desc={`${adminCount} admin(s)`}     color="text-green-400"   bg="rgba(34,197,94,0.08)"   border="rgba(34,197,94,0.2)" />
            <Stat icon={IconCheck}      label="Open"           value={tasks.filter(t=>t.status==="open").length}          desc="Available to accept"          color="text-teal-400"    bg="rgba(20,184,166,0.08)"  border="rgba(20,184,166,0.2)" />
            <Stat icon={IconTrendingUp} label="In Progress"    value={tasks.filter(t=>t.status==="in_progress").length}   desc="Being worked on"              color="text-amber-300"   bg="rgba(234,179,8,0.08)"   border="rgba(234,179,8,0.2)" />
            <Stat icon={IconStar}       label="Needs Review"   value={tasks.filter(t=>t.status==="submitted").length}     desc="Awaiting approval"            color="text-sky-300"     bg="rgba(56,189,248,0.08)"  border="rgba(56,189,248,0.2)" />
            <Stat icon={IconX}          label="Cancelled"      value={tasks.filter(t=>t.status==="cancelled").length}     desc="Cancelled tasks"              color="text-red-400"     bg="rgba(248,113,113,0.08)" border="rgba(248,113,113,0.2)" />
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <IconClock className="w-4 h-4 text-sky-400" />
                <p className="text-white text-sm font-semibold">Recent Activity</p>
                <span className="text-slate-600 text-xs">— last {Math.min(activity.length, 8)} events</span>
              </div>
              <button onClick={() => setTab("activity")} className="text-teal-400 text-xs hover:text-teal-300 flex items-center gap-1 cursor-pointer">
                View all <IconArrowRight className="w-3 h-3" />
              </button>
            </div>
            {activity.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
                  <IconZap className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{item.taskTitle}</p>
                  <p className="text-slate-500 text-[10px]">{item.type.replace("_", " ")} · {new Date(item.at).toLocaleString()}</p>
                </div>
                <Link href={`/task/${item.taskId}`} className="text-slate-600 hover:text-teal-400 transition-colors shrink-0">
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === "users" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <IconUsers className="w-4 h-4 text-teal-400" />
            <p className="text-white text-sm font-semibold">All Users</p>
            <span className="text-slate-500 text-xs ml-auto">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</span>
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No users found.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filteredUsers.map((u) => (
                <button key={u.wallet} onClick={() => setSelectedUser(u)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#14b8a6,#22c55e)" }}>
                    {u.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (u.display_name ?? u.wallet).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{u.display_name ?? "No name"}</p>
                      {u.role === "admin" && (
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                          style={{ background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.3)" }}>
                          Admin
                        </span>
                      )}
                      {u.is_verified && (
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                          ✓ KYC
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-mono truncate">{u.wallet}</p>
                    {u.email && <p className="text-slate-600 text-[10px] truncate">{u.email}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-600 text-[10px] hidden sm:block">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                    <IconArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TASKS ── */}
      {tab === "tasks" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <IconZap className="w-4 h-4 text-amber-400" />
            <p className="text-white text-sm font-semibold">All Tasks</p>
            <span className="text-slate-500 text-xs ml-auto">{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filteredTasks.map((task) => {
              const sc = STATUS_COLOR[task.status] ?? STATUS_COLOR.cancelled;
              return (
                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{task.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      <span className="text-teal-400 font-semibold">{task.reward} {task.currency}</span>
                      {" · "}{task.category}{" · "}{task.difficulty}{" · "}{task.durationHours}h to complete
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono truncate">Creator: {task.creator}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/task/${task.id}`}
                      className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-slate-300 hover:border-white/20 transition-colors flex items-center gap-1">
                      View <IconArrowRight className="w-3 h-3" />
                    </Link>
                    {task.status !== "cancelled" && task.status !== "paid" && (
                      <button disabled={actionLoading === task.id} onClick={() => cancelTask(task.id)}
                        className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-amber-400/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50">
                        Cancel
                      </button>
                    )}
                    <button disabled={actionLoading === task.id} onClick={() => deleteTask(task.id)}
                      className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
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
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <IconClock className="w-4 h-4 text-sky-400" />
            <p className="text-white text-sm font-semibold">All Activity</p>
            <span className="text-slate-500 text-xs ml-auto">{activity.length} events</span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[70vh] overflow-y-auto">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}>
                  <IconZap className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wide">{item.type.replace("_", " ")}</p>
                    <span className="text-slate-600 text-[10px]">{new Date(item.at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 text-[10px] sm:text-xs truncate">{item.taskTitle}</p>
                  <p className="text-slate-500 text-[10px] font-mono truncate">{item.actor}</p>
                </div>
                <Link href={`/task/${item.taskId}`} className="text-slate-600 hover:text-teal-400 transition-colors shrink-0">
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User profile drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          tasks={tasks}
          onClose={() => setSelectedUser(null)}
          onRoleChange={setRole}
          onBan={banUser}
          loading={!!actionLoading}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
