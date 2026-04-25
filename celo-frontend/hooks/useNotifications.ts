"use client";
import { useEffect, useRef } from "react";
import { useTaskStore } from "@/lib/taskStore";

export function useNotifications() {
  const { tasks, currentUser } = useTaskStore();
  const prevTasksRef = useRef<typeof tasks>([]);

  useEffect(() => {
    if (!currentUser) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    // Only fire if user has already granted permission — never auto-request
    if (Notification.permission !== "granted") return;

    const prev = prevTasksRef.current;
    if (prev.length === 0) { prevTasksRef.current = tasks; return; }

    for (const task of tasks) {
      const old = prev.find((t) => t.id === task.id);
      if (!old || old.status === task.status) continue;

      if (task.creator === currentUser && task.status === "submitted" && old.status !== "submitted")
        fire(`Work submitted on "${task.title}"`, "Review and approve or request changes.");

      if (task.acceptor === currentUser && task.status === "approved" && old.status !== "approved")
        fire(`"${task.title}" approved!`, "Payment will be released soon.");

      if (task.acceptor === currentUser && task.status === "paid" && old.status !== "paid")
        fire(`Payment received for "${task.title}"`, `${task.reward} ${task.currency} sent to your wallet.`);

      if (task.acceptor === currentUser && task.status === "in_progress" && old.status === "submitted")
        fire(`Revision requested on "${task.title}"`, task.creatorFeedback ?? "The creator wants changes.");
    }

    prevTasksRef.current = tasks;
  }, [tasks, currentUser]);
}

function fire(title: string, body: string) {
  if (document.visibilityState === "visible") return;
  new Notification(title, { body, icon: "/celoTasklogo.png" });
}
