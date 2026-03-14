import React from "react";
import { Title } from "@/components/ui/typography";
import { cn } from "@/utils/utils";

export interface LogoProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export default function Logo({ variant = "desktop", className }: LogoProps) {
  if (variant === "mobile") {
    return (
      <div className={cn("leading-none", className)}>
        <div className="flex items-center justify-center gap-2">
          <div className="w-14 h-1 bg-black" />
          <Title
            as="h2"
            size="lg"
            weight="bold"
            uppercase
            tracking="wide"
            className="text-center font-condensed"
          >
            The
          </Title>
          <div className="w-14 h-1 bg-black" />
        </div>
        <Title
          as="h2"
          size="2xl"
          weight="bold"
          uppercase
          tracking="wide"
          className="text-center font-condensed -mt-1"
        >
          Downtown
        </Title>
      </div>
    );
  }

  return (
    <div className={cn("py-8 flex justify-center items-center", className)}>
      <Title
        as="h1"
        size="4xl"
        weight="bold"
        uppercase
        tracking="wide"
        className="text-center font-condensed"
      >
        The Downtown
      </Title>
    </div>
  );
}
