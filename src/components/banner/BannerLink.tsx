"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Banner } from "@/types/banner";
import { getBannerHref } from "@/utils/banner/getBannerHref";

type BannerLinkProps = {
  banner: Banner;
  className?: string;
  children: ReactNode;
  /** Fired on tap of an interactive banner (e.g. analytics / close popup). */
  onNavigate?: () => void;
};

/**
 * Wraps banner content with the correct navigation element for its
 * `redirectionType` (BANNER_PUBLIC_API.md §9). Internal routes use the locale
 * aware <Link>; external/`web_link` targets use a new-tab anchor. Non
 * interactive banners (`none` / no target) render a plain <div>.
 */
export default function BannerLink({
  banner,
  className,
  children,
  onNavigate,
}: BannerLinkProps) {
  const { href, isExternal } = getBannerHref(banner);

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}
