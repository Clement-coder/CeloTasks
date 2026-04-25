"use client";
import { useMemo } from "react";
import { useTaskStore } from "@/lib/taskStore";

/**
 * Returns IDs of in-progress tasks whose delivery window has passed.
 * A task is overdue when: acceptedAt + durationHours < now
 * Tasks are never "expired" just because of a calendar date.
 */
export function useExpiredTasks() {
  const { tasks } = useTaskStore();
  return useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => {
        if (t.status !== "in_progress" || !t.acceptedAt) return false;
        const dueMs = new Date(t.acceptedAt).getTime() + Number(t.durationHours) * 3600000;
        return dueMs < now;
      })
      .map((t) => t.id);
  }, [tasks]);
}
