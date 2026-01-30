import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-card",
          {
            // CTA principal - Vert olive (confiance, croissance)
            "bg-olive-500 text-white hover:bg-olive-600 active:bg-olive-700 focus:ring-olive-400 dark:bg-olive-600 dark:text-parchment-50 dark:hover:bg-olive-500 dark:active:bg-olive-400":
              variant === "primary",
            // Secondaire - Brun chaud (sagesse, stabilité)
            "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-400 dark:bg-primary-600 dark:text-parchment-50 dark:hover:bg-primary-500 dark:active:bg-primary-400":
              variant === "secondary",
            // Outline - Bordure brun
            "border-2 border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-300 shadow-none dark:border-primary-600 dark:text-primary-200 dark:hover:bg-primary-800 dark:hover:border-primary-500":
              variant === "outline",
            // Ghost - Transparent
            "bg-transparent text-primary-600 hover:bg-parchment-200 focus:ring-primary-300 shadow-none dark:text-primary-200 dark:hover:bg-primary-800":
              variant === "ghost",
            // Or - Pour les récompenses et actions spéciales
            "bg-gradient-to-r from-gold-400 to-gold-500 text-primary-900 hover:from-gold-500 hover:to-gold-600 focus:ring-gold-400 dark:from-gold-500 dark:to-gold-600":
              variant === "gold",
            // Danger - Rouge désaturé
            "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-400 dark:bg-error-600 dark:hover:bg-error-500":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm rounded-lg": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
