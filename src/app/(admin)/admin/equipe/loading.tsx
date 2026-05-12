function SkeletonMember() {
  return (
    <div className="rounded-xl border border-white/5 bg-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/5 rounded" />
        <div className="h-3 w-40 bg-white/5 rounded" />
      </div>
      <div className="w-16 h-7 bg-white/5 rounded shrink-0" />
    </div>
  );
}

export default function EquipeLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-8 w-28 bg-white/5 rounded-lg mb-1" />
      <div className="h-4 w-52 bg-white/5 rounded mb-6" />
      <div className="h-9 w-36 bg-white/5 rounded-lg mb-6" />
      <div className="space-y-3">
        <SkeletonMember />
        <SkeletonMember />
        <SkeletonMember />
      </div>
    </div>
  );
}
