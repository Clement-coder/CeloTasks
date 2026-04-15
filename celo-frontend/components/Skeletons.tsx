export function TaskSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-5 w-16" />
      </div>
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-8 w-24" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-2">
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-8 w-32" />
    </div>
  );
}
