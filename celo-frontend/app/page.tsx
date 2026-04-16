import Link from "next/link";
import Image from "next/image";
import {
  IconZap, IconShield, IconSmartphone,
  IconWallet, IconSearch, IconCheck,
  IconArrowRight, IconTrendingUp,
} from "@/components/Icons";
import LiveStats from "@/components/LiveStats";

const FEATURES = [
  {
    Icon: IconZap,
    title: "Instant Payments",
    desc: "Get paid the moment your work is approved. No waiting, no banks — just instant cUSD transfers on Celo.",
    color: "rgba(20,184,166,0.1)",
    border: "rgba(20,184,166,0.2)",
    iconColor: "#14b8a6",
    tag: "< 3s settlement",
  },
  {
    Icon: IconShield,
    title: "Onchain Reputation",
    desc: "Every completed task builds your verifiable reputation score stored permanently on the blockchain.",
    color: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
    iconColor: "#22c55e",
    tag: "Fully verifiable",
  },
  {
    Icon: IconSmartphone,
    title: "Mobile First",
    desc: "Built for MiniPay. Access the full platform from your phone with seamless wallet integration.",
    color: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.2)",
    iconColor: "#eab308",
    tag: "MiniPay native",
  },
];

const STEPS = [
  { Icon: IconWallet, n: "01", title: "Connect Wallet",       desc: "Open in MiniPay or connect any Celo wallet. No sign-up, no email." },
  { Icon: IconSearch, n: "02", title: "Browse or Post Tasks", desc: "Find tasks that match your skills, or post one and set your own reward." },
  { Icon: IconCheck,  n: "03", title: "Complete & Get Paid",  desc: "Finish the work, get verified onchain, and receive cUSD instantly." },
];

const TESTIMONIALS = [
  { quote: "Got paid in seconds after completing a translation task. This is the future of freelancing.", name: "0xA1b2...3c4d", role: "Translator",      Icon: IconTrendingUp },
  { quote: "Posted a design task, had 3 applicants in an hour. Payment was automatic. Zero friction.",   name: "0xF5e6...7g8h", role: "Startup Founder", Icon: IconZap },
  { quote: "My reputation score opened doors to higher-paying tasks. Onchain credentials actually work.", name: "0xK9l0...1m2n", role: "Developer",       Icon: IconShield },
];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(20,184,166,0.22) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 85% 85%, rgba(234,179,8,0.08) 0%, transparent 55%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 15% 75%, rgba(34,197,94,0.07) 0%, transparent 55%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-7">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm text-slate-300 border border-teal-500/25"
            style={{ background: "rgba(20,184,166,0.08)" }}>
            <span className="w-2 h-2 rounded-full bg-teal-400 glow-pulse shrink-0" />
            Live on Celo Mainnet · Powered by MiniPay
          </div>

          {/* Logo + headline */}
          <div className="fade-up fade-up-delay-1 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-teal-500/20 shadow-2xl"
              style={{ boxShadow: "0 0 40px rgba(20,184,166,0.25)" }}>
              <Image src="/celoTasklogo.png" alt="CeloTasks" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Micro tasks.<br />
              <span className="gradient-text">Instant pay.</span>
            </h1>
          </div>

          <p className="fade-up fade-up-delay-2 text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed">
            Complete small tasks and get paid instantly on Celo using MiniPay.
            Build your onchain reputation. Earn on your terms.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/dashboard"
              className="gradient-btn text-white font-semibold px-9 py-4 rounded-xl text-base flex items-center justify-center gap-2">
              Get Started <IconArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works"
              className="outline-btn text-slate-300 font-medium px-9 py-4 rounded-xl text-base text-center">
              How It Works
            </a>
          </div>

          {/* Trust pills */}
          <div className="fade-up fade-up-delay-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {["No fees", "Instant settlement", "MiniPay ready", "Open source"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <IconCheck className="w-3.5 h-3.5 text-teal-500" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-teal-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-white/[0.06] py-10 px-4" style={{ background: "rgba(255,255,255,0.015)" }}>
        <LiveStats />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-4 py-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Simple Process</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">How It Works</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">Three steps from wallet to payment. No middlemen, no delays.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative">
          <div className="hidden sm:block absolute top-[52px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
            style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.5), rgba(34,197,94,0.5), rgba(234,179,8,0.5))" }} />
          {STEPS.map(({ Icon, n, title, desc }, i) => (
            <div key={n} className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #14b8a6, #22c55e)" }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.08)" }}>{n}</span>
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
      <section id="features" className="px-4 pb-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why CeloTasks</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Built for the <span className="gradient-text">real world</span>
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">The simplest way to earn and pay for micro-work on the blockchain.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, desc, color, border, iconColor, tag }) => (
            <div key={title} className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: color, border: `1px solid ${border}` }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: iconColor, background: color, border: `1px solid ${border}` }}>
                  {tag}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-medium" style={{ color: iconColor }}>
                Learn more <IconArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-4 pb-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Community</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">Trusted by earners</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">Real people, real payments, real reputation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ Icon, quote, name, role }) => (
            <div key={name} className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-white/20 transition-all duration-300">
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #14b8a6, #22c55e)" }}>
                  {name.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold font-mono">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-4 pb-28 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.13), rgba(34,197,94,0.08), rgba(234,179,8,0.08))", border: "1px solid rgba(20,184,166,0.22)" }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)" }} />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em]">Get Started Today</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Ready to earn<br />on Celo?
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Connect your wallet and start completing tasks in minutes.
            </p>
            <Link href="/dashboard"
              className="gradient-btn inline-flex items-center gap-2 text-white font-semibold px-10 py-4 rounded-xl text-base">
              Open Dashboard <IconArrowRight className="w-4 h-4" />
            </Link>
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
          </div>
        </div>
      </footer>

    </div>
  );
}
