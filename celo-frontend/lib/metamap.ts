// lib/metamap.ts
// MetaMap Web SDK loader — injects the script once and exposes the global

export function loadMetaMapSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (document.getElementById("metamap-sdk")) { resolve(); return; }
    const script = document.createElement("script");
    script.id = "metamap-sdk";
    script.src = "https://web-button.getmati.com/button.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export const METAMAP_CLIENT_ID = process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID ?? "";
export const METAMAP_FLOW_ID   = process.env.NEXT_PUBLIC_METAMAP_FLOW_ID   ?? "";
