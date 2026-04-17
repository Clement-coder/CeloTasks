"use client";
import { useState } from "react";
import { useFundWallet, type FundWalletConfig } from "@privy-io/react-auth";
import { useSendTransaction } from "wagmi";
import { parseEther, isAddress } from "viem";
import { IconX, IconArrowDown, IconArrowUp, IconCreditCard, IconWallet } from "@/components/Icons";
import { useCUSDBalance } from "@/hooks/useCUSDBalance";
import { useAccount } from "wagmi";

interface Props { open: boolean; onClose: () => void; }

type Tab = "balance" | "fund" | "withdraw";

export default function WalletModal({ open, onClose }: Props) {
  const { fundWallet } = useFundWallet();
  const { address } = useAccount();
  const { balance, isLoading } = useCUSDBalance(address);
  const [tab, setTab] = useState<Tab>("balance");
  const [toAddr, setToAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txError, setTxError] = useState("");
  const [txHash, setTxHash] = useState("");

  const { sendTransactionAsync } = useSendTransaction();

  if (!open) return null;

  async function handleWithdraw() {
    setTxError(""); setTxHash("");
    if (!isAddress(toAddr)) { setTxError("Invalid address"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setTxError("Invalid amount"); return; }
    setSending(true);
    try {
      const hash = await sendTransactionAsync({ to: toAddr as `0x${string}`, value: parseEther(amount) });
      setTxHash(hash);
      setToAddr(""); setAmount("");
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    } finally { setSending(false); }
  }

  async function handleFund() {
    if (!address) return;
    await fundWallet({ address, options: { chain: { id: 42220 } as FundWalletConfig["chain"] } });
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "balance", label: "Balance", icon: <IconWallet className="w-4 h-4" /> },
    { id: "fund",    label: "Add Funds", icon: <IconCreditCard className="w-4 h-4" /> },
    { id: "withdraw",label: "Withdraw", icon: <IconArrowUp className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base sm:text-lg">Wallet</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${tab === t.id ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
              style={tab === t.id ? { background: "linear-gradient(135deg,#14b8a6,#22c55e,#eab308)" } : {}}>
              {t.icon}<span className="hidden xs:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Balance tab */}
        {tab === "balance" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-slate-400 text-xs uppercase tracking-wider">cUSD Balance</p>
              <p className="text-white text-2xl sm:text-3xl font-bold">
                {isLoading ? <span className="skeleton inline-block w-24 h-8 rounded-lg" /> : `${balance ?? "0.0000"}`}
                <span className="text-slate-400 text-sm font-normal ml-2">cUSD</span>
              </p>
              {address && <p className="text-slate-500 text-xs font-mono mt-1 break-all">{address}</p>}
              <p className="text-slate-600 text-xs mt-1">To send CELO, use the Withdraw tab.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button onClick={() => setTab("fund")}
                className="gradient-btn flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer">
                <IconArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Funds
              </button>
              <button onClick={() => setTab("withdraw")}
                className="outline-btn flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-slate-300 text-xs sm:text-sm font-semibold cursor-pointer">
                <IconArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Withdraw
              </button>
            </div>
          </div>
        )}

        {/* Fund tab */}
        {tab === "fund" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-4 border border-teal-500/20 flex gap-3" style={{ background: "rgba(20,184,166,0.06)" }}>
              <IconCreditCard className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold mb-1">Buy crypto with MoonPay</p>
                <p className="text-slate-400 text-xs leading-relaxed">Fund your wallet using cards, bank transfers, or local payment methods. Powered by MoonPay.</p>
              </div>
            </div>
            <button onClick={handleFund}
              className="gradient-btn w-full py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
              <IconCreditCard className="w-4 h-4" /> Open MoonPay
            </button>
            <p className="text-slate-500 text-xs text-center">Supports Visa, Mastercard, Apple Pay &amp; more</p>
          </div>
        )}

        {/* Withdraw tab */}
        {tab === "withdraw" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-4 border border-amber-500/20 flex gap-3" style={{ background: "rgba(234,179,8,0.06)" }}>
              <IconArrowUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold mb-1">Send native CELO</p>
                <p className="text-slate-400 text-xs leading-relaxed">This sends native CELO (not cUSD) to any address on the Celo network.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Recipient Address</label>
                <input value={toAddr} onChange={(e) => setToAddr(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono border border-white/[0.08] outline-none focus:border-teal-500/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Amount (CELO)</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" type="number" min="0" step="any"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white border border-white/[0.08] outline-none focus:border-teal-500/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
            {txError && <p className="text-red-400 text-xs">{txError}</p>}
            {txHash && (
              <a href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                className="text-teal-400 text-xs underline">View on CeloScan ↗</a>
            )}
            <button onClick={handleWithdraw} disabled={sending}
              className="gradient-btn w-full py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" /> : <IconArrowUp className="w-4 h-4" />}
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
