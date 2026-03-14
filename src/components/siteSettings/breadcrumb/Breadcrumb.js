"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Paragraph } from "@/components/ui";

export default function Breadcrumbs({ directions }) {
  const pathname = usePathname(); // e.g., /en/doctor/625

  // Normalize pathname by removing trailing slash (except root)
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";

  // Extract locale prefix (/en, /bn, etc.)
  const localePrefix = "/" + normalizedPath.split("/")[1]; // "/en"

  // Strip locale from pathname to compare only the path part
  const pathWithoutLocale = normalizedPath.replace(localePrefix, "") || "/"; // e.g., /doctor/625

  // Remove query parameters from path for comparison
  const pathWithoutQuery = pathWithoutLocale.split("?")[0];

  // Find the active breadcrumb by the longest matching `link`
  let activeIndex = -1;
  directions.forEach((dir, index) => {
    // Remove query parameters from breadcrumb link for comparison
    const normalizedLink =
      dir.link !== "/" ? dir.link.replace(/\/$/, "").split("?")[0] : "/";

    if (
      pathWithoutQuery === normalizedLink ||
      pathWithoutQuery.startsWith(normalizedLink + "/")
    ) {
      activeIndex = index;
    }
  });

  return (
    <div className="mb-6 flex flex-wrap justify-between  text-primary ">
      <div className={"flex flex-wrap"}>
        {directions.map((direction, index) => {
          const isActive = index === activeIndex;

          return (
            <div key={index} className="flex items-center text-xl">
              <Link href={direction.link}>
                <Paragraph
                  textColor={
                    isActive ? "text-primary font-semibold" : "text-black"
                  }
                >
                  {direction.label}
                </Paragraph>
              </Link>
              {index < directions.length - 1 && (
                <span className="mx-2"> {">"} </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
