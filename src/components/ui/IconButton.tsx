import React from "react";
import { cn } from "@/utils/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  ariaLabel: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      ariaLabel,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      default: "text-black hover:text-gray-700",
      ghost: "text-black hover:bg-gray-100",
      outline:
        "border border-gray-200 text-gray-500 hover:text-black hover:border-black",
    };

    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10 sm:h-11 sm:w-11",
      lg: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
