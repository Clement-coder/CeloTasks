"use client";
import { Toast } from "@/hooks/useToast";
import { IconCheck, IconX, IconInfo } from "@/components/Icons";

const CONFIG: Record<Toast["type"], { Icon: typeof IconCheck; color: string; bg: string }> = {
  success: { Icon: IconCheck, color: "text-green-400",  bg: "border-green-500/25 bg-green-500/5" },
  error:   { Icon: IconX,     color: "text-red-400",    bg: "border-red-500/25 bg-red-500/5" },
  info:    { Icon: IconInfo,  color: "text-teal-400",   bg: "border-teal-500/25 bg-teal-500/5" },
};

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const { Icon, color, bg } = CONFIG[t.type];
        return (
          <div key={t.id} onClick={() => onRemove(t.id)}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 border pointer-events-auto cursor-pointer fade-up backdrop-blur-xl ${bg}`}
            style={{ backdropFilter: "blur(16px)" }}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm text-slate-200 flex-1">{t.message}</span>
            <IconX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
