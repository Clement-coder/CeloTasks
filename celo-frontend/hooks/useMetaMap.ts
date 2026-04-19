"use client";
import { useState, useEffect, useCallback } from "react";
import { loadMetaMapSDK, METAMAP_CLIENT_ID, METAMAP_FLOW_ID } from "@/lib/metamap";
import { getSupabase } from "@/utils/supabase/client";

const LS_VERIFIED = "celotasks_kyc_verified";
const LS_VID      = "celotasks_kyc_vid";

export function useMetaMap(wallet: string | null) {
  const [isVerified,     setIsVerified]     = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    if (!wallet) return;
    const stored = localStorage.getItem(`${LS_VERIFIED}_${wallet}`);
    const vid    = localStorage.getItem(`${LS_VID}_${wallet}`);
    if (stored === "true") { setIsVerified(true); setVerificationId(vid); }
  }, [wallet]);

  const persist = useCallback((vid: string) => {
    if (!wallet) return;
    localStorage.setItem(`${LS_VERIFIED}_${wallet}`, "true");
    localStorage.setItem(`${LS_VID}_${wallet}`, vid);
    setIsVerified(true);
    setVerificationId(vid);
    getSupabase()
      .from("profiles")
      .update({ is_verified: true, verification_id: vid, updated_at: new Date().toISOString() })
      .eq("wallet", wallet.toLowerCase())
      .then(({ error }: { error: unknown }) => { if (error) console.error("KYC supabase:", error); });
  }, [wallet]);

  const launch = useCallback(async (
    onSuccess: (vid: string) => void,
    onFailure: () => void,
  ) => {
    if (!wallet) return;
    setLoading(true);
    await loadMetaMapSDK();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    // MetaMap SDK exposes matiButton.initialize()
    if (win.matiButton?.initialize) {
      win.matiButton.initialize({
        clientId: METAMAP_CLIENT_ID,
        flowId:   METAMAP_FLOW_ID,
        metadata: { userId: wallet, app: "CeloTasks" },
      });
    }

    setLoading(false);

    // Listen for SDK events on window
    const onFinish = (e: Event) => {
      const detail = (e as CustomEvent).detail as { verificationId?: string; identityId?: string } | undefined;
      const vid = detail?.verificationId ?? detail?.identityId ?? `kyc_${Date.now()}`;
      persist(vid);
      onSuccess(vid);
      window.removeEventListener("mati:userFinishedSdk", onFinish);
      window.removeEventListener("mati:userCancelledSdk", onCancel);
    };
    const onCancel = () => {
      onFailure();
      window.removeEventListener("mati:userFinishedSdk", onFinish);
      window.removeEventListener("mati:userCancelledSdk", onCancel);
    };

    window.addEventListener("mati:userFinishedSdk", onFinish);
    window.addEventListener("mati:userCancelledSdk", onCancel);

    // Trigger the flow
    if (win.matiButton?.showModal) {
      win.matiButton.showModal();
    } else {
      // Fallback: click the hidden DOM button if SDK uses that pattern
      document.getElementById("metamap-button-trigger")?.click();
    }
  }, [wallet, persist]);

  return { isVerified, verificationId, loading, launch, persist };
}
