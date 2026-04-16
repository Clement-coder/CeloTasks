import { createConfig } from "@privy-io/wagmi";
import { http } from "viem";
import { celo } from "wagmi/chains";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http() },
});

export const privyConfig: PrivyClientConfig = {
  defaultChain: celo,
  supportedChains: [celo],
  appearance: {
    theme: "dark",
    accentColor: "#14b8a6",
    logo: "/celoTasklogo.png",
  },
  embeddedWallets: {
    ethereum: { createOnLogin: "users-without-wallets" },
  },
  externalWallets: {
    solana: { connectors: toSolanaWalletConnectors() },
  },
};

export const isMiniPay = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay;
};

export const shortenAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;
