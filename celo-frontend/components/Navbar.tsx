"use client";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { shortenAddress, isMiniPay } from "@/lib/wagmi";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import WalletModal from "@/components/WalletModal";
import { useTaskStore } from "@/lib/taskStore";
import { useCUSDBalance } from "@/hooks/useCUSDBalance";
import { IconSearch, IconShield } from "@/components/Icons";

export default function Navbar() {
  const { login, logout, ready, authenticated } = usePrivy();
  const { address } = useAccount();
  const { balance: cusdBalance } = useCUSDBalance(address);
  const [miniPay, setMiniPay] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const prevAuth = useRef<boolean | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { reviewQueue, paymentQueue, profile, tasks } = useTaskStore();
  const isAdmin = profile?.role === "admin";
  const urgentCount = reviewQueue.length + paymentQueue.length;
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = searchQuery.trim().length > 1
    ? tasks.filter((t) => `${t.title} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => { setMiniPay(isMiniPay()); }, []);

  useEffect(() => {
    if (!ready) return;
    if (prevAuth.current === null) { prevAuth.current = authenticated; return; }
    if (authenticated && !prevAuth.current) addToast("Wallet connected", "success");
    if (!authenticated && prevAuth.current) addToast("Wallet disconnected", "info");
    prevAuth.current = authenticated;
  }, [authenticated, ready, addToast]);

  function handleLogout() { setConfirmLogout(false); logout(); }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.08]"
        style={{ background: "rgba(11,15,20,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-teal-500/40 transition-all flex items-center justify-center" style={{ background: "rgba(20,184,166,0.08)" }}>
              <Image src="/celoTasklogo.png" alt="CeloTasks" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Celo<span className="gradient-text">Tasks</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <IconSearch className="w-4 h-4" />
            </button>

            {/* Global search — desktop */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-white transition-colors text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <IconSearch className="w-4 h-4" />
                <span className="text-xs">Search tasks…</span>
              </button>
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <IconSearch className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                        if (e.key === "Enter" && searchResults.length > 0) {
                          router.push(`/task/${searchResults[0].id}`);
                          setSearchOpen(false); setSearchQuery("");
                        }
                      }}
                      placeholder="Search by title or tag…"
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
                    />
                  </div>
                  {searchResults.length > 0 ? (
                    <ul className="py-2 max-h-64 overflow-y-auto">
                      {searchResults.map((t) => (
                        <li key={t.id}>
                          <Link
                            href={`/task/${t.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex flex-col px-4 py-2.5 hover:bg-white/[0.05] transition-colors"
                          >
                            <span className="text-white text-sm font-medium line-clamp-1">{t.title}</span>
                            <span className="text-slate-500 text-xs mt-0.5">{t.reward} {t.currency} · {t.category}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim().length > 1 ? (
                    <p className="text-slate-500 text-sm text-center py-6">No tasks found for &ldquo;{searchQuery}&rdquo;</p>
                  ) : (
                    <p className="text-slate-600 text-xs text-center py-4">Type to search tasks…</p>
                  )}
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-1" style={{ background: "rgba(255,255,255,0.03)" }}>
              {[
                { href: "/",            label: "Home" },
                { href: "/dashboard",   label: "Browse", badge: urgentCount > 0 ? urgentCount : undefined },
                { href: "/create-task", label: "Create" },
                { href: "/activity",    label: "Activity", badge: urgentCount > 0 ? urgentCount : undefined },
                { href: "/leaderboard", label: "Leaders" },
                { href: "/profile",     label: "Profile" },
              ].map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className="relative text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                    style={isActive ? {
                      color: "#fff",
                      background: "rgba(255,255,255,0.10)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 2px 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                    } : { color: "rgb(148,163,184)" }}>
                    {item.label}
                    {item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {miniPay && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-teal-500/30 text-teal-400"
                style={{ background: "rgba(20,184,166,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                MiniPay
              </span>
            )}

            {authenticated && address ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isAdmin && (
                  <Link href="/admin"
                    className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors"
                    style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#2dd4bf" }}>
                    <IconShield className="w-3.5 h-3.5" />Admin
                  </Link>
                )}
                <button onClick={() => setWalletOpen(true)}
                  title={address}
                  className="outline-btn text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-slate-300 cursor-pointer font-mono">
                  {cusdBalance ? `${cusdBalance} cUSD` : shortenAddress(address)}
                </button>
                <button onClick={() => setConfirmLogout(true)}
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-xs px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl hover:bg-red-500/10"
                  title="Disconnect wallet">
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                disabled={!ready}
                aria-label="Connect your wallet" title="Connect your wallet to get started" className="gradient-btn text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[55] flex flex-col" style={{ background: "rgba(11,15,20,0.97)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.08]">
            <IconSearch className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                if (e.key === "Enter" && searchResults.length > 0) {
                  router.push(`/task/${searchResults[0].id}`);
                  setSearchOpen(false); setSearchQuery("");
                }
              }}
              placeholder="Search tasks by title, description, or tag…"
              className="flex-1 bg-transparent text-white text-base outline-none placeholder-slate-500"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-slate-400 hover:text-white text-sm px-2 py-1">Cancel</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul className="py-2">
                {searchResults.map((t) => (
                  <li key={t.id}>
                    <Link href={`/task/${t.id}`} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex flex-col px-5 py-4 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04]">
                      <span className="text-white font-medium">{t.title}</span>
                      <span className="text-slate-500 text-sm mt-0.5">{t.reward} {t.currency} · {t.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : searchQuery.trim().length > 1 ? (
              <p className="text-slate-500 text-center py-12">No tasks found for &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <p className="text-slate-600 text-sm text-center py-12">Type to search tasks…</p>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        open={confirmLogout}
        title="Disconnect wallet?"
        message="You'll be signed out and your wallet will be disconnected. You can reconnect anytime."
        confirmLabel="Disconnect"
        danger
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
