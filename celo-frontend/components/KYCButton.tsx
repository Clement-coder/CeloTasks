"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMetaMap } from "@/hooks/useMetaMap";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconShield } from "@/components/Icons";
import { METAMAP_CLIENT_ID, METAMAP_FLOW_ID } from "@/lib/metamap";

interface Props {
  wallet: string | null;
  onSuccess: (vid: string) => void;
  onFailure: () => void;
}

export default function KYCButton({ wallet, onSuccess, onFailure }: Props) {
  const { isVerified, persist } = useMetaMap(wallet);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Load SDK script once
  useEffect(() => {
    if (document.getElementById("metamap-sdk")) { setSdkReady(true); return; }
    const script = document.createElement("script");
    script.id = "metamap-sdk";
    script.src = "https://web-button.getmati.com/button.js";
    script.async = true;
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);
  }, []);

  // Once SDK ready + wallet present, inject the <mati-button> web component
  useEffect(() => {
    if (!sdkReady || !wallet || !containerRef.current || isVerified) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const btn = document.createElement("mati-button");
    btn.setAttribute("clientid", METAMAP_CLIENT_ID);
    btn.setAttribute("flowid", METAMAP_FLOW_ID);
    btn.setAttribute("metadata", JSON.stringify({ userId: wallet, app: "CeloTasks" }));
    // Hide the default mati button visually — we trigger it from our styled button
    btn.style.display = "none";
    btn.id = "mati-btn-hidden";
    container.appendChild(btn);

    const onFinish = (e: Event) => {
      const detail = (e as CustomEvent).detail as { verificationId?: string; identityId?: string } | undefined;
      const vid = detail?.verificationId ?? detail?.identityId ?? `kyc_${Date.now()}`;
      persist(vid);
      onSuccess(vid);
    };
    const onCancel = () => onFailure();

    btn.addEventListener("mati:userFinishedSdk", onFinish);
    btn.addEventListener("mati:userCancelledSdk", onCancel);
    // Also listen on window as some SDK versions emit there
    window.addEventListener("mati:userFinishedSdk", onFinish);
    window.addEventListener("mati:userCancelledSdk", onCancel);

    return () => {
      window.removeEventListener("mati:userFinishedSdk", onFinish);
      window.removeEventListener("mati:userCancelledSdk", onCancel);
    };
  }, [sdkReady, wallet, isVerified, persist, onSuccess, onFailure]);

  if (isVerified) return <VerifiedBadge />;

  return (
    <div>
      {/* Hidden mati-button web component */}
      <div ref={containerRef} />

      {/* Our styled trigger button */}
      <button
        disabled={!sdkReady || !wallet}
        onClick={() => {
          const btn = document.getElementById("mati-btn-hidden");
          if (btn) btn.click();
        }}
        className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
      >
        {!sdkReady
          ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading…</>
          : <><IconShield className="w-3.5 h-3.5" />Complete KYC</>}
      </button>
    </div>
  );
}
