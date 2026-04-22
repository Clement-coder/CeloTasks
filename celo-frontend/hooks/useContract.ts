"use client";
import { useCallback } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { CELOTASKS_ABI, CELOTASKS_ADDRESS, CUSD_ABI, CUSD_ADDRESS } from "@/lib/abi";

export function useContract() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // ── createTask — approve cUSD then create onchain ─────────────────────────
  const createTask = useCallback(
    async (rewardCUSD: string, deadlineUnix: number, metadataUri: string) => {
      if (!walletClient || !publicClient) throw new Error("Wallet not connected");
      const rewardWei = parseEther(rewardCUSD);
      const approveTx = await walletClient.writeContract({
        address: CUSD_ADDRESS, abi: CUSD_ABI, functionName: "approve",
        args: [CELOTASKS_ADDRESS, rewardWei],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      const tx = await walletClient.writeContract({
        address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "createTask",
        args: [rewardWei, BigInt(deadlineUnix), metadataUri],
      });
      return publicClient.waitForTransactionReceipt({ hash: tx });
    },
    [walletClient, publicClient],
  );

  // ── assignWorker ──────────────────────────────────────────────────────────
  const assignWorker = useCallback(
    async (chainTaskId: bigint, workerAddress: `0x${string}`) => {
      if (!walletClient || !publicClient) throw new Error("Wallet not connected");
      const tx = await walletClient.writeContract({
        address: CELOTASKS_ADDRESS, abi: CELOTASKS_ABI, functionName: "assignWorker",
        args: [chainTaskId, workerAddress],
      });
      return publicClient.waitForTransactionReceipt({ hash: tx });
    },
    [walletClient, publicClient],
  );

  return { createTask, assignWorker };
}
