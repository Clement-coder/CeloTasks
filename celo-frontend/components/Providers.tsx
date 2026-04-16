"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { privyConfig, wagmiConfig } from "@/lib/wagmi";
import { TaskProvider } from "@/lib/taskStore";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!privyAppId) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Add it to .env.local.");
  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <TaskProvider>
            {children}
          </TaskProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
