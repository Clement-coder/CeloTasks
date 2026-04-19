"use client";
import { useState, useRef, useEffect } from "react";
import { IconArrowDown } from "@/components/Icons";

interface Option { value: string; label: string; }

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm text-white focus:outline-none transition-colors cursor-pointer"
        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${open ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.08)"}` }}
      >
        <span className={selected ? "text-white" : "text-slate-500"}>{selected?.label ?? placeholder ?? "Select…"}</span>
        <IconArrowDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.1)" }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                opt.value === value
                  ? "text-teal-400 bg-teal-500/10"
                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
