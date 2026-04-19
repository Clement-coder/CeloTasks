"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateTaskForm from "@/components/CreateTaskForm";
import { useTaskStore } from "@/lib/taskStore";
import { IconShield, IconArrowRight } from "@/components/Icons";

export default function CreateTaskPage() {
  const router = useRouter();
  const { profile, myAddress } = useTaskStore();
  const isVerified = profile?.isVerified ?? false;

  if (myAddress && !isVerified) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
          <IconShield className="w-7 h-7 text-sky-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">KYC Required</h2>
          <p className="text-slate-400 max-w-xs mx-auto">You need to complete identity verification before posting tasks.</p>
        </div>
        <Link href="/profile"
          className="gradient-btn text-white font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2">
          Complete KYC on Profile <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <CreateTaskForm onSuccess={(id) => router.push(`/task/${id}`)} />
    </div>
  );
}
