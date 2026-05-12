function SkeletonService() {
  return (
    <div className="rounded-xl border border-white/5 bg-card p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/5 rounded" />
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>
      <div className="w-20 h-5 bg-white/5 rounded shrink-0" />
    </div>
  );
}

export default function ServicosLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-8 w-32 bg-white/5 rounded-lg mb-1" />
      <div className="h-4 w-56 bg-white/5 rounded mb-6" />
      <div className="h-9 w-36 bg-white/5 rounded-lg mb-6" />
      <div className="space-y-3">
        <SkeletonService />
        <SkeletonService />
        <SkeletonService />
        <SkeletonService />
        <SkeletonService />
      </div>
    </div>
  );
}
