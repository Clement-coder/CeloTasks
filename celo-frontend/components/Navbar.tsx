"use client";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { shortenAddress, isMiniPay } from "@/lib/wagmi";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import WalletModal from "@/components/WalletModal";
import { useTaskStore } from "@/lib/taskStore";

export default function Navbar() {
  const { login, logout, ready, authenticated } = usePrivy();
  const { address } = useAccount();
  const [miniPay, setMiniPay] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const prevAuth = useRef<boolean | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { reviewQueue, paymentQueue } = useTaskStore();
  const urgentCount = reviewQueue.length + paymentQueue.length;

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
            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-1" style={{ background: "rgba(255,255,255,0.03)" }}>
              {[
                { href: "/", label: "Home" },
                { href: "/dashboard", label: "Browse", badge: urgentCount > 0 ? urgentCount : undefined },
                { href: "/create-task", label: "Create" },
                { href: "/activity", label: "Activity", badge: urgentCount > 0 ? urgentCount : undefined },
                { href: "/profile", label: "Profile" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="relative text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.06]">
                  {item.label}
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {miniPay && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-teal-500/30 text-teal-400"
                style={{ background: "rgba(20,184,166,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                MiniPay
              </span>
            )}

            {authenticated && address ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setWalletOpen(true)}
                  className="outline-btn text-sm px-4 py-2 rounded-xl text-slate-300 cursor-pointer font-mono">
                  {shortenAddress(address)}
                </button>
                <button onClick={() => setConfirmLogout(true)}
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-xs px-2 py-2 rounded-xl hover:bg-red-500/10"
                  title="Disconnect wallet">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={login} disabled={!ready}
                className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

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
