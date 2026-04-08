"use client";

import Link from "next/link";
import React from "react";
import {
  GraduationCap,
  Bike,
  BookOpen,
  ShoppingBag,
  Droplets,
  Briefcase,
  Heart,
  Package,
  Trash2,
  MapPin,
  Mail,
  Phone,
  FacebookIcon,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  Shield,
  Globe,
} from "lucide-react";
import Logo from "../navbar/Logo";

interface FooterProps {
  locale?: string;
}

const SERVICES = [
  { label: "Delivery Sheba", href: "/delivery", icon: Bike },
  { label: "Book Sheba", href: "/books", icon: BookOpen },
  { label: "Buy & Sell", href: "/marketplace", icon: ShoppingBag },
  { label: "Blood Bank", href: "/blood-bank", icon: Droplets },
  { label: "Tuition Sheba", href: "/tuition", icon: GraduationCap },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Donation", href: "/donation", icon: Heart },
  { label: "Parcel Delivery", href: "/parcel", icon: Package },
  { label: "Eco Pickup", href: "/garbage", icon: Trash2 },
  { label: "Lost & Found", href: "/lost-found", icon: MapPin },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Press Kit", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Community Guidelines", href: "/guidelines" },
  { label: "Report an Issue", href: "/report" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-condition" },
];

const UNIVERSITIES = [
  "Jahangirnagar University",
  "Dhaka University",
  "Chittagong University",
  "+ More Coming Soon",
];

const SOCIAL = [
  {
    label: "Facebook",
    icon: FacebookIcon,
    href: "https://facebook.com/campussheba",
  },
  {
    label: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/campussheba",
  },
  { label: "Twitter", icon: Twitter, href: "https://twitter.com/campussheba" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/campussheba" },
];

const Footer: React.FC<FooterProps> = ({ locale = "en" }) => {
  const currentYear = new Date().getFullYear();

  const href = (path: string) => `/${path}`;

  return (
    <footer
      className="bg-brand-navy-DEFAULT text-white"
      aria-label="Site footer"
    >
      {/* ─── Newsletter Band ─── */}
      <div className="border-b border-white/8">
        <div className="cs-container py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-1">
                Stay in the loop
              </h3>
              <p className="text-sm text-white/50">
                Get updates on new campuses, features, and student offers.
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
              <button
                type="submit"
                id="footer-newsletter-submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00A651, #00c460)",
                }}
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Grid ─── */}
      <div className="cs-container py-14">
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
                  Your Campus. Your World.
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-[220px]">
              A 360° campus lifestyle super-app connecting students, educators,
              and service providers across Bangladesh.
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
                Serving all of Bangladesh
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-5 tracking-wide uppercase">
              Services
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
              Company
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
              Support
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
                Partner Universities
              </h4>
              <ul className="space-y-2">
                {UNIVERSITIES.map((u) => (
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
              Get the App
            </h4>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              Available on iOS and Android with all features accessible on the
              go.
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
                    Download on the
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
                    Get it on
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
                  University Verified
                </p>
                <p className="text-[10px] text-white/30">
                  Safe & trusted platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-white/8">
        <div className="cs-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30 text-center sm:text-left">
              © {currentYear} Campus Sheba. All rights reserved. Made with ❤️ in
              Bangladesh.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={href("/privacy-policy")}
                id="footer-bottom-privacy"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-white/15">·</span>
              <Link
                href={href("/terms-condition")}
                id="footer-bottom-terms"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Terms
              </Link>
              <span className="text-white/15">·</span>
              <Link
                href={href("/careers")}
                id="footer-bottom-careers"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Careers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
