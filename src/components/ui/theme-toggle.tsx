"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "dark") {
      return <Moon className="w-5 h-5" />;
    } else if (theme === "light") {
      return <Sun className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === "dark") return "Sombre";
    if (theme === "light") return "Clair";
    return "Systeme";
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "text-primary-600 hover:bg-parchment-200",
        "dark:text-primary-200 dark:hover:bg-primary-800",
        className
      )}
      aria-label={`Theme: ${getLabel()}`}
      title={`Theme: ${getLabel()}`}
    >
      <span className="flex items-center gap-2">
        {getIcon()}
        {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
      </span>
    </button>
  );
}

interface ThemeSelectProps {
  className?: string;
}

export function ThemeSelect({ className }: ThemeSelectProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Systeme", icon: Monitor },
  ] as const;

  return (
    <div className={cn("flex gap-2", className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
            "border-2",
            theme === value
              ? "bg-olive-50 border-olive-500 text-olive-700 dark:bg-olive-500/20 dark:border-olive-500 dark:text-olive-400"
              : "bg-parchment-50 border-parchment-300 text-primary-600 hover:border-primary-400 dark:bg-primary-800 dark:border-primary-700 dark:text-primary-200 dark:hover:border-primary-500"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
