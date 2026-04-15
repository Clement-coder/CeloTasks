"use client";
import { useReadContract } from "wagmi";
import { celo } from "wagmi/chains";

// Celo mainnet cUSD token address
const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

export function useCUSDBalance(address?: `0x${string}`) {
  const { data, isLoading } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: celo.id,
    query: { enabled: !!address },
  });

  const formatted = data ? (Number(data) / 1e18).toFixed(4) : null;
  return { balance: formatted, isLoading };
}
