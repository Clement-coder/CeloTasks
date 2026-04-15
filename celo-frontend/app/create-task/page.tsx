"use client";

import { useRouter } from "next/navigation";
import CreateTaskForm from "@/components/CreateTaskForm";

export default function CreateTaskPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <CreateTaskForm onSuccess={(id) => router.push(`/task/${id}`)} />
    </div>
  );
}
