/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface ClockIconProps extends React.SVGProps<SVGSVGElement> {}

export default function ClockIcon(props: ClockIconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
