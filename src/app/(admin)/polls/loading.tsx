export default function PollsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-28 bg-brand-light-mauve rounded-lg" />
        <div className="h-10 w-36 bg-brand-light-mauve rounded-xl" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 max-w-md bg-white shadow-sm rounded-xl" />
        <div className="h-10 w-24 bg-white shadow-sm rounded-xl" />
        <div className="h-10 w-32 bg-white shadow-sm rounded-xl" />
        <div className="h-10 w-20 bg-white shadow-sm rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-brand-alabaster px-6 py-3.5 flex gap-6">
          {["Poll Question", "Votes", "Status", "Created", "Actions"].map((h) => (
            <div key={h} className="h-3 w-20 bg-brand-light-grey/50 rounded" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-brand-light-mauve rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 bg-brand-light-mauve rounded" />
              <div className="h-3 w-2/5 bg-brand-light-grey/40 rounded" />
            </div>
            <div className="h-3 w-10 bg-brand-light-grey/40 rounded hidden lg:block" />
            <div className="h-6 w-16 bg-brand-light-grey/30 rounded-full" />
            <div className="h-3 w-20 bg-brand-light-grey/30 rounded hidden md:block" />
            <div className="flex gap-1.5 ml-auto">
              <div className="w-8 h-8 bg-brand-light-grey/30 rounded-lg" />
              <div className="w-8 h-8 bg-brand-light-grey/30 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
