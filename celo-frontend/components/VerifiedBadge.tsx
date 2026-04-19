import { IconCheck } from "@/components/Icons";

interface Props { className?: string; }

export default function VerifiedBadge({ className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
      style={{
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.3)",
        color: "#4ade80",
        boxShadow: "0 0 8px rgba(34,197,94,0.15)",
      }}>
      <IconCheck className="w-3 h-3" />
      Verified
    </span>
  );
}
