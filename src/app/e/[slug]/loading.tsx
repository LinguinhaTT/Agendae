export default function EstablishmentLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-52 md:h-72 bg-white/5" />

      <div className="max-w-3xl mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white/10 shrink-0" />
            <div className="flex-1 pb-1 space-y-2">
              <div className="h-4 w-20 bg-white/5 rounded" />
              <div className="h-7 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-3 w-32 bg-white/5 rounded" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-3/4 bg-white/5 rounded" />
          </div>
        </div>

        <div className="h-11 bg-primary/20 rounded-xl mb-8" />

        <div className="mb-10">
          <div className="h-5 w-20 bg-white/5 rounded mb-4" />
          <div className="space-y-2">
            <div className="rounded-xl border border-white/5 p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-white/5 rounded" />
                <div className="h-3 w-40 bg-white/5 rounded" />
              </div>
              <div className="w-14 h-5 bg-white/5 rounded shrink-0" />
            </div>
            <div className="rounded-xl border border-white/5 p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-white/5 rounded" />
                <div className="h-3 w-32 bg-white/5 rounded" />
              </div>
              <div className="w-14 h-5 bg-white/5 rounded shrink-0" />
            </div>
            <div className="rounded-xl border border-white/5 p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-3 w-44 bg-white/5 rounded" />
              </div>
              <div className="w-14 h-5 bg-white/5 rounded shrink-0" />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="h-5 w-24 bg-white/5 rounded mb-4" />
          <div className="grid grid-cols-3 gap-1.5">
            <div className="aspect-square rounded-lg bg-white/5" />
            <div className="aspect-square rounded-lg bg-white/5" />
            <div className="aspect-square rounded-lg bg-white/5" />
            <div className="aspect-square rounded-lg bg-white/5" />
            <div className="aspect-square rounded-lg bg-white/5" />
            <div className="aspect-square rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
