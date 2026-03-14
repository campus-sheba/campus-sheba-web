import React from "react";
import { cn } from "@/utils/utils";

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg";
  weight?: "normal" | "medium" | "semibold";
  color?: "default" | "muted" | "light";
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = "base",
      weight = "normal",
      color = "default",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    };

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    };

    const colorClasses = {
      default: "text-gray-900",
      muted: "text-gray-500",
      light: "text-gray-400",
    };

    return (
      <p
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          colorClasses[color],
          "leading-relaxed",
          className,
        )}
        {...props}
      >
        {children}
      </p>
    );
  },
);

Paragraph.displayName = "Paragraph";

export default Paragraph;
