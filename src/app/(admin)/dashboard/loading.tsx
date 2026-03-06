export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-brand-light-mauve rounded-lg" />
          <div className="h-4 w-60 bg-brand-light-grey/50 rounded" />
        </div>
        <div className="h-10 w-36 bg-brand-light-mauve rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-brand-light-mauve rounded-xl" />
              <div className="h-5 w-14 bg-brand-light-grey/40 rounded-full" />
            </div>
            <div className="h-3 w-20 bg-brand-light-grey/40 rounded" />
            <div className="h-8 w-10 bg-brand-light-mauve rounded-lg" />
          </div>
        ))}
      </div>

      {/* Recent polls */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="h-5 w-32 bg-brand-light-mauve rounded-lg" />
          <div className="h-4 w-14 bg-brand-light-grey/40 rounded" />
        </div>
        <div className="px-6 py-2.5 bg-brand-alabaster grid grid-cols-4 gap-4">
          {["", "", "", ""].map((_, i) => (
            <div key={i} className="h-3 w-20 bg-brand-light-grey/40 rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-3 flex items-center gap-4">
            <div className="w-9 h-9 bg-brand-light-mauve rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-brand-light-mauve rounded" />
              <div className="h-3 w-1/3 bg-brand-light-grey/40 rounded" />
            </div>
            <div className="h-6 w-16 bg-brand-light-grey/30 rounded-full hidden md:block" />
            <div className="flex-1 h-1.5 bg-brand-light-grey/30 rounded-full hidden md:block" />
            <div className="h-3 w-20 bg-brand-light-grey/30 rounded hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
