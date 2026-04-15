"use client";
import { useState } from "react";
import { TaskStatus } from "@/lib/taskStore";
import { useTaskStore } from "@/lib/taskStore";
import TaskCard from "@/components/TaskCard";
import { ToastType } from "@/hooks/useToast";
import { IconPlus, IconCheck, IconSearch } from "@/components/Icons";

interface Props { onToast: (msg: string, type?: ToastType) => void; }

const STATUS_FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

export default function MyTasks({ onToast }: Props) {
  const { myCreatedTasks, myAcceptedTasks, completeTask, releasePayment } = useTaskStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const handle = async (action: (id: string) => void, id: string, msg: string) => {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 800)); // simulate tx delay
    action(id);
    onToast(msg, "success");
    setLoadingId(null);
  };

  const created  = myCreatedTasks.filter((t) => filter === "all" || t.status === filter);
  const accepted = myAcceptedTasks.filter((t) => filter === "all" || t.status === filter);
  const isEmpty  = created.length === 0 && accepted.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === value ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
            <IconSearch className="w-7 h-7 text-teal-500/40" />
          </div>
          <p className="text-white font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm max-w-xs">
            {filter !== "all" ? `No ${filter.replace("_", " ")} tasks.` : "You haven't created or accepted any tasks yet."}
          </p>
        </div>
      ) : (
        <>
          {created.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
                  <IconPlus className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Created Tasks <span className="text-sm text-slate-500 font-normal">({created.length})</span></h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {created.map((task) => (
                  <TaskCard key={task.id} task={task}
                    onRelease={(id) => handle(releasePayment, id, "Payment released!")}
                    loading={loadingId === task.id} />
                ))}
              </div>
            </section>
          )}
          {accepted.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <IconCheck className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Accepted Tasks <span className="text-sm text-slate-500 font-normal">({accepted.length})</span></h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accepted.map((task) => (
                  <TaskCard key={task.id} task={task}
                    onComplete={(id) => handle(completeTask, id, "Task marked as completed!")}
                    loading={loadingId === task.id} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
