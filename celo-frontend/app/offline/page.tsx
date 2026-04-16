"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}
      >
        <svg className="w-9 h-9 text-teal-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.172 9.172A4 4 0 0112 8c1.03 0 1.968.39 2.672 1.027M6.343 6.343A8 8 0 0118 12m-1.172 4.828A8 8 0 016 12M12 20v-4" />
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">You&apos;re offline</h1>
        <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
          No internet connection detected. Check your network and try again — your wallet and tasks will be right here when you&apos;re back.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="gradient-btn text-white font-semibold px-8 py-3.5 rounded-xl cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
