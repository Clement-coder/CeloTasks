"use client";
import { useState } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { ToastType } from "@/hooks/useToast";
import { IconZap, IconCheck, IconCoin } from "@/components/Icons";

interface Props {
  onSuccess: () => void;
  onToast: (msg: string, type?: ToastType) => void;
}

export default function CreateTaskForm({ onSuccess, onToast }: Props) {
  const { createTask } = useTaskStore();
  const [form, setForm] = useState({ title: "", description: "", reward: "", currency: "cUSD" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.length > 80) errs.title = "Max 80 characters";
    if (!form.description.trim()) errs.description = "Description is required";
    else if (form.description.length > 500) errs.description = "Max 500 characters";
    if (!form.reward || parseFloat(form.reward) <= 0) errs.reward = "Enter a valid reward amount";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate tx
    createTask(form.title, form.description, form.reward, form.currency);
    setLoading(false);
    onSuccess();
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-colors focus:border-teal-500/50";
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider mb-2">
          <IconZap className="w-3.5 h-3.5 text-teal-400" /> Task Title
        </label>
        <input className={inputClass} style={inputStyle} placeholder="e.g. Write a Twitter thread about Celo"
          value={form.title} maxLength={80} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="flex justify-between mt-1">
          {errors.title ? <p className="text-red-400 text-xs">{errors.title}</p> : <span />}
          <p className="text-slate-600 text-xs">{form.title.length}/80</p>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider mb-2">
          <IconCheck className="w-3.5 h-3.5 text-teal-400" /> Description
        </label>
        <textarea className={`${inputClass} resize-none h-24`} style={inputStyle}
          placeholder="Describe the task requirements in detail..."
          value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex justify-between mt-1">
          {errors.description ? <p className="text-red-400 text-xs">{errors.description}</p> : <span />}
          <p className="text-slate-600 text-xs">{form.description.length}/500</p>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider mb-2">
          <IconCoin className="w-3.5 h-3.5 text-teal-400" /> Reward
        </label>
        <div className="flex gap-2">
          <input className={inputClass} style={inputStyle} type="number" min="0" step="0.01" placeholder="e.g. 10"
            value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} />
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="px-3 py-3 rounded-xl text-white text-sm focus:outline-none cursor-pointer shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="cUSD" style={{ background: "#0b0f14" }}>cUSD</option>
            <option value="CELO" style={{ background: "#0b0f14" }}>CELO</option>
          </select>
        </div>
        {errors.reward && <p className="text-red-400 text-xs mt-1">{errors.reward}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="gradient-btn text-white font-semibold py-3.5 rounded-xl mt-2 cursor-pointer disabled:opacity-60 w-full flex items-center justify-center gap-2">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
          : <><IconZap className="w-4 h-4" />Create Task</>}
      </button>
    </form>
  );
}
