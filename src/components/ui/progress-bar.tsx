import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: "primary" | "xp" | "gold";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max,
  className,
  color = "primary",
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", {
            "bg-primary-500": color === "primary",
            "bg-xp": color === "xp",
            "bg-gold-500": color === "gold",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-600 mt-1 text-right">
          {value} / {max}
        </p>
      )}
    </div>
  );
}
