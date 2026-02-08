export default function ProfilLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Profile card */}
      <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-parchment-200 dark:bg-primary-700 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-parchment-200 dark:bg-primary-700 rounded" />
            <div className="h-4 w-48 bg-parchment-200 dark:bg-primary-700 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-parchment-200 dark:bg-primary-700 rounded-full mb-2" />
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-parchment-200 dark:bg-primary-700 rounded-full" />
          <div className="h-8 w-20 bg-parchment-200 dark:bg-primary-700 rounded-full" />
          <div className="h-8 w-20 bg-parchment-200 dark:bg-primary-700 rounded-full" />
        </div>
      </div>

      {/* Streak card */}
      <div className="h-28 bg-parchment-200 dark:bg-primary-800 rounded-2xl mb-6" />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-parchment-200 dark:bg-primary-800 rounded-2xl" />
        ))}
      </div>

      {/* Achievements card */}
      <div className="bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 p-6 mb-6">
        <div className="h-5 w-28 bg-parchment-200 dark:bg-primary-700 rounded mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-parchment-200 dark:bg-primary-700 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-parchment-200 dark:bg-primary-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
