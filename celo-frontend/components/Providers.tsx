"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { privyConfig, wagmiConfig } from "@/lib/wagmi";
import { TaskProvider, useTaskStore } from "@/lib/taskStore";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

import ErrorBoundary from "@/components/ErrorBoundary";

function WalletSync() {
  const { address } = useAccount();
  const { setMyAddress } = useTaskStore();
  useEffect(() => { if (address) setMyAddress(address); }, [address, setMyAddress]);
  useNotifications();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!privyAppId) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Add it to .env.local.");
  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ErrorBoundary>
            <TaskProvider>
              <WalletSync />
              {children}
            </TaskProvider>
          </ErrorBoundary>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
