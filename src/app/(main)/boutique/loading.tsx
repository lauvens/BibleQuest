export default function BoutiqueLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="h-7 w-32 bg-parchment-200 dark:bg-primary-800 rounded mb-4" />

      {/* Currency badges */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-28 bg-parchment-200 dark:bg-primary-800 rounded-full" />
        <div className="h-10 w-28 bg-parchment-200 dark:bg-primary-800 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-parchment-200 dark:bg-primary-800 rounded-xl" />
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-parchment-200 dark:bg-primary-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
