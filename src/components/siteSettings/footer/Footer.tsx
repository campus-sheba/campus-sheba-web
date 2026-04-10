"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Package,
  Mail,
  Phone,
  ArrowRight,
  Shield,
  Globe,
} from "lucide-react";
import Logo from "../navbar/Logo";
import { Button } from "@/components/ui";
import { fetchUniversities } from "@/services/universities";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import {
  COMPANY_LINKS,
  FALLBACK_UNIVERSITIES,
  SERVICES,
  SOCIAL,
  SUPPORT_LINKS,
} from "./footer.constants";
import { useTranslations } from "next-intl";

interface FooterProps {
  locale?: string;
}

const Footer: React.FC<FooterProps> = ({ locale = "en" }) => {
  const t = useTranslations("common.footer");
  const currentYear = new Date().getFullYear();
  const [universities, setUniversities] = useState<string[]>(FALLBACK_UNIVERSITIES);

  const href = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${normalizedPath}`;
  };

  useEffect(() => {
    let mounted = true;
    const loadUniversities = async () => {
      try {
        const items = await fetchUniversities(1, 6);
        if (!mounted) return;
        const names = items.map((item) => item.name).filter(Boolean);
        if (names.length) {
          setUniversities([...names.slice(0, 4), "+ More Coming Soon"]);
        }
      } catch {
        // Keep fallback list.
      }
    };
    void loadUniversities();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer
      className="bg-brand-navy-DEFAULT text-white"
      aria-label="Site footer"
    >
      {/* ─── Newsletter Band ─── */}
      <SectionWrapper spacing="none" background="transparent" className="my-0 border-b border-white/8">
        <ContentWrapper maxWidth="container" padding="none" className="py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-1">
                {t("stayInLoop")}
              </h3>
              <p className="text-sm text-white/50">
                {t("newsletterSubtitle")}
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
              aria-label="Newsletter subscription"
            >
              <input
                type="email"
                id="footer-newsletter-email"
                placeholder="your@university.edu"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green-DEFAULT/60 transition-colors"
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                id="footer-newsletter-submit"
                variant="secondary"
                uppercase={false}
                className="flex-shrink-0 gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                style={{
                  background: "linear-gradient(135deg, #00A651, #00c460)",
                }}
              >
                {t("subscribe")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </ContentWrapper>
      </SectionWrapper>

      {/* ─── Main Footer Grid ─── */}
      <ContentWrapper maxWidth="container" padding="none" className="py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            {/* Logo */}
            <Link
              href={href("/")}
              id="footer-logo"
              className="inline-flex items-center gap-2.5 mb-5 group"
              aria-label="Campus Sheba Home"
            >
              <div className="leading-none bg-white p-2 rounded-lg">
                <Logo />
                <span className="text-[9px] font-medium text-brand-navy-DEFAULT tracking-widest uppercase">
                  {t("tagline")}
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-[220px]">
              {t("description")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  id={`footer-social-${s.label.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-all duration-150"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <a
                href="mailto:campussheba24@gmail.com"
                id="footer-email"
                className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-brand-green-DEFAULT" />
                campussheba24@gmail.com
              </a>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Globe className="w-3.5 h-3.5 flex-shrink-0 text-brand-green-DEFAULT" />
                {t("servingBangladesh")}
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-5 tracking-wide uppercase">
              {t("services")}
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    href={href(s.href)}
                    id={`footer-service-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-150 group"
                  >
                    <s.icon
                      className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-green-DEFAULT flex-shrink-0 transition-colors"
                      strokeWidth={2}
                    />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-5 tracking-wide uppercase">
              {t("company")}
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={href(l.href)}
                    id={`footer-company-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-5 tracking-wide uppercase">
              {t("support")}
            </h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={href(l.href)}
                    id={`footer-support-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Universities */}
            <div className="mt-8">
              <h4 className="font-display font-semibold text-sm text-white mb-4 tracking-wide uppercase">
                {t("partnerUniversities")}
              </h4>
              <ul className="space-y-2">
                {universities.map((u) => (
                  <li key={u} className="text-sm text-white/40">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* App Column */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-5 tracking-wide uppercase">
              {t("getApp")}
            </h4>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              {t("appDescription")}
            </p>
            <div className="space-y-2">
              <a
                href="#"
                id="footer-appstore"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[9px] text-white/30 leading-none">
                    {t("downloadOn")}
                  </p>
                  <p className="text-sm font-semibold text-white leading-none mt-0.5">
                    App Store
                  </p>
                </div>
              </a>
              <a
                href="#"
                id="footer-playstore"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[9px] text-white/30 leading-none">
                    {t("getItOn")}
                  </p>
                  <p className="text-sm font-semibold text-white leading-none mt-0.5">
                    Google Play
                  </p>
                </div>
              </a>
            </div>

            {/* Trust signal */}
            <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-green-DEFAULT/10 border border-brand-green-DEFAULT/20">
              <Shield className="w-4 h-4 text-brand-green-DEFAULT flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-brand-green-400">
                  {t("universityVerified")}
                </p>
                <p className="text-[10px] text-white/30">
                  {t("safeTrusted")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>

      {/* ─── Bottom Bar ─── */}
      <SectionWrapper spacing="none" background="transparent" className="my-0 border-t border-white/8">
        <ContentWrapper maxWidth="container" padding="none" className="py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30 text-center sm:text-left">
              {t("copyright", { year: currentYear })}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={href("/privacy-policy")}
                id="footer-bottom-privacy"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                {t("privacy")}
              </Link>
              <span className="text-white/15">·</span>
              <Link
                href={href("/terms-condition")}
                id="footer-bottom-terms"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                {t("terms")}
              </Link>
              <span className="text-white/15">·</span>
              <Link
                href={href("/careers")}
                id="footer-bottom-careers"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                {t("careers")}
              </Link>
            </div>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </footer>
  );
};

export default Footer;
