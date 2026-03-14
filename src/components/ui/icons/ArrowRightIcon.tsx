/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

export interface ArrowRightIconProps extends React.SVGProps<SVGSVGElement> {}

export default function ArrowRightIcon(props: ArrowRightIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
