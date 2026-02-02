import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: "primary" | "xp" | "gold" | "olive";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export function ProgressBar({
  value,
  max,
  className,
  color = "xp",
  showLabel = false,
  size = "md",
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isLight = variant === "light";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn("rounded-full overflow-hidden", {
          "h-2": size === "sm",
          "h-3": size === "md",
          "h-4": size === "lg",
          "bg-parchment-300": !isLight,
          "bg-white/20": isLight,
        })}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isLight
              ? "bg-gradient-to-r from-accent-300 to-accent-400"
              : {
                  "bg-gradient-to-r from-primary-400 to-primary-500":
                    color === "primary",
                  "bg-gradient-to-r from-olive-400 to-olive-500": color === "xp" || color === "olive",
                  "bg-gradient-to-r from-gold-400 to-gold-500": color === "gold",
                }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className={cn(
          "text-xs mt-1.5 text-right font-medium",
          isLight ? "text-white/70" : "text-primary-500"
        )}>
          {value} / {max}
        </p>
      )}
    </div>
  );
}
