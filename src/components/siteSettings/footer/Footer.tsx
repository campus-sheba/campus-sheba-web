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
import { Button } from "@/components/ui";

// ✅ FIX: Missing imports (this caused your conflict/runtime error)
import SectionWrapper from "@/components/wrappers/SectionWrapper";
import ContentWrapper from "@/components/wrappers/ContentWrapper";

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

  const href = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${normalizedPath}`;
  };

  return (
    <footer className="bg-brand-navy-DEFAULT text-white px-4 md:px-8 lg:px-0">
      {/* Newsletter */}
      <SectionWrapper className="border-b border-white/8">
        <ContentWrapper className="py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl mb-1">
                Stay in the loop
              </h3>
              <p className="text-sm text-white/50">
                Get updates on new campuses, features, and student offers.
              </p>
            </div>

            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@university.edu"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-green-DEFAULT/60"
              />
              <Button
                type="submit"
                className="gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #00A651, #00c460)",
                }}
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </ContentWrapper>
      </SectionWrapper>

      {/* Main */}
      <ContentWrapper className="py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href={href("/")} className="inline-flex gap-2.5 mb-5">
              <div className="bg-white p-2 rounded-lg">
                <Logo />
                <span className="text-[9px] text-brand-navy-DEFAULT uppercase">
                  Your Campus. Your World.
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/50 mb-6 max-w-[220px]">
              A 360° campus lifestyle super-app connecting students.
            </p>

            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} target="_blank">
                  <s.icon className="w-4 h-4 text-white/60 hover:text-white" />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-xs text-white/40">
              <div className="flex gap-2">
                <Mail className="w-3.5 h-3.5" />
                campussheba24@gmail.com
              </div>
              <div className="flex gap-2">
                <Globe className="w-3.5 h-3.5" />
                Serving all of Bangladesh
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold mb-5 uppercase">Services</h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    href={href(s.href)}
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white"
                  >
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-5 uppercase">Company</h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={href(l.href)}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-5 uppercase">Support</h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={href(l.href)}>{l.label}</Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-4 uppercase">
                Partner Universities
              </h4>
              <ul className="space-y-2 text-sm text-white/40">
                {UNIVERSITIES.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* App */}
          <div>
            <h4 className="text-sm font-semibold mb-5 uppercase">
              Get the App
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-white/6 rounded-xl">App Store</div>
              <div className="p-3 bg-white/6 rounded-xl">Google Play</div>
            </div>

            <div className="mt-6 flex gap-2 p-3 bg-green-500/10 rounded-xl">
              <Shield className="w-4 h-4" />
              <div>
                <p className="text-xs font-semibold">Verified</p>
                <p className="text-[10px] text-white/40">Safe platform</p>
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>

      {/* Bottom */}
      <SectionWrapper className="border-t border-white/8">
        <ContentWrapper className="py-5 flex justify-between text-xs text-white/30">
          <p>© {currentYear} Campus Sheba</p>
          <div className="flex gap-4">
            <Link href={href("/privacy-policy")}>Privacy</Link>
            <Link href={href("/terms-condition")}>Terms</Link>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </footer>
  );
};

export default Footer;
