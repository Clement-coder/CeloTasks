"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [sdkReady, setSdkReady] = useState(false);
  const injected = useRef(false);

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

  // Inject hidden mati-button into a fixed off-screen portal — NOT inside the page flow
  useEffect(() => {
    if (!sdkReady || !wallet || isVerified || injected.current) return;
    injected.current = true;

    // Create an off-screen container so the web component never affects layout
    const portal = document.createElement("div");
    portal.id = "metamap-portal";
    portal.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
    document.body.appendChild(portal);

    const btn = document.createElement("mati-button");
    btn.setAttribute("clientid", METAMAP_CLIENT_ID);
    btn.setAttribute("flowid", METAMAP_FLOW_ID);
    btn.setAttribute("metadata", JSON.stringify({ userId: wallet, app: "CeloTasks" }));
    btn.id = "mati-btn-hidden";
    portal.appendChild(btn);

    const onFinish = (e: Event) => {
      const detail = (e as CustomEvent).detail as { verificationId?: string; identityId?: string } | undefined;
      const vid = detail?.verificationId ?? detail?.identityId ?? `kyc_${Date.now()}`;
      persist(vid);
      onSuccess(vid);
      // Restore scroll/viewport after modal closes
      document.body.style.overflow = "";
      document.body.style.position = "";
    };
    const onCancel = () => {
      onFailure();
      document.body.style.overflow = "";
      document.body.style.position = "";
    };

    window.addEventListener("mati:userFinishedSdk", onFinish);
    window.addEventListener("mati:userCancelledSdk", onCancel);
    window.addEventListener("mati:exitedSdk", onCancel);

    return () => {
      window.removeEventListener("mati:userFinishedSdk", onFinish);
      window.removeEventListener("mati:userCancelledSdk", onCancel);
      window.removeEventListener("mati:exitedSdk", onCancel);
      portal.remove();
      injected.current = false;
    };
  }, [sdkReady, wallet, isVerified, persist, onSuccess, onFailure]);

  const handleClick = useCallback(() => {
    const btn = document.getElementById("mati-btn-hidden");
    if (btn) btn.click();
  }, []);

  if (isVerified) return <VerifiedBadge />;

  return (
    <button
      disabled={!sdkReady || !wallet}
      onClick={handleClick}
      className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
    >
      {!sdkReady
        ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading…</>
        : <><IconShield className="w-3.5 h-3.5" />Complete KYC</>}
    </button>
  );
}
