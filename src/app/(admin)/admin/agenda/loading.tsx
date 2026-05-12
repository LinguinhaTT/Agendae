function SkeletonRow() {
  return (
    <div className="rounded-xl border border-white/5 bg-card p-4 flex gap-4">
      <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 bg-white/5 rounded" />
        <div className="h-3 w-56 bg-white/5 rounded" />
        <div className="h-3 w-28 bg-white/5 rounded" />
      </div>
      <div className="w-16 h-5 bg-white/5 rounded shrink-0" />
    </div>
  );
}

export default function AgendaLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="h-8 w-28 bg-white/5 rounded-lg mb-1" />
          <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-40 bg-white/5 rounded-lg" />
      </div>

      <div className="flex gap-1 mb-6">
        <div className="h-8 w-20 bg-white/5 rounded-lg" />
        <div className="h-8 w-24 bg-white/5 rounded-lg" />
        <div className="h-8 w-24 bg-white/5 rounded-lg" />
        <div className="h-8 w-24 bg-white/5 rounded-lg" />
        <div className="h-8 w-24 bg-white/5 rounded-lg" />
      </div>

      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
