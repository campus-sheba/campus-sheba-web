import React from "react";
import { cn } from "@/utils/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  uppercase?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      uppercase = true,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      primary:
        "border border-gray-300 bg-white text-gray-600 hover:border-black hover:text-black",
      secondary: "bg-black text-white hover:bg-gray-800",
      outline:
        "border border-black bg-transparent text-black hover:bg-black hover:text-white",
      ghost: "bg-transparent text-gray-600 hover:text-black hover:bg-gray-100",
      link: "bg-transparent text-gray-600 hover:text-black underline-offset-4 hover:underline",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2 text-[11px]",
      lg: "px-6 py-3 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          uppercase && "uppercase",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
