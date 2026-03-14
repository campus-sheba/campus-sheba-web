import React from "react";
import { cn } from "@/utils/utils";

export interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "container" | "full" | "max-w-7xl mx-auto" | "max-w-8xl mx-auto";
  padding?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export default function ContentWrapper({
  children,
  className,
  maxWidth = "container",
  padding = "lg",
}: ContentWrapperProps) {
  const maxWidthClasses = {
    container: "max-w-container mx-auto",
    full: "w-full",
    "max-w-7xl mx-auto": "max-w-7xl mx-auto",
    "max-w-8xl mx-auto": "max-w-8xl mx-auto",
    "max-w-[1440px] mx-auto": "max-w-[1440px] mx-auto",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 py-4",
    md: "px-4 md:px-6 lg:px-0 pt-5 pb-20 md:pb-28",
    lg: "px-6 py-8 lg:px-8 lg:py-12",
    xl: "px-8 py-10 xl:px-10 xl:py-14",
    "2xl": "px-10 py-12 2xl:px-12 2xl:py-16",
    "3xl": "px-12 py-14 3xl:px-14 3xl:py-18",
    "4xl": "px-14 py-16 4xl:px-16 4xl:py-20",
    "5xl": "px-16 py-18 5xl:px-18 5xl:py-22",
  };

  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
