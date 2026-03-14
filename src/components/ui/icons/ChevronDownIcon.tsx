/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {}

export default function ChevronDownIcon(props: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}
