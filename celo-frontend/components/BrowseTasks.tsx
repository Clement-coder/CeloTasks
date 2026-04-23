"use client";

import { useEffect, useMemo, useState } from "react";
import TaskCard from "@/components/TaskCard";
import { TaskSkeleton } from "@/components/Skeletons";
import { IconPlus, IconSearch, IconTrendingUp, IconStar, IconCoin, IconClock } from "@/components/Icons";
import { TASK_CATEGORIES, TASK_DIFFICULTIES, useTaskStore } from "@/lib/taskStore";
import { type ToastType } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import CustomSelect from "@/components/CustomSelect";

interface Props {
  onToast: (msg: string, type?: ToastType) => void;
}

const SORT_OPTIONS = [
  { value: "Newest",        label: "Newest first",      icon: IconClock },
  { value: "Reward ↑",      label: "Reward: Low → High", icon: IconCoin },
  { value: "Reward ↓",      label: "Reward: High → Low", icon: IconCoin },
  { value: "Deadline Soon", label: "Deadline: Soonest",  icon: IconTrendingUp },
];

export default function BrowseTasks({ onToast }: Props) {
  const { browseTasks, acceptTask, profile } = useTaskStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [minReward, setMinReward] = useState("");
  const [maxReward, setMaxReward] = useState("");
  const [sort, setSort] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const PAGE_SIZE = 6;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let items = browseTasks.filter((task) => {
      const haystack = `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (category !== "All" && task.category !== category) return false;
      if (difficulty !== "All" && task.difficulty !== difficulty) return false;
      if (minReward && Number(task.reward) < Number(minReward)) return false;
      if (maxReward && Number(task.reward) > Number(maxReward)) return false;
      return true;
    });

    if (sort === "Reward ↑") items = [...items].sort((a, b) => Number(a.reward) - Number(b.reward));
    if (sort === "Reward ↓") items = [...items].sort((a, b) => Number(b.reward) - Number(a.reward));
    if (sort === "Deadline Soon") items = [...items].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    if (sort === "Newest") items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [browseTasks, category, difficulty, search, sort, minReward, maxReward]);

  useEffect(() => { setPage(1); }, [browseTasks, category, difficulty, search, sort, minReward, maxReward]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    try {
      await acceptTask(id);
      onToast("Task accepted. It has moved into your work queue.", "success");
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : "Failed to accept task.", "error");
    } finally {
      setLoadingId(null);
      setPendingAcceptId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Discover Work</p>
            <h2 className="text-base sm:text-2xl font-bold text-white">Open tasks ready for pickup</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{filtered.length} tasks</span>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="outline-btn text-slate-400 text-xs px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 sm:hidden"
            >
              {filtersOpen ? "Hide" : "Filters"}
            </button>
          </div>
        </div>

        <div className={`flex flex-col gap-3 ${filtersOpen ? "flex" : "hidden sm:flex"}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, description, or tags"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min $"
                value={minReward}
                onChange={(e) => setMinReward(e.target.value)}
                className="w-20 px-3 py-2.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <input
                type="number"
                placeholder="Max $"
                value={maxReward}
                onChange={(e) => setMaxReward(e.target.value)}
                className="w-20 px-3 py-2.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <CustomSelect
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                className="w-44"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-slate-500 text-xs flex items-center gap-1"><IconSearch className="w-3 h-3" />Category:</span>
            {["All", ...TASK_CATEGORIES].map((item) => (
              <button key={item} onClick={() => setCategory(item)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  category === item ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
                }`}>{item}</button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-slate-500 text-xs flex items-center gap-1"><IconStar className="w-3 h-3" />Difficulty:</span>
            {["All", ...TASK_DIFFICULTIES].map((item) => (
              <button key={item} onClick={() => setDifficulty(item)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  difficulty === item ? "border-amber-500/50 text-amber-400 bg-amber-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
                }`}>{item}</button>
            ))}
          </div>
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
          <p className="text-slate-500 mt-2 max-w-md">Try another category, keyword, or reward range.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((task) => (
              <TaskCard key={task.id} task={task} onAccept={(id) => setPendingAcceptId(id)} loading={loadingId === task.id} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="outline-btn text-slate-300 text-sm px-4 py-2 rounded-xl disabled:opacity-40 cursor-pointer">← Prev</button>
              <span className="text-slate-500 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="outline-btn text-slate-300 text-sm px-4 py-2 rounded-xl disabled:opacity-40 cursor-pointer">Next →</button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingAcceptId}
        title="Accept this task?"
        message="You'll be committed to completing this task. Make sure you can deliver before the deadline."
        confirmLabel="Accept Task"
        onCancel={() => setPendingAcceptId(null)}
        onConfirm={() => pendingAcceptId && handleAccept(pendingAcceptId)}
      />
    </div>
  );
}
