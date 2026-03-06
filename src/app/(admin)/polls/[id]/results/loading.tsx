export default function ResultsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back + header */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-brand-light-grey/40 rounded" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-brand-light-mauve rounded-lg" />
            <div className="h-4 w-40 bg-brand-light-grey/40 rounded" />
          </div>
          <div className="h-10 w-28 bg-brand-light-grey/30 rounded-xl" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 space-y-3">
            <div className="h-3 w-20 bg-brand-light-grey/40 rounded" />
            <div className="h-8 w-12 bg-brand-light-mauve rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart cards */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 bg-brand-alabaster">
            <div className="h-5 w-48 bg-brand-light-mauve rounded-lg" />
          </div>
          <div className="p-6">
            <div className="h-64 w-full bg-brand-light-grey/20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
