/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface MenuIconProps extends React.SVGProps<SVGSVGElement> {}

export default function MenuIcon(props: MenuIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}
