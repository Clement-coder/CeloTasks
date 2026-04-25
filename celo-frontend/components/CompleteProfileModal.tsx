"use client";
import { useState, useRef, useEffect } from "react";
import { IconX, IconCheck, IconUsers } from "@/components/Icons";
import { useTaskStore } from "@/lib/taskStore";

interface Props { open: boolean; onClose: () => void; }

export default function CompleteProfileModal({ open, onClose }: Props) {
  const { profile, updateProfile } = useTaskStore();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [avatar, setAvatar] = useState<string | null>(profile?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-sync form fields whenever the modal opens
  useEffect(() => {
    if (open) {
      setName(profile?.displayName ?? "");
      setEmail(profile?.email ?? "");
      setAvatar(profile?.avatarUrl ?? null);
      setError("");
    }
  }, [open, profile?.displayName, profile?.email, profile?.avatarUrl]);

  if (!open) return null;

  async function handleSave() {
    setError("");
    if (!name.trim() && !profile?.displayName) { setError("Display name is required"); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address (e.g. you@gmail.com)"); return; }
    setSaving(true);
    try {
      await updateProfile({ displayName: name.trim(), email: email.trim() || undefined, avatarUrl: avatar ?? undefined });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally { setSaving(false); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-5 fade-up">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
              <IconUsers className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Complete Your Profile</h2>
              <p className="text-slate-500 text-xs">Helps task creators and workers identify you</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-teal-500/50 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-slate-500 text-xs text-center leading-tight px-1">Add photo</span>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="text-slate-400 text-xs leading-relaxed">
            Upload a profile photo.<br />JPG, PNG or GIF, max 2MB.
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs uppercase tracking-wider">Display Name <span className="text-red-400">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500/40 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-slate-400 text-xs uppercase tracking-wider">Email Address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" type="email" autoComplete="email"
            className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500/40 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)"}` }} />
          {/* Domain suggestions */}
          {(() => {
            const DOMAINS = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "icloud.com", "proton.me"];
            const atIdx = email.indexOf("@");
            if (atIdx === -1 || email.length <= atIdx + 1) return null;
            const typed = email.slice(atIdx + 1).toLowerCase();
            const local = email.slice(0, atIdx);
            const suggestions = DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
            if (suggestions.length === 0) return null;
            return (
              <div className="absolute top-full mt-1 left-0 right-0 rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.1)" }}>
                {suggestions.map((domain) => (
                  <button key={domain} type="button"
                    onClick={() => setEmail(`${local}@${domain}`)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                    <span className="text-slate-500">{local}@</span><span className="text-teal-300">{domain}</span>
                  </button>
                ))}
              </div>
            );
          })()}
          {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-red-400 text-xs">Enter a valid email address (e.g. you@gmail.com)</p>
          )}
          <p className="text-slate-600 text-xs">Optional — only visible to you.</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="gradient-btn text-white font-semibold py-3 rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            : <><IconCheck className="w-4 h-4" />Save Profile</>}
        </button>
      </div>
    </div>
  );
}
