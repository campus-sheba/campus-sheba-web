"use client";

import React from "react";
import IconButton from "@/components/ui/IconButton";
import SearchIcon from "@/components/ui/icons/SearchIcon";

export interface SearchButtonProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SearchButton({
  onClick,
  size = "md",
  className,
}: SearchButtonProps) {
  const iconSize = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  return (
    <IconButton
      variant="default"
      size={size}
      ariaLabel="Search"
      onClick={onClick}
      className={className}
    >
      <SearchIcon className={iconSize[size]} />
    </IconButton>
  );
}
