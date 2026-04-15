"use client";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { shortenAddress, isMiniPay } from "@/lib/wagmi";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [miniPay, setMiniPay] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const prevConnected = useRef<boolean | null>(null);

  useEffect(() => {
    setMiniPay(isMiniPay());
    if (isMiniPay() && !isConnected) connect({ connector: injected() });
  }, [connect, isConnected]);

  // Toast on connect/disconnect
  useEffect(() => {
    if (prevConnected.current === null) { prevConnected.current = isConnected; return; }
    if (isConnected && !prevConnected.current) addToast("Wallet connected", "success");
    if (!isConnected && prevConnected.current) addToast("Wallet disconnected", "info");
    prevConnected.current = isConnected;
  }, [isConnected, addToast]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.08]"
        style={{ background: "rgba(11,15,20,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-teal-500/40 transition-all">
              <Image src="/celoTasklogo.png" alt="CeloTasks" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Celo<span className="gradient-text">Tasks</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.06] px-2 py-1" style={{ background: "rgba(255,255,255,0.03)" }}>
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/create-task", label: "Create" },
                { href: "/activity", label: "Activity" },
                { href: "/profile", label: "Profile" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.06]"
                >
                  {item.label}
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
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <button onClick={() => disconnect()}
                  className="outline-btn text-sm px-4 py-2 rounded-xl text-slate-300 cursor-pointer font-mono">
                  {shortenAddress(address)}
                </button>
              </div>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
