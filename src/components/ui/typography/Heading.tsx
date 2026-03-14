import React from "react";
import { cn } from "@/utils/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "semibold" | "bold" | "extrabold";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as: Component = "h2",
      size = "lg",
      weight = "bold",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    };

    const weightClasses = {
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          "leading-tight text-gray-900",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Heading.displayName = "Heading";

export default Heading;
