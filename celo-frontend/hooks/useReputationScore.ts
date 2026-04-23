"use client";
import { useMemo, useEffect, useState } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { getSupabase } from "@/utils/supabase/client";

/**
 * Composite reputation score (0–100) based on:
 * - 40% success rate (paid / accepted tasks)
 * - 25% volume (capped at 20 completed tasks)
 * - 15% recency (completed a task in the last 30 days)
 * - 20% avg star rating (from ratings table, if any)
 */
export function useReputationScore(wallet?: string | null) {
  const { tasks } = useTaskStore();
  const [avgStars, setAvgStars] = useState<number | null>(null);

  useEffect(() => {
    if (!wallet) return;
    getSupabase()
      .from("ratings")
      .select("stars")
      .eq("ratee_wallet", wallet.toLowerCase())
      .then(({ data }: { data: { stars: number }[] | null }) => {
        if (!data || data.length === 0) return;
        setAvgStars(data.reduce((s, r) => s + r.stars, 0) / data.length);
      });
  }, [wallet]);

  return useMemo(() => {
    if (!wallet) return { score: 0, level: "Newcomer" as const };

    const accepted  = tasks.filter((t) => t.acceptor === wallet.toLowerCase());
    const completed = accepted.filter((t) => t.status === "paid");

    const successRate = accepted.length > 0 ? completed.length / accepted.length : 0;
    const volumeScore = Math.min(completed.length / 20, 1);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyActive = completed.some((t) => t.paidAt && new Date(t.paidAt).getTime() > thirtyDaysAgo);

    const ratingScore = avgStars !== null ? (avgStars - 1) / 4 : 0; // 1–5 stars → 0–1

    const score = Math.round(
      successRate * 40 +
      volumeScore * 25 +
      (recentlyActive ? 15 : 0) +
      ratingScore * 20
    );

    const level =
      score >= 90 ? "Elite"    :
      score >= 70 ? "Expert"   :
      score >= 50 ? "Skilled"  :
      score >= 25 ? "Rising"   :
                    "Newcomer";

    return { score, level };
  }, [tasks, wallet, avgStars]);
}
