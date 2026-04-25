"use client";
import { useReadContract } from "wagmi";
import { celo } from "wagmi/chains";
import { CUSD_ADDRESS } from "@/lib/abi";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

export function useCUSDBalance(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: celo.id,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  const formatted = data ? (Number(data) / 1e18).toFixed(4) : null;
  return { balance: formatted, isLoading, refetch };
}
