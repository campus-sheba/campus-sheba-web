"use client";

import React from "react";
import IconButton from "@/components/ui/IconButton";
import MenuIcon from "@/components/ui/icons/MenuIcon";

export interface MenuButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function MenuButton({
  onClick,
  size = "md",
  className,
}: MenuButtonProps) {
  const iconSize = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  return (
    <IconButton
      variant="ghost"
      size={size}
      ariaLabel="Open menu"
      onClick={onClick}
      className={className}
    >
      <MenuIcon className={iconSize[size]} />
    </IconButton>
  );
}
