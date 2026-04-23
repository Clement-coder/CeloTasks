"use client";

import { useState } from "react";
import {
  TASK_CATEGORIES,
  TASK_CURRENCIES,
  TASK_DIFFICULTIES,
  useTaskStore,
  type TaskCategory,
  type TaskCurrency,
  type TaskDifficulty,
} from "@/lib/taskStore";
import { IconCheck, IconClock, IconCoin, IconPlus, IconSearch, IconZap, IconUsers, IconStar } from "@/components/Icons";
import CustomSelect from "@/components/CustomSelect";

interface Props { onSuccess?: (id: string) => void; }

type FormState = {
  title: string; category: TaskCategory; difficulty: TaskDifficulty;
  reward: string; currency: TaskCurrency; deadline: string;
  estimatedHours: string; description: string; deliverables: string;
  submissionGuide: string; tags: string;
};

const INITIAL_FORM: FormState = {
  title: "", category: "Writing", difficulty: "Quick", reward: "",
  currency: "cUSD", deadline: "", estimatedHours: "", description: "",
  deliverables: "", submissionGuide: "", tags: "",
};

const fieldStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
const fieldCls = "w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/40 transition-colors";

function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-2">
      <span className="text-teal-400">{icon}</span>{text}
    </label>
  );
}

export default function CreateTaskForm({ onSuccess }: Props) {
  const { createTask } = useTaskStore();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deliverables = form.deliverables.split("\n").map((s) => s.trim()).filter(Boolean);
    const tags = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.title.length > 80) errs.title = "Max 80 characters";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.description.length > 700) errs.description = "Max 700 characters";
    if (!form.reward || Number(form.reward) <= 0) errs.reward = "Enter a valid reward";
    if (!form.deadline) errs.deadline = "Deadline is required";
    else if (form.deadline < new Date().toISOString().slice(0, 10)) errs.deadline = "Must be today or future";
    if (!form.estimatedHours || Number(form.estimatedHours) <= 0) errs.estimatedHours = "Required";
    if (deliverables.length === 0) errs.deliverables = "Add at least one deliverable";
    if (!form.submissionGuide.trim()) errs.submissionGuide = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const id = await createTask({
        title: form.title.trim(), description: form.description.trim(),
        reward: form.reward, currency: form.currency, category: form.category,
        difficulty: form.difficulty, deadline: form.deadline,
        estimatedHours: form.estimatedHours, deliverables, submissionGuide: form.submissionGuide.trim(), tags,
      });
      setForm(INITIAL_FORM);
      onSuccess?.(id);
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : "Failed to create task" });
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_360px] gap-6">
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Create Task</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">Brief the work clearly, then publish.</h1>
          <p className="text-slate-400 mt-2 text-sm">Set a reward, deadline, and clear deliverables. Workers apply and you select who works on it.</p>
        </div>

        {errors.submit && (
          <div className="rounded-2xl px-4 py-3 border border-red-400/20 text-red-400 text-sm" style={{ background: "rgba(248,113,113,0.08)" }}>
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <Label icon={<IconZap className="w-3.5 h-3.5" />} text="Task Title" />
            <div className="relative">
              <input className={fieldCls} style={fieldStyle} value={form.title} maxLength={80}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Write a Twitter thread about Celo ecosystem" />
            </div>
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-red-400">{errors.title}</span>
              <span className="text-slate-600">{form.title.length}/80</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label icon={<IconSearch className="w-3.5 h-3.5" />} text="Category" />
            <CustomSelect
              value={form.category}
              onChange={(v) => set("category", v as TaskCategory)}
              options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          {/* Difficulty */}
          <div>
            <Label icon={<IconStar className="w-3.5 h-3.5" />} text="Difficulty" />
            <CustomSelect
              value={form.difficulty}
              onChange={(v) => set("difficulty", v as TaskDifficulty)}
              options={TASK_DIFFICULTIES.map((d) => ({ value: d, label: d }))}
            />
          </div>

          {/* Reward */}
          <div>
            <Label icon={<IconCoin className="w-3.5 h-3.5" />} text="Reward" />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input className={fieldCls} style={fieldStyle} type="number" min="0" step="0.01"
                  value={form.reward} onChange={(e) => set("reward", e.target.value)} placeholder="e.g. 12" />
              </div>
              <CustomSelect
                value={form.currency}
                onChange={(v) => set("currency", v as TaskCurrency)}
                options={TASK_CURRENCIES.map((c) => ({ value: c, label: c }))}
                className="w-28"
              />
            </div>
            <p className="text-red-400 text-xs mt-1.5">{errors.reward}</p>
            {form.currency === "CELO" && (
              <p className="text-amber-400 text-xs mt-1.5">⚠️ CELO payments are off-chain only — the smart contract escrow uses cUSD.</p>
            )}
          </div>

          {/* Effort */}
          <div>
            <Label icon={<IconClock className="w-3.5 h-3.5" />} text="Effort Estimate (hours)" />
            <input className={fieldCls} style={fieldStyle} type="number" min="1"
              value={form.estimatedHours} onChange={(e) => set("estimatedHours", e.target.value)} placeholder="e.g. 4" />
            <p className="text-red-400 text-xs mt-1.5">{errors.estimatedHours}</p>
          </div>

          {/* Deadline */}
          <div>
            <Label icon={<IconClock className="w-3.5 h-3.5" />} text="Deadline" />
            <input className={fieldCls} style={fieldStyle} type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            <p className="text-red-400 text-xs mt-1.5">{errors.deadline}</p>
          </div>

          {/* Tags */}
          <div>
            <Label icon={<IconSearch className="w-3.5 h-3.5" />} text="Tags" />
            <input className={fieldCls} style={fieldStyle} value={form.tags}
              onChange={(e) => set("tags", e.target.value)} placeholder="growth, thread, launch (comma separated)" />
            <p className="text-slate-600 text-xs mt-1.5">Comma separated — helps workers find your task.</p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Label icon={<IconCheck className="w-3.5 h-3.5" />} text="Description" />
            <textarea className={`${fieldCls} min-h-32 resize-y`} style={fieldStyle}
              value={form.description} maxLength={700}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Explain the goal, what good work looks like, and any context the worker needs." />
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-red-400">{errors.description}</span>
              <span className="text-slate-600">{form.description.length}/700</span>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <Label icon={<IconCheck className="w-3.5 h-3.5" />} text="Deliverables" />
            <textarea className={`${fieldCls} min-h-28 resize-y`} style={fieldStyle}
              value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)}
              placeholder={"One item per line:\nFinal asset link\nShort written summary"} />
            <p className="text-red-400 text-xs mt-1.5">{errors.deliverables}</p>
          </div>

          {/* Submission Guide */}
          <div>
            <Label icon={<IconUsers className="w-3.5 h-3.5" />} text="Submission Instructions" />
            <textarea className={`${fieldCls} min-h-28 resize-y`} style={fieldStyle}
              value={form.submissionGuide} onChange={(e) => set("submissionGuide", e.target.value)}
              placeholder="Tell the worker exactly how to submit — links, screenshots, notes, or files." />
            <p className="text-red-400 text-xs mt-1.5">{errors.submissionGuide}</p>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="gradient-btn text-white font-semibold py-3.5 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing…</>
            : <><IconPlus className="w-4 h-4" />Publish Task</>}
        </button>
      </form>

      {/* Live Preview */}
      <aside className="glass-card rounded-3xl p-6 flex flex-col gap-5 self-start xl:sticky xl:top-24">
        <div>
          <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Live Preview</p>
          <h2 className="text-2xl font-bold text-white leading-tight">{form.title || "Your task headline appears here"}</h2>
        </div>
        <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Reward</p>
          <p className="gradient-text text-3xl font-bold">{form.reward || "0"} <span className="text-base">{form.currency}</span></p>
          <p className="text-slate-500 text-xs mt-2">{form.category} · {form.difficulty} · {form.estimatedHours || "0"}h</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Description</p>
          <p className="text-slate-300 text-sm leading-relaxed">{form.description || "Add context, expectations, and quality criteria."}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Deliverables</p>
          <ul className="flex flex-col gap-2 text-sm text-slate-300">
            {form.deliverables.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />{item}
              </li>
            ))}
            {!form.deliverables.trim() && <li className="text-slate-500">Deliverables appear here as you type.</li>}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5).map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-teal-500/25 text-teal-300 bg-teal-500/10">#{tag}</span>
          ))}
        </div>
      </aside>
    </div>
  );
}
