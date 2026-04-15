// hooks/useContract.ts
"use client";
import { useCallback } from "react";
import { useWalletClient } from "wagmi";

export function useContract() {
  const { data: walletClient } = useWalletClient();

  const createTask = useCallback(
    async (title: string, description: string, reward: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      console.log("createTask", { title, description, reward });
      // TODO: replace with actual contract call
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient]
  );

  const acceptTask = useCallback(
    async (taskId: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      console.log("acceptTask", taskId);
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      console.log("completeTask", taskId);
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient]
  );

  const releasePayment = useCallback(
    async (taskId: string) => {
      if (!walletClient) throw new Error("Wallet not connected");
      console.log("releasePayment", taskId);
      await new Promise((r) => setTimeout(r, 1000));
    },
    [walletClient]
  );

  return { createTask, acceptTask, completeTask, releasePayment };
}
