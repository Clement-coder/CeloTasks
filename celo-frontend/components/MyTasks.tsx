"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import { IconCheck, IconCoin, IconPlus, IconSearch, IconX, IconZap } from "@/components/Icons";
import { useTaskStore, type TaskStatus } from "@/lib/taskStore";
import { type ToastType } from "@/hooks/useToast";

interface Props {
  onToast: (msg: string, type?: ToastType) => void;
}

const STATUS_FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Needs Review", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
];

export default function MyTasks({ onToast }: Props) {
  const router = useRouter();
  const { myCreatedTasks, myAcceptedTasks, reviewQueue, paymentQueue } = useTaskStore();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const created = myCreatedTasks.filter((task) => task.status !== "cancelled" && (filter === "all" || task.status === filter));
  const cancelled = myCreatedTasks.filter((task) => task.status === "cancelled" && (filter === "all" || filter === "cancelled"));
  const accepted = myAcceptedTasks.filter((task) => filter === "all" || task.status === filter);
  const reviews = reviewQueue.filter((task) => filter === "all" || task.status === filter);
  const payouts = paymentQueue.filter((task) => filter === "all" || task.status === filter);

  const isEmpty = created.length === 0 && cancelled.length === 0 && accepted.length === 0 && reviews.length === 0 && payouts.length === 0;

  const goToTask = (id: string) => router.push(`/task/${id}`);

  const sections = [
    { key: "review",   title: "Needs Your Review",  icon: <IconCheck className="w-4 h-4 text-sky-300" />,    desc: "Submissions waiting for your approval",    data: reviews, tone: "rgba(56,189,248,0.08)",  actionLabel: (status: TaskStatus) => status === "submitted" ? "Review" : "Open" },
    { key: "payout",   title: "Ready For Payout",   icon: <IconCoin className="w-4 h-4 text-fuchsia-300" />, desc: "Approved work — release payment now",      data: payouts, tone: "rgba(217,70,239,0.08)", actionLabel: () => "Pay Now" },
    { key: "created",  title: "Created By You",      icon: <IconPlus className="w-4 h-4 text-teal-400" />,   desc: "Tasks you posted to the marketplace",      data: created, tone: "rgba(20,184,166,0.08)", actionLabel: (status: TaskStatus) => status === "in_progress" ? "Monitor" : "Open" },
    { key: "accepted", title: "Assigned To You",     icon: <IconZap className="w-4 h-4 text-green-300" />,   desc: "Tasks you accepted and are working on",    data: accepted, tone: "rgba(34,197,94,0.08)", actionLabel: (status: TaskStatus) => status === "in_progress" ? "Continue" : status === "approved" ? "Awaiting Pay" : "Open" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === value ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-3xl py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
            <IconSearch className="w-7 h-7 text-teal-400/50" />
          </div>
          <h3 className="text-white text-xl font-semibold">Nothing in this queue yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">Once you create, accept, submit, or approve tasks, this workspace becomes your operating dashboard.</p>
        </div>
      ) : (
        <>
          {sections
            .filter((section) => section.data.length > 0)
            .map((section) => (
              <section key={section.key} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08]" style={{ background: section.tone }}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {section.title} <span className="text-sm text-slate-500 font-normal">({section.data.length})</span>
                    </h3>
                    <p className="text-slate-500 text-xs">{section.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.data.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      primaryAction={{
                        label: section.actionLabel(task.status),
                        onClick: (id) => goToTask(id),
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}

          {cancelled.length > 0 && (
            <section className="flex flex-col gap-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-red-400/20" style={{ background: "rgba(248,113,113,0.08)" }}>
                  <IconX className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-400">
                    Cancelled <span className="text-sm text-slate-600 font-normal">({cancelled.length})</span>
                  </h3>
                  <p className="text-slate-600 text-xs">Tasks cancelled by the creator</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cancelled.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
