export default function ApprendreLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="rounded-2xl bg-parchment-200 dark:bg-primary-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-parchment-300 dark:bg-primary-700" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-parchment-300 dark:bg-primary-700 rounded" />
            <div className="h-4 w-64 bg-parchment-300 dark:bg-primary-700 rounded" />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="h-8 w-24 bg-parchment-300 dark:bg-primary-700 rounded-full" />
          <div className="h-8 w-24 bg-parchment-300 dark:bg-primary-700 rounded-full" />
          <div className="h-8 w-24 bg-parchment-300 dark:bg-primary-700 rounded-full" />
        </div>
      </div>

      {/* Search */}
      <div className="h-12 w-full bg-parchment-200 dark:bg-primary-800 rounded-xl mb-4" />

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-parchment-200 dark:bg-primary-800 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-52 bg-parchment-200 dark:bg-primary-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
