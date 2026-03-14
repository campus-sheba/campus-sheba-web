import React from "react";
import { cn } from "@/utils/utils";

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "semibold" | "bold" | "extrabold";
  uppercase?: boolean;
  tracking?: "normal" | "wide" | "wider" | "widest";
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  (
    {
      as: Component = "h1",
      size = "base",
      weight = "bold",
      uppercase = false,
      tracking = "normal",
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
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    };

    const weightClasses = {
      normal: "font-normal",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    };

    const trackingClasses = {
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-widest",
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          uppercase && "uppercase",
          trackingClasses[tracking],
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Title.displayName = "Title";

export default Title;
