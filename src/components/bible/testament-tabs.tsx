"use client";

interface TestamentTabsProps {
  activeTestament: "old" | "new";
  onTabChange: (testament: "old" | "new") => void;
  oldCount: number;
  newCount: number;
}

export function TestamentTabs({ activeTestament, onTabChange, oldCount, newCount }: TestamentTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-parchment-100 dark:bg-primary-800 rounded-lg">
      <button
        onClick={() => onTabChange("old")}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTestament === "old"
            ? "bg-white dark:bg-primary-700 text-olive-700 dark:text-olive-300 shadow-sm"
            : "text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
        }`}
      >
        Ancien Testament
        <span className="ml-2 text-xs opacity-70">({oldCount})</span>
      </button>
      <button
        onClick={() => onTabChange("new")}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTestament === "new"
            ? "bg-white dark:bg-primary-700 text-info-700 dark:text-info-300 shadow-sm"
            : "text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
        }`}
      >
        Nouveau Testament
        <span className="ml-2 text-xs opacity-70">({newCount})</span>
      </button>
    </div>
  );
}
