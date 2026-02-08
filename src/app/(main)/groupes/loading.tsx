export default function GroupesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-parchment-200 dark:bg-primary-800" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-parchment-200 dark:bg-primary-800 rounded" />
            <div className="h-4 w-56 bg-parchment-200 dark:bg-primary-800 rounded" />
          </div>
        </div>
        <div className="h-10 w-32 bg-parchment-200 dark:bg-primary-800 rounded-xl hidden sm:block" />
      </div>

      {/* Search */}
      <div className="h-12 w-full bg-parchment-200 dark:bg-primary-800 rounded-xl mb-6" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-parchment-200 dark:bg-primary-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
