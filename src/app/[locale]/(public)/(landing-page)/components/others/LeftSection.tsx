import React from "react";
import { SectionWrapper } from "@/components/wrappers";
import { Heading } from "@/components/ui/typography";
import { cn } from "@/utils/utils";

interface LeftSectionProps<T> {
  title: string;
  data: T[];
  children?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export default function LeftSection<T>({
  title,
  data,
  children,
  className = "",
}: LeftSectionProps<T>) {
  return (
    <SectionWrapper
      spacing="none"
      background="white"
      border
      className={cn("p-6", className)}
    >
      {/* Title */}
      <Heading as="h3" size="lg" weight="semibold" className="text-gray-900">
        {title}
      </Heading>

      {/* Divider */}
      <div className="relative mt-2 mb-6 h-0.5 bg-gray-200">
        <span className="absolute left-0 top-0 h-0.5 w-10 bg-black" />
      </div>

      {/* Dynamic Content */}
      {children && (
        <div className="space-y-4">
          {data.map((item, index) => (
            <React.Fragment key={index}>{children(item, index)}</React.Fragment>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
