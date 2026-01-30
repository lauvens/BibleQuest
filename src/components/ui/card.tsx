import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "lesson" | "interactive";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-parchment-50 dark:bg-primary-800 transition-all duration-200",
          {
            "shadow-card border border-parchment-300 dark:border-primary-800": variant === "default",
            "shadow-elevated border border-parchment-200 dark:border-primary-700": variant === "elevated",
            "border-2 border-parchment-300 dark:border-primary-700 shadow-none": variant === "outline",
            "shadow-soft border-2 border-parchment-300 dark:border-primary-700 hover:border-olive-400 dark:hover:border-olive-500 hover:shadow-card cursor-pointer":
              variant === "lesson",
            "shadow-card border border-parchment-300 dark:border-primary-800 hover:shadow-elevated hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-0.5 cursor-pointer":
              variant === "interactive",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pb-3", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-2", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-primary-800 dark:text-parchment-50", className)}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-primary-500 dark:text-primary-300", className)}
      {...props}
    />
  )
);

CardDescription.displayName = "CardDescription";

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
