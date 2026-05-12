export default function PortfolioLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 w-28 bg-white/5 rounded-lg mb-1" />
      <div className="h-4 w-64 bg-white/5 rounded mb-6" />
      <div className="h-24 bg-white/5 rounded-xl mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
        <div className="aspect-square rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
