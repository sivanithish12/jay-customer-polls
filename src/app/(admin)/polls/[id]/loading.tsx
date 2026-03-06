export default function PollDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-5">
        <div className="h-3.5 w-16 bg-brand-light-grey/50 rounded" />
        <div className="h-3.5 w-3.5 bg-brand-light-grey/30 rounded" />
        <div className="h-3.5 w-32 bg-brand-light-mauve rounded" />
      </div>

      {/* Hero header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-56 bg-brand-light-mauve rounded-lg" />
            <div className="h-6 w-20 bg-brand-light-grey/40 rounded-full" />
          </div>
          <div className="h-4 w-48 bg-brand-light-grey/40 rounded" />
        </div>
        <div className="h-10 w-36 bg-brand-light-mauve rounded-xl" />
      </div>

      {/* 2+1 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-light-mauve rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-4/5 bg-brand-light-mauve rounded" />
                <div className="h-3 w-1/3 bg-brand-light-grey/40 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-4 w-1/3 bg-brand-light-grey/40 rounded" />
                    <div className="h-4 w-12 bg-brand-light-grey/30 rounded" />
                  </div>
                  <div className="h-2 w-full bg-brand-light-grey/25 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          {/* Share link card */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-3">
            <div className="h-4 w-24 bg-brand-light-mauve rounded" />
            <div className="h-11 w-full bg-brand-alabaster rounded-xl" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
              <div className="h-3 w-20 bg-brand-light-grey/40 rounded" />
              <div className="space-y-3">
                <div className="h-10 w-full bg-brand-light-mauve rounded-xl" />
                <div className="h-10 w-full bg-brand-light-grey/30 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
