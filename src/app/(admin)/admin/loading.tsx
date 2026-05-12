function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-card p-4 flex gap-4">
      <div className="w-14 h-14 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/5 rounded" />
        <div className="h-3 w-48 bg-white/5 rounded" />
        <div className="h-3 w-20 bg-white/5 rounded" />
      </div>
      <div className="w-16 h-6 bg-white/5 rounded shrink-0" />
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-white/5 rounded-lg mb-1" />
      <div className="h-4 w-64 bg-white/5 rounded mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-white/5 bg-card p-4">
          <div className="h-3 w-24 bg-white/5 rounded mb-3" />
          <div className="h-7 w-16 bg-white/5 rounded" />
        </div>
        <div className="rounded-xl border border-white/5 bg-card p-4">
          <div className="h-3 w-24 bg-white/5 rounded mb-3" />
          <div className="h-7 w-16 bg-white/5 rounded" />
        </div>
        <div className="rounded-xl border border-white/5 bg-card p-4">
          <div className="h-3 w-24 bg-white/5 rounded mb-3" />
          <div className="h-7 w-16 bg-white/5 rounded" />
        </div>
        <div className="rounded-xl border border-white/5 bg-card p-4">
          <div className="h-3 w-24 bg-white/5 rounded mb-3" />
          <div className="h-7 w-16 bg-white/5 rounded" />
        </div>
      </div>

      <div className="h-5 w-36 bg-white/5 rounded mb-4" />
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
