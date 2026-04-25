"use client";
import { useState } from "react";
import { IconX, IconStar, IconCheck } from "@/components/Icons";
import { getSupabase } from "@/utils/supabase/client";

interface Props {
  open: boolean;
  taskId: string;
  taskTitle: string;
  workerAddress: string;
  raterAddress: string;
  onClose: () => void;
  onDone: () => void;
}

export default function RatingModal({ open, taskId, taskTitle, workerAddress, raterAddress, onClose, onDone }: Props) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    if (raterAddress.toLowerCase() === workerAddress.toLowerCase()) {
      setError("You cannot rate yourself."); return;
    }
    setSaving(true);
    try {
      const { error: err } = await getSupabase().from("ratings").upsert({
        task_id:        taskId,
        rater_wallet:   raterAddress.toLowerCase(),
        ratee_wallet:   workerAddress.toLowerCase(),
        stars,
        comment:        comment.trim() || null,
        created_at:     new Date().toISOString(),
      }, { onConflict: "task_id,rater_wallet" });
      if (err) throw err;
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit rating");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-5 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Rate the Worker</h2>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[260px]">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} className="cursor-pointer transition-transform hover:scale-110">
              <IconStar className={`w-8 h-8 ${n <= stars ? "text-amber-400" : "text-slate-600"}`} />
            </button>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm -mt-2">
          {stars === 1 ? "Poor" : stars === 2 ? "Fair" : stars === 3 ? "Good" : stars === 4 ? "Great" : "Excellent"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment for the worker (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button onClick={handleSubmit} disabled={saving}
          className="gradient-btn text-white font-semibold py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            : <><IconCheck className="w-4 h-4" />Submit Rating</>}
        </button>
      </div>
    </div>
  );
}
