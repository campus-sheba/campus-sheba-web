import React from "react";
import { cn } from "@/utils/utils";
import AppBreadcrumb, { type AppBreadcrumbItem } from "../common/AppBreadcrumb";

export interface PageContentWrapperProps {
  children: React.ReactNode;
  directions?: { label: string; link: string }[];
  className?: string;
  spacing?: "none" | "sm" | "md" | "lg";
}

export default function PageContentWrapper({
  children,
  directions,
  className,
  spacing = "none",
}: PageContentWrapperProps) {
  const spacingClasses = {
    none: "",
    sm: "mt-10",
    md: "mt-20",
    lg: "mt-24",
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {directions ? (
        <AppBreadcrumb
          items={directions.map((direction) => ({
            label: direction.label,
            href: direction.link,
          })) as AppBreadcrumbItem[]}
        />
      ) : null}
      {children}
    </div>
  );
}
