"use client";
import { useMemo } from "react";
import { useTaskStore } from "@/lib/taskStore";

/**
 * Composite reputation score (0–100) based on:
 * - 50% success rate (paid / accepted tasks)
 * - 30% volume (capped at 20 completed tasks)
 * - 20% recency (completed a task in the last 30 days)
 */
export function useReputationScore(wallet?: string | null) {
  const { tasks } = useTaskStore();

  return useMemo(() => {
    if (!wallet) return { score: 0, level: "Newcomer" as const };

    const accepted  = tasks.filter((t) => t.acceptor === wallet.toLowerCase());
    const completed = accepted.filter((t) => t.status === "paid");

    const successRate = accepted.length > 0 ? completed.length / accepted.length : 0;
    const volumeScore = Math.min(completed.length / 20, 1);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyActive = completed.some((t) => t.paidAt && new Date(t.paidAt).getTime() > thirtyDaysAgo);

    const score = Math.round(successRate * 50 + volumeScore * 30 + (recentlyActive ? 20 : 0));

    const level =
      score >= 90 ? "Elite"    :
      score >= 70 ? "Expert"   :
      score >= 50 ? "Skilled"  :
      score >= 25 ? "Rising"   :
                    "Newcomer";

    return { score, level };
  }, [tasks, wallet]);
}
