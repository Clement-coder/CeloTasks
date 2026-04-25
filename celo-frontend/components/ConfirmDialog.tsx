"use client";
import { IconX } from "@/components/Icons";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, danger }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="glass-card rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 fade-up">
        <div className="flex items-start justify-between gap-2">
          <h3 id="confirm-title" className="text-white font-semibold text-base">{title}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <IconX className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onCancel}
            className="outline-btn flex-1 py-2.5 rounded-xl text-sm text-slate-300 cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer ${danger ? "bg-red-500/80 hover:bg-red-500 transition-colors" : "gradient-btn"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
