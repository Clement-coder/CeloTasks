"use client";
import { useEffect, useState } from "react";

/**
 * Detects whether the app is running inside Opera MiniPay.
 * MiniPay injects window.ethereum with isMiniPay = true.
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    const mp = !!(
      window as unknown as { ethereum?: { isMiniPay?: boolean } }
    ).ethereum?.isMiniPay;
    setIsMiniPay(mp);
  }, []);

  return { isMiniPay };
}
