"use client";
import Link from "next/link";
import { IconArrowRight } from "@/components/Icons";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <span className="text-red-400 text-2xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">An unexpected error occurred. Try refreshing or go back home.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="outline-btn text-slate-300 font-medium px-6 py-3 rounded-xl cursor-pointer">
          Try Again
        </button>
        <Link href="/" className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
          <IconArrowRight className="w-4 h-4 rotate-180" /> Home
        </Link>
      </div>
    </div>
  );
}
