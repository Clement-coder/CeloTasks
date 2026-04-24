"use client";
import { useReadContract } from "wagmi";
import { CELOTASKS_ABI, CELOTASKS_ADDRESS } from "@/lib/abi";

export function useOnchainStats() {
  const { data: taskCount } = useReadContract({
    address: CELOTASKS_ADDRESS,
    abi: CELOTASKS_ABI,
    functionName: "taskCount",
    query: { refetchInterval: 30_000 },
  });

  return {
    onchainTaskCount: taskCount ? Number(taskCount) : null,
  };
}
