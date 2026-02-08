export default function ClassementLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-parchment-200 dark:bg-primary-800" />
        <div className="h-6 w-36 bg-parchment-200 dark:bg-primary-800 rounded" />
      </div>

      {/* Time tabs */}
      <div className="flex gap-2 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-parchment-200 dark:bg-primary-800 rounded-full" />
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 h-40">
        <div className="w-20 h-24 bg-parchment-200 dark:bg-primary-800 rounded-xl" />
        <div className="w-20 h-32 bg-parchment-200 dark:bg-primary-800 rounded-xl" />
        <div className="w-20 h-20 bg-parchment-200 dark:bg-primary-800 rounded-xl" />
      </div>

      {/* Leaderboard list */}
      <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 p-4 space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-6 h-6 bg-parchment-200 dark:bg-primary-700 rounded" />
            <div className="w-10 h-10 bg-parchment-200 dark:bg-primary-700 rounded-full" />
            <div className="flex-1 h-4 bg-parchment-200 dark:bg-primary-700 rounded" />
            <div className="w-16 h-4 bg-parchment-200 dark:bg-primary-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
