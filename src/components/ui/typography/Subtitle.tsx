import React from "react";
import { cn } from "@/utils/utils";

export interface SubtitleProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm";
  uppercase?: boolean;
  tracking?: "wide" | "wider" | "widest";
  color?: "default" | "muted";
}

const Subtitle = React.forwardRef<HTMLSpanElement, SubtitleProps>(
  (
    {
      size = "xs",
      uppercase = true,
      tracking = "widest",
      color = "muted",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      xs: "text-[10px] sm:text-xs",
      sm: "text-xs sm:text-sm",
    };

    const colorClasses = {
      default: "text-gray-900",
      muted: "text-gray-500",
    };

    const trackingClasses = {
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-[0.2em]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          sizeClasses[size],
          colorClasses[color],
          "font-semibold",
          uppercase && "uppercase",
          trackingClasses[tracking],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Subtitle.displayName = "Subtitle";

export default Subtitle;
