import { TaskSkeleton, StatSkeleton } from "@/components/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-7 w-32" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatSkeleton /><StatSkeleton /><StatSkeleton />
      </div>
      <div className="skeleton h-10 w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <TaskSkeleton key={i} />)}
      </div>
    </div>
  );
}
