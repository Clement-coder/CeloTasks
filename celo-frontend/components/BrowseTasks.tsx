"use client";
import { useState, useMemo, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import { useTaskStore } from "@/lib/taskStore";
import { ToastType } from "@/hooks/useToast";
import { TaskSkeleton } from "@/components/Skeletons";
import { IconSearch, IconPlus } from "@/components/Icons";

interface Props {
  onToast: (msg: string, type?: ToastType) => void;
  onCreateTask: () => void;
}

const CATEGORIES = ["All", "Writing", "Design", "Dev", "Testing", "Video"];
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Writing: ["write", "thread", "translate", "docs", "blog", "content"],
  Design:  ["design", "logo", "figma", "ui", "ux", "visual"],
  Dev:     ["smart contract", "hardhat", "test", "code", "frontend", "backend"],
  Testing: ["test", "minipay", "bug", "qa", "flow"],
  Video:   ["video", "record", "demo", "walkthrough"],
};
const SORTS = ["Newest", "Reward ↑", "Reward ↓"];

export default function BrowseTasks({ onToast, onCreateTask }: Props) {
  const { browseTasks, acceptTask } = useTaskStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    await new Promise((r) => setTimeout(r, 800)); // simulate tx
    acceptTask(id);
    onToast("Task accepted! Check My Tasks.", "success");
    setLoadingId(null);
  };

  const filtered = useMemo(() => {
    let tasks = browseTasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "All") {
        const kw = CATEGORY_KEYWORDS[category] ?? [];
        const text = (t.title + " " + t.description).toLowerCase();
        if (!kw.some((k) => text.includes(k))) return false;
      }
      return true;
    });
    if (sort === "Reward ↑") tasks = [...tasks].sort((a, b) => parseFloat(a.reward) - parseFloat(b.reward));
    if (sort === "Reward ↓") tasks = [...tasks].sort((a, b) => parseFloat(b.reward) - parseFloat(a.reward));
    if (sort === "Newest")   tasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return tasks;
  }, [browseTasks, search, category, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="text" placeholder="Search tasks..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="text-sm px-3 py-2.5 rounded-xl text-slate-300 cursor-pointer focus:outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {SORTS.map((s) => <option key={s} value={s} style={{ background: "#0b0f14" }}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              category === c ? "border-teal-500/50 text-teal-400 bg-teal-500/10" : "border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white"
            }`}>
            {c}
          </button>
        ))}
      </div>

      <p className="text-slate-500 text-sm">{filtered.length} task{filtered.length !== 1 ? "s" : ""} available</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <TaskSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
            <IconSearch className="w-7 h-7 text-teal-500/50" />
          </div>
          <p className="text-white font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm max-w-xs">
            {search ? `No tasks match "${search}".` : "No open tasks right now. Be the first to create one!"}
          </p>
          <button onClick={onCreateTask}
            className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer mt-2 flex items-center gap-2">
            <IconPlus className="w-4 h-4" /> Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onAccept={handleAccept} loading={loadingId === task.id} />
          ))}
        </div>
      )}
    </div>
  );
}
