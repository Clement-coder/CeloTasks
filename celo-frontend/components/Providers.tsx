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

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

function WalletSync() {
  const { address } = useAccount();
  const { setMyAddress } = useTaskStore();
  useEffect(() => { if (address) setMyAddress(address); }, [address, setMyAddress]);
  useNotifications();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (!privyAppId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-sm p-8 text-center">
        Missing <code className="mx-1 font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> — add it to <code className="mx-1 font-mono">.env.local</code> and restart.
      </div>
    );
  }

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
