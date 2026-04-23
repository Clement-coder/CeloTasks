"use client";
import { useMemo } from "react";
import { useTaskStore } from "@/lib/taskStore";

export function useTaskAnalytics() {
  const { tasks } = useTaskStore();

  return useMemo(() => {
    const total = tasks.length;
    const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    const byCategory = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
    const totalPaidOut = tasks
      .filter((t) => t.status === "paid")
      .reduce((s, t) => s + Number(t.reward), 0);
    const avgReward = total > 0
      ? tasks.reduce((s, t) => s + Number(t.reward), 0) / total
      : 0;
    const completionRate = total > 0
      ? Math.round(((byStatus.paid ?? 0) / total) * 100)
      : 0;

    return { total, byStatus, byCategory, totalPaidOut, avgReward, completionRate };
  }, [tasks]);
}
