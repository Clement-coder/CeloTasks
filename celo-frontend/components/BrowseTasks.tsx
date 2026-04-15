"use client";

import { useEffect, useMemo, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { TaskSkeleton } from "@/components/Skeletons";
import { IconPlus, IconSearch } from "@/components/Icons";
import { TASK_CATEGORIES, useTaskStore } from "@/lib/taskStore";
import { type ToastType } from "@/hooks/useToast";

interface Props {
  onToast: (msg: string, type?: ToastType) => void;
}

const SORTS = ["Newest", "Reward ↑", "Reward ↓", "Deadline Soon"];

export default function BrowseTasks({ onToast }: Props) {
  const { browseTasks, acceptTask } = useTaskStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let items = browseTasks.filter((task) => {
      const haystack = `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (category !== "All" && task.category !== category) return false;
      return true;
    });

    if (sort === "Reward ↑") items = [...items].sort((a, b) => Number(a.reward) - Number(b.reward));
    if (sort === "Reward ↓") items = [...items].sort((a, b) => Number(b.reward) - Number(a.reward));
    if (sort === "Deadline Soon") items = [...items].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    if (sort === "Newest") items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [browseTasks, category, search, sort]);

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    await new Promise((resolve) => setTimeout(resolve, 700));
    acceptTask(id);
    onToast("Task accepted. It has moved into your work queue.", "success");
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-2">Discover Work</p>
            <h2 className="text-2xl font-bold text-white">Open tasks ready for pickup</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <IconPlus className="w-3.5 h-3.5 text-teal-400" />
            {filtered.length} matching tasks
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, or tags"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-3 rounded-2xl text-sm text-slate-300 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {SORTS.map((item) => (
              <option key={item} value={item} style={{ background: "#0b0f14" }}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", ...TASK_CATEGORIES].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                category === item ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
            <IconSearch className="w-7 h-7 text-teal-400/60" />
          </div>
          <h3 className="text-white text-xl font-semibold">No tasks match this filter</h3>
          <p className="text-slate-500 mt-2 max-w-md">Try another category or keyword. Once contract writes are added, this same UI can be backed by on-chain task discovery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onAccept={handleAccept} loading={loadingId === task.id} />
          ))}
        </div>
      )}
    </div>
  );
}
