"use client";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (online) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white"
      style={{ background: "rgba(239,68,68,0.92)", backdropFilter: "blur(8px)" }}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01" />
      </svg>
      You&apos;re offline — some features may not work
    </div>
  );
}
