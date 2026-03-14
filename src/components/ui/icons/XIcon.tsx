/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface XIconProps extends React.SVGProps<SVGSVGElement> {}

export default function XIcon(props: XIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
