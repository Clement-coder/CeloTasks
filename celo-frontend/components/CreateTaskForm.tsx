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
import { IconCheck, IconCoin, IconPlus, IconZap } from "@/components/Icons";

interface Props {
  onSuccess?: (id: string) => void;
}

type FormState = {
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  reward: string;
  currency: TaskCurrency;
  deadline: string;
  estimatedHours: string;
  description: string;
  deliverables: string;
  submissionGuide: string;
  tags: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  category: "Writing",
  difficulty: "Quick",
  reward: "",
  currency: "cUSD",
  deadline: "",
  estimatedHours: "",
  description: "",
  deliverables: "",
  submissionGuide: "",
  tags: "",
};

export default function CreateTaskForm({ onSuccess }: Props) {
  const { createTask } = useTaskStore();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    const deliverables = form.deliverables.split("\n").map((item) => item.trim()).filter(Boolean);
    const tags = form.tags.split(",").map((item) => item.trim()).filter(Boolean);

    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (form.title.length > 80) nextErrors.title = "Max 80 characters";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (form.description.length > 700) nextErrors.description = "Max 700 characters";
    if (!form.reward || Number(form.reward) <= 0) nextErrors.reward = "Enter a valid reward";
    if (!form.deadline) nextErrors.deadline = "Deadline is required";
    else if (form.deadline < new Date().toISOString().slice(0, 10)) nextErrors.deadline = "Deadline must be today or in the future";
    if (!form.estimatedHours || Number(form.estimatedHours) <= 0) nextErrors.estimatedHours = "Estimate the effort";
    if (deliverables.length === 0) nextErrors.deliverables = "Add at least one deliverable";
    if (!form.submissionGuide.trim()) nextErrors.submissionGuide = "Explain how workers should submit";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const id = await createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      reward: form.reward,
      currency: form.currency,
      category: form.category,
      difficulty: form.difficulty,
      deadline: form.deadline,
      estimatedHours: form.estimatedHours,
      deliverables,
      submissionGuide: form.submissionGuide.trim(),
      tags,
    });
    setLoading(false);
    setForm(INITIAL_FORM);
    onSuccess?.(id);
  };

  const fieldClassName =
    "w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/40 transition-colors";
  const fieldStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_360px] gap-6">
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <p className="text-teal-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Create Task</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">Brief the work clearly, then publish.</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            This frontend stays fully mock for now, but the workflow matches the real product: post, accept, submit, review, and release payout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IconZap className="w-3.5 h-3.5 text-teal-400" />
              Task Title
            </label>
            <input
              className={fieldClassName}
              style={fieldStyle}
              value={form.title}
              maxLength={80}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Build a short launch thread for MiniPay users"
            />
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-red-400">{errors.title}</span>
              <span className="text-slate-600">{form.title.length}/80</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
            <select className={fieldClassName} style={fieldStyle} value={form.category} onChange={(e) => updateField("category", e.target.value as TaskCategory)}>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category} style={{ background: "#0b0f14" }}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Difficulty</label>
            <select className={fieldClassName} style={fieldStyle} value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value as TaskDifficulty)}>
              {TASK_DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty} style={{ background: "#0b0f14" }}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IconCoin className="w-3.5 h-3.5 text-teal-400" />
              Reward
            </label>
            <div className="flex gap-2">
              <input
                className={fieldClassName}
                style={fieldStyle}
                type="number"
                min="0"
                step="0.01"
                value={form.reward}
                onChange={(e) => updateField("reward", e.target.value)}
                placeholder="12"
              />
              <select className="px-3 py-3 rounded-2xl text-sm text-white focus:outline-none" style={fieldStyle} value={form.currency} onChange={(e) => updateField("currency", e.target.value as TaskCurrency)}>
                {TASK_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency} style={{ background: "#0b0f14" }}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-red-400 text-xs mt-1.5">{errors.reward}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Effort Estimate</label>
            <input
              className={fieldClassName}
              style={fieldStyle}
              type="number"
              min="1"
              value={form.estimatedHours}
              onChange={(e) => updateField("estimatedHours", e.target.value)}
              placeholder="4"
            />
            <p className="text-red-400 text-xs mt-1.5">{errors.estimatedHours}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Deadline</label>
            <input className={fieldClassName} style={fieldStyle} type="date" min={new Date().toISOString().slice(0, 10)} value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} />
            <p className="text-red-400 text-xs mt-1.5">{errors.deadline}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Tags</label>
            <input
              className={fieldClassName}
              style={fieldStyle}
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="growth, thread, launch"
            />
            <p className="text-slate-600 text-xs mt-1.5">Comma separated for discovery and profile stats.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IconCheck className="w-3.5 h-3.5 text-teal-400" />
              Description
            </label>
            <textarea
              className={`${fieldClassName} min-h-32 resize-y`}
              style={fieldStyle}
              value={form.description}
              maxLength={700}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Explain the goal, what good work looks like, and any product context the worker needs."
            />
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-red-400">{errors.description}</span>
              <span className="text-slate-600">{form.description.length}/700</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Deliverables</label>
            <textarea
              className={`${fieldClassName} min-h-28 resize-y`}
              style={fieldStyle}
              value={form.deliverables}
              onChange={(e) => updateField("deliverables", e.target.value)}
              placeholder={"One item per line\nFinal asset link\nShort summary"}
            />
            <p className="text-red-400 text-xs mt-1.5">{errors.deliverables}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Submission Instructions</label>
            <textarea
              className={`${fieldClassName} min-h-28 resize-y`}
              style={fieldStyle}
              value={form.submissionGuide}
              onChange={(e) => updateField("submissionGuide", e.target.value)}
              placeholder="Tell the worker exactly how to submit proof, links, screenshots, or notes."
            />
            <p className="text-red-400 text-xs mt-1.5">{errors.submissionGuide}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-btn text-white font-semibold py-3.5 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <IconPlus className="w-4 h-4" />
              Publish Mock Task
            </>
          )}
        </button>
      </form>

      <aside className="glass-card rounded-3xl p-6 flex flex-col gap-5 self-start xl:sticky xl:top-24">
        <div>
          <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Live Preview</p>
          <h2 className="text-2xl font-bold text-white leading-tight">{form.title || "Your task headline appears here"}</h2>
        </div>

        <div className="rounded-2xl p-4 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Reward</p>
          <p className="gradient-text text-3xl font-bold">
            {form.reward || "0"} <span className="text-base">{form.currency}</span>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {form.category} · {form.difficulty} · {form.estimatedHours || "0"}h estimate
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Description Snapshot</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {form.description || "Add product context, expectations, and how quality will be judged."}
          </p>
        </div>

        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Deliverables</p>
          <ul className="flex flex-col gap-2 text-sm text-slate-300">
            {(form.deliverables.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 4) || []).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
            {!form.deliverables.trim() && <li className="text-slate-500">Deliverables will show here as you type.</li>}
          </ul>
        </div>

        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Submission Expectations</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {form.submissionGuide || "Explain whether workers should submit links, screenshots, files, or short written notes."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5)
            .map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-teal-500/25 text-teal-300 bg-teal-500/10">
                #{tag}
              </span>
            ))}
        </div>
      </aside>
    </div>
  );
}
