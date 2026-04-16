// hooks/useContract.ts
// TODO: Wire these functions to the deployed CeloTasks smart contract.
// All functions currently simulate async latency and log to console.
// Replace each body with the actual wagmi writeContract / readContract call.
"use client";
import { useCallback } from "react";
import { useWalletClient } from "wagmi";

export function useContract() {
  const { data: walletClient } = useWalletClient();

  const createTask = useCallback(
    async (title: string, reward: string, deadline: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      // TODO: writeContract({ address: CONTRACT_ADDRESS, abi, functionName: "createTask", args: [...] })
      console.warn("[useContract] createTask stub called", { title, reward, deadline });
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient],
  );

  const acceptTask = useCallback(
    async (taskId: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      // TODO: writeContract({ functionName: "acceptTask", args: [taskId] })
      console.warn("[useContract] acceptTask stub called", taskId);
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient],
  );

  const submitWork = useCallback(
    async (taskId: string, proofUri: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      // TODO: writeContract({ functionName: "submitWork", args: [taskId, proofUri] })
      console.warn("[useContract] submitWork stub called", { taskId, proofUri });
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient],
  );

  const releasePayment = useCallback(
    async (taskId: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      // TODO: writeContract({ functionName: "releasePayment", args: [taskId] })
      console.warn("[useContract] releasePayment stub called", taskId);
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient],
  );

  return { createTask, acceptTask, submitWork, releasePayment };
}
