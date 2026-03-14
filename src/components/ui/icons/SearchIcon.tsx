/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface SearchIconProps extends React.SVGProps<SVGSVGElement> {}

export default function SearchIcon(props: SearchIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
