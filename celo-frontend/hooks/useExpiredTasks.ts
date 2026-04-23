"use client";
import { useMemo } from "react";
import { useTaskStore } from "@/lib/taskStore";

/** Returns IDs of open tasks whose deadline has passed. */
export function useExpiredTasks() {
  const { tasks } = useTaskStore();
  return useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => t.status === "open" && new Date(`${t.deadline}T23:59:59`).getTime() < now)
      .map((t) => t.id);
  }, [tasks]);
}
