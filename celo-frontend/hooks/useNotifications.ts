"use client";
import { useEffect, useRef } from "react";
import { useTaskStore } from "@/lib/taskStore";

/**
 * Watches the task store for changes relevant to the current user
 * and fires browser Notification API alerts when the tab is hidden.
 */
export function useNotifications() {
  const { tasks, currentUser } = useTaskStore();
  const prevTasksRef = useRef<typeof tasks>([]);

  useEffect(() => {
    if (!currentUser || currentUser === "0xCelo...Tasks") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const prev = prevTasksRef.current;
    if (prev.length === 0) { prevTasksRef.current = tasks; return; }

    for (const task of tasks) {
      const old = prev.find((t) => t.id === task.id);
      if (!old || old.status === task.status) continue;

      // Notify creator when work is submitted
      if (task.creator === currentUser && task.status === "submitted" && old.status !== "submitted") {
        notify(`Work submitted on "${task.title}"`, "Review the submission and approve or request changes.");
      }
      // Notify worker when approved
      if (task.acceptor === currentUser && task.status === "approved" && old.status !== "approved") {
        notify(`"${task.title}" approved!`, "The creator approved your work. Payment will be released soon.");
      }
      // Notify worker when paid
      if (task.acceptor === currentUser && task.status === "paid" && old.status !== "paid") {
        notify(`Payment received for "${task.title}"`, `${task.reward} ${task.currency} has been sent to your wallet.`);
      }
      // Notify worker when revision requested
      if (task.acceptor === currentUser && task.status === "in_progress" && old.status === "submitted") {
        notify(`Revision requested on "${task.title}"`, task.creatorFeedback ?? "The creator wants changes.");
      }
    }

    prevTasksRef.current = tasks;
  }, [tasks, currentUser]);
}

function notify(title: string, body: string) {
  if (document.visibilityState === "visible") return; // only when tab is hidden
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/celoTasklogo.png" });
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body, icon: "/celoTasklogo.png" });
    });
  }
}
