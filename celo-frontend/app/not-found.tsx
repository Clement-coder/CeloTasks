import Link from "next/link";
import { IconSearch, IconArrowRight } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
        <IconSearch className="w-7 h-7 text-teal-500/50" />
      </div>
      <div>
        <p className="gradient-text font-bold text-6xl mb-2">404</p>
        <h2 className="text-xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      </div>
      <Link href="/" className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Home
      </Link>
    </div>
  );
}
