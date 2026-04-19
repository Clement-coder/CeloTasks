import Link from "next/link";
import Image from "next/image";
import {
  IconZap, IconShield, IconSmartphone,
  IconWallet, IconSearch, IconCheck,
  IconArrowRight, IconTrendingUp, IconUsers, IconCoin, IconStar,
} from "@/components/Icons";
import LiveStats from "@/components/LiveStats";

const FEATURES = [
  {
    Icon: IconZap,
    title: "Instant Payments",
    desc: "Get paid the moment your work is approved. No waiting, no banks — cUSD lands in your wallet in seconds.",
    iconColor: "#14b8a6",
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.18)",
    tag: "< 3s settlement",
  },
  {
    Icon: IconShield,
    title: "Onchain Reputation",
    desc: "Every completed task builds a permanent, verifiable reputation score on the Celo blockchain.",
    iconColor: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.18)",
    tag: "Fully verifiable",
  },
  {
    Icon: IconSmartphone,
    title: "Mobile First",
    desc: "Built natively for MiniPay. Open the app, connect your wallet, and start earning — no desktop needed.",
    iconColor: "#eab308",
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.18)",
    tag: "MiniPay native",
  },
  {
    Icon: IconUsers,
    title: "Open Marketplace",
    desc: "Post tasks with custom rewards, deadlines, and deliverables. Workers apply, you choose the best fit.",
    iconColor: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.18)",
    tag: "No middlemen",
  },
  {
    Icon: IconCoin,
    title: "cUSD Rewards",
    desc: "All payments are in cUSD — a stable dollar-pegged token. No crypto volatility, just real value.",
    iconColor: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.18)",
    tag: "Stable value",
  },
  {
    Icon: IconStar,
    title: "Dispute Protection",
    desc: "Built-in revision requests and dispute flagging keep both sides accountable throughout the workflow.",
    iconColor: "#f472b6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.18)",
    tag: "Fair process",
  },
];

const STEPS = [
  {
    Icon: IconWallet, n: "01", title: "Connect Wallet",
    desc: "Open in MiniPay or connect any Celo wallet. No sign-up, no email, no KYC.",
    color: "#14b8a6",
  },
  {
    Icon: IconSearch, n: "02", title: "Browse or Post",
    desc: "Find tasks that match your skills, or post one with a cUSD reward and clear deliverables.",
    color: "#22c55e",
  },
  {
    Icon: IconCheck, n: "03", title: "Complete & Earn",
    desc: "Submit your work, get it approved, and receive cUSD instantly — no manual transfers.",
    color: "#eab308",
  },
];

const TRUST_PILLS = ["No platform fees", "Instant settlement", "MiniPay ready", "Open source", "Non-custodial"];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(20,184,166,0.2) 0%, transparent 65%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 45% 35% at 90% 90%, rgba(234,179,8,0.07) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 45% 35% at 10% 80%, rgba(34,197,94,0.06) 0%, transparent 60%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 100%)",
        }} />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
          {/* Live badge */}
          <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-slate-300 border border-teal-500/20"
            style={{ background: "rgba(20,184,166,0.07)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
            Live on Celo Mainnet · Powered by MiniPay
          </div>

          {/* Logo + headline */}
          <div className="fade-up fade-up-delay-1 flex flex-col items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-1 ring-teal-500/25"
              style={{ boxShadow: "0 0 48px rgba(20,184,166,0.2)" }}>
              <Image src="/celoTasklogo.png" alt="CeloTasks" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Micro tasks.<br />
                <span className="gradient-text">Instant pay.</span>
              </h1>
            </div>
          </div>

          <p className="fade-up fade-up-delay-2 text-lg sm:text-xl text-slate-400 max-w-md leading-relaxed">
            Complete small tasks and get paid instantly in cUSD on Celo.
            Build your onchain reputation. Earn on your terms.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/dashboard"
              className="gradient-btn text-white font-semibold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2">
              Start Earning <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/create-task"
              className="outline-btn text-slate-300 font-medium px-8 py-4 rounded-xl text-base text-center">
              Post a Task
            </Link>
          </div>

          {/* Trust pills */}
          <div className="fade-up fade-up-delay-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
            {TRUST_PILLS.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <IconCheck className="w-3 h-3 text-teal-500" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-20">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-teal-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="border-y border-white/[0.06] py-12 px-4" style={{ background: "rgba(255,255,255,0.012)" }}>
        <LiveStats />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-4 py-20 sm:py-32 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Three steps to your first payment</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">No middlemen. No delays. Wallet to payment in minutes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-[54px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px"
            style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.4), rgba(34,197,94,0.4), rgba(234,179,8,0.4))" }} />

          {STEPS.map(({ Icon, n, title, desc, color }) => (
            <div key={n} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-3xl font-bold" style={{ color: "rgba(255,255,255,0.06)" }}>{n}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-4 pb-20 sm:pb-32 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Why CeloTasks</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Built for the <span className="gradient-text">real world</span>
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">Everything you need to earn and pay for micro-work — nothing you don&apos;t.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc, iconColor, bg, border, tag }) => (
            <div key={title} className="glass-card rounded-2xl p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ color: iconColor, background: bg, border: `1px solid ${border}` }}>
                  {tag}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-1.5">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR WORKERS / CREATORS ── */}
      <section className="px-4 pb-20 sm:pb-32 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Workers */}
          <div className="rounded-2xl p-7 sm:p-10 flex flex-col gap-5 border border-teal-500/15"
            style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(34,197,94,0.04))" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.2)" }}>
              <IconTrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">For Workers</p>
              <h3 className="text-white text-2xl font-bold mb-3">Earn on your skills</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-300">
                {[
                  "Browse open tasks filtered by category and reward",
                  "Apply with a note and get selected by the creator",
                  "Submit work and get paid in cUSD instantly on approval",
                  "Build a permanent onchain reputation with every task",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <IconCheck className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/dashboard" className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 w-fit">
              Browse Tasks <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Creators */}
          <div className="rounded-2xl p-7 sm:p-10 flex flex-col gap-5 border border-amber-500/15"
            style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.07), rgba(217,70,239,0.04))" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <IconZap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">For Task Creators</p>
              <h3 className="text-white text-2xl font-bold mb-3">Get work done fast</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-300">
                {[
                  "Post tasks with custom rewards, deadlines, and deliverables",
                  "Review applicants and select the best fit",
                  "Approve submissions or request revisions with one click",
                  "Payment releases automatically — no manual transfers",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <IconCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/create-task" className="outline-btn text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 w-fit border-amber-500/30 hover:border-amber-400/50">
              Post a Task <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-4 pb-20 sm:pb-32 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl p-10 sm:p-20 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(34,197,94,0.07), rgba(234,179,8,0.07))", border: "1px solid rgba(20,184,166,0.2)" }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%)" }} />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em]">Get Started Today</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              Ready to earn on Celo?
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Connect your wallet and start completing tasks in minutes. No sign-up required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard"
                className="gradient-btn inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base">
                Open Dashboard <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/create-task"
                className="outline-btn inline-flex items-center gap-2 text-slate-300 font-medium px-8 py-4 rounded-xl text-base">
                Post a Task
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/celoTasklogo.png" alt="CeloTasks" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-semibold text-sm">Celo<span className="gradient-text">Tasks</span></span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 CeloTasks · Built on <span className="gradient-text font-medium">Celo</span></p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/create-task" className="hover:text-white transition-colors">Post Task</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
