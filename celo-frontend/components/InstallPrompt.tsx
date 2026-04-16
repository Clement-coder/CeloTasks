"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running in standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-install-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent || dismissed) return null;

  const handleInstall = async () => {
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setDismissed(true);
      localStorage.setItem("pwa-install-dismissed", "1");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
      style={{ background: "#0f1520", border: "1px solid rgba(20,184,166,0.3)" }}
    >
      <div
        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.2)" }}
      >
        <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">Install CeloTasks</p>
        <p className="text-slate-400 text-xs">Add to home screen for the best experience</p>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="gradient-btn text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 text-xs text-center transition-colors cursor-pointer"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
