"use client";
import { useEffect } from "react";
import { loadMetaMapSDK, METAMAP_CLIENT_ID, METAMAP_FLOW_ID } from "@/lib/metamap";
import { useMetaMap } from "@/hooks/useMetaMap";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconShield } from "@/components/Icons";

interface Props {
  wallet: string | null;
  onSuccess: (vid: string) => void;
  onFailure: () => void;
}

export default function KYCButton({ wallet, onSuccess, onFailure }: Props) {
  const { isVerified, loading, launch } = useMetaMap(wallet);

  useEffect(() => { loadMetaMapSDK(); }, []);

  if (isVerified) return <VerifiedBadge />;

  return (
    <>
      {/* Hidden MetaMap trigger — SDK binds to this DOM element */}
      <div
        id="metamap-button-trigger"
        data-clientid={METAMAP_CLIENT_ID}
        data-flowid={METAMAP_FLOW_ID}
        data-metadata={JSON.stringify({ userId: wallet ?? "", app: "CeloTasks" })}
        style={{ display: "none" }}
      />

      <button
        onClick={() => launch(onSuccess, onFailure)}
        disabled={loading || !wallet}
        className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
      >
        {loading
          ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading…</>
          : <><IconShield className="w-3.5 h-3.5" />Complete KYC</>}
      </button>
    </>
  );
}
