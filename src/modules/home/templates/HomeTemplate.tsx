"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Bike, BookOpen, ShoppingBag, Droplets,
  GraduationCap, Briefcase, Heart, Package, Trash2, MapPin,
  Star, CheckCircle, Users, Building2, Zap, Shield,
  ChevronRight, Globe, TrendingUp,
  Search, MessageCircle, Store,
  LayoutGrid,
} from "lucide-react";
import Banners from "../components/Banners";
import {
  FoodExploreSection,
  TrendingShopsSection,
  BooksSectionExpanded,
  MarketplaceSectionExpanded,
  EntrepreneurshipSection,
  BloodBankSection,
  TuitionSectionExpanded,
  LostFoundSectionExpanded,
  DonationSection,
  JobsSection,
  DonationAndJobsSection,
  FeaturedModuleHighlights,
} from "../components/DynamicSections";

// ─── Mockup Data ──────────────────────────────────────────────
const STATS = [
  { value: "10,000+", label: "Active Students", icon: Users },
  { value: "3", label: "Universities", icon: Building2 },
  { value: "10+", label: "Service Modules", icon: Zap },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
];

const HERO_ROLES = [
  {
    id: "student",
    label: "Student",
    subtitle: "Discover essentials, opportunities, and community support.",
    primary: { label: "Order Food", href: "/delivery", icon: Bike },
    secondary: { label: "Find Books", href: "/books", icon: BookOpen },
  },
  {
    id: "provider",
    label: "Provider",
    subtitle: "List products, run your shop, and manage campus orders.",
    primary: { label: "Open Shop", href: "/marketplace", icon: ShoppingBag },
    secondary: { label: "Manage Listings", href: "/login", icon: Package },
  },
  {
    id: "delivery-hero",
    label: "Delivery Hero",
    subtitle: "Accept tasks, track routes, and handle campus fulfillment.",
    primary: { label: "View Deliveries", href: "/delivery", icon: Bike },
    secondary: { label: "Parcel Tasks", href: "/parcel", icon: Package },
  },
  {
    id: "admin",
    label: "Admin",
    subtitle: "Moderate modules, monitor activity, and keep trust high.",
    primary: { label: "Admin Login", href: "/login", icon: Shield },
    secondary: { label: "View Reports", href: "/login", icon: TrendingUp },
  },
];

const HERO_LIVE_SIGNALS = [
  { title: "Food Delivery", text: "Kacchi Bhai order delivered in 24 min", time: "1 min ago", icon: Bike, color: "#6D28D9", bg: "#EDE9FE" },
  { title: "Book Sheba", text: "Calculus book rented by CSE 2nd year", time: "3 min ago", icon: BookOpen, color: "#2563EB", bg: "#DBEAFE" },
  { title: "Marketplace", text: "Laptop listing got 12 responses", time: "5 min ago", icon: ShoppingBag, color: "#059669", bg: "#D1FAE5" },
  { title: "Blood Bank", text: "A+ donor matched near Dhaka Medical", time: "6 min ago", icon: Droplets, color: "#DC2626", bg: "#FEE2E2" },
  { title: "Tuition Sheba", text: "Physics tutor post viewed 46 times", time: "8 min ago", icon: GraduationCap, color: "#D97706", bg: "#FEF3C7" },
  { title: "Jobs", text: "Campus ambassador role posted", time: "12 min ago", icon: Briefcase, color: "#0284C7", bg: "#E0F2FE" },
  { title: "Donation", text: "Medical campaign reached 78% target", time: "15 min ago", icon: Heart, color: "#16A34A", bg: "#DCFCE7" },
  { title: "Lost & Found", text: "Wallet recovered at central library", time: "18 min ago", icon: MapPin, color: "#CA8A04", bg: "#FEF9C3" },
];

const MODULES = [
  { id: "delivery", label: "Delivery Sheba", desc: "Food & courier", icon: Bike, color: "#6D28D9", bg: "#EDE9FE", href: "/delivery" },
  { id: "books", label: "Book Sheba", desc: "Buy, sell & lend", icon: BookOpen, color: "#2563EB", bg: "#DBEAFE", href: "/books" },
  { id: "sell", label: "Buy & Sell", desc: "Campus marketplace", icon: ShoppingBag, color: "#059669", bg: "#D1FAE5", href: "/marketplace" },
  { id: "entrepreneur", label: "Entrepreneurship", desc: "Shops & skills", icon: Store, color: "#E30A13", bg: "#FEE2E2", href: "/marketplace/shop/create" },
  { id: "blood", label: "Blood Bank", desc: "Emergency network", icon: Droplets, color: "#DC2626", bg: "#FEE2E2", href: "/blood-bank" },
  { id: "tuition", label: "Tuition Sheba", desc: "Find tutors", icon: GraduationCap, color: "#D97706", bg: "#FEF3C7", href: "/tuition" },
  { id: "jobs", label: "Jobs", desc: "Part-time & gigs", icon: Briefcase, color: "#0284C7", bg: "#E0F2FE", href: "/jobs" },
  { id: "donation", label: "Donation", desc: "Social causes", icon: Heart, color: "#16A34A", bg: "#DCFCE7", href: "/donation" },
  { id: "parcel", label: "Parcel", desc: "Send packages", icon: Package, color: "#7C3AED", bg: "#EDE9FE", href: "/parcel" },
  { id: "garbage", label: "Eco Pickup", desc: "Waste management", icon: Trash2, color: "#64748B", bg: "#F1F5F9", href: "/garbage" },
  { id: "lost", label: "Lost & Found", desc: "Recover items", icon: MapPin, color: "#CA8A04", bg: "#FEF9C3", href: "/lost-found" },
];

const FEATURES = [
  {
    tag: "CAMPUS ESSENTIALS",
    title: "Everything You Need",
    subtitle: "Daily services built for campus life",
    items: [
      { icon: Bike, color: "#6D28D9", bg: "#EDE9FE", title: "Delivery Sheba", desc: "Order food from campus canteens or nearby restaurants. Real-time tracking included.", label: "Most Popular" },
      { icon: BookOpen, color: "#2563EB", bg: "#DBEAFE", title: "Book Sheba", desc: "Buy, sell, lend, or swap textbooks with verified campus students. Save up to 70%.", label: "Save Money" },
      { icon: Droplets, color: "#DC2626", bg: "#FEE2E2", title: "Blood Bank", desc: "Emergency blood request system with real-time donor matching. Accessible in <3 taps.", label: "Emergency" },
      { icon: ShoppingBag, color: "#059669", bg: "#D1FAE5", title: "Campus Marketplace", desc: "Peer-to-peer buying and selling for students. Gadgets, clothing, furniture and more.", label: "Sustainable" },
    ],
  },
  {
    tag: "STUDENT EMPOWERMENT",
    title: "Grow Your Opportunities",
    subtitle: "Tools that help you earn, learn, and connect",
    items: [
      { icon: GraduationCap, color: "#D97706", bg: "#FEF3C7", title: "Tuition Sheba", desc: "Connect with qualified campus tutors or monetize your knowledge by teaching peers.", label: "Earn & Learn" },
      { icon: Briefcase, color: "#0284C7", bg: "#E0F2FE", title: "Campus Jobs", desc: "Find part-time jobs, internships, and freelance gigs scoped to your university.", label: "Build Career" },
      { icon: Heart, color: "#16A34A", bg: "#DCFCE7", title: "Donation Drives", desc: "Participate in or organize flood relief, Ramadan packs, and medical aid campaigns.", label: "Social Impact" },
      { icon: Package, color: "#7C3AED", bg: "#EDE9FE", title: "Parcel Delivery", desc: "Send and receive parcels across campus with real-time tracking. Fast and reliable.", label: "Reliable" },
    ],
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Choose Your University", desc: "Select from 10+ partner universities. Your data stays scoped to your campus.", icon: Building2 },
  { step: "02", title: "Verify Your Identity", desc: "Upload your student ID for trusted, verified campus-only access.", icon: Shield },
  { step: "03", title: "Explore Services", desc: "Browse all 10 modules — from food delivery to blood bank — in one app.", icon: Search },
  { step: "04", title: "Transact & Grow", desc: "Order, sell, lend, donate, or apply. Everything at your fingertips.", icon: TrendingUp },
];

const TESTIMONIALS = [
  {
    name: "Tanha Akter",
    role: "CSE Student, JU",
    avatar: "TA",
    rating: 5,
    text: "Campus Sheba changed how I survive university life. I get food delivered to my dorm, sold my old textbooks, and even found a part-time job — all from one app!",
    module: "Delivery + Books + Jobs",
  },
  {
    name: "Rafi Ahmed",
    role: "Student Entrepreneur, DU",
    avatar: "RA",
    rating: 5,
    text: "I launched my handmade craft business on Campus Sheba and got 50+ orders in the first month. The shop management tools are genuinely enterprise-level.",
    module: "Entrepreneurship",
  },
  {
    name: "Nasrin Sultana",
    role: "Medical Student, CU",
    avatar: "NS",
    rating: 5,
    text: "The blood bank feature is a lifesaver. During an emergency, I found a matching donor within 15 minutes. This platform is doing real social good.",
    module: "Blood Bank",
  },
];

const UNIVERSITIES = [
  "Jahangirnagar University",
  "Dhaka University",
  "Chittagong University",
  "BUET",
  "KUET",
  "RUET",
];

const BLOOD_REQUESTS = [
  { group: "A+", location: "Dhaka Medical", urgency: "Critical", time: "5 min ago" },
  { group: "O-", location: "DMCH", urgency: "Urgent", time: "12 min ago" },
  { group: "B+", location: "Jahangirnagar Clinic", urgency: "Normal", time: "23 min ago" },
];

// ─── Hook: Intersection Observer ─────────────────────────────
function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Sub-components ───────────────────────────────────────────

// Section Wrapper with subtle fade-up animation (starts visible to avoid SSR opacity-0 flash)
function Section({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, inView } = useInView();
  return (
    <section
      ref={ref}
      id={id}
      style={{
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
      }}
      className={className}
    >
      {children}
    </section>
  );
}


// Section Header
function SectionHeader({ tag, title, subtitle, center = true }: { tag: string; title: React.ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      <span className="section-tag mb-4 inline-flex">{tag}</span>
      <h2 className="section-heading mt-3 mb-4">{title}</h2>
      {subtitle && <p className={`section-subheading ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
    </div>
  );
}

// Feature Card
function FeatureCard({ icon: Icon, color, bg, title, desc, label, index }: {
  icon: React.ElementType; color: string; bg: string;
  title: string; desc: string; label: string; index: number;
}) {
  return (
    <div
      className="card p-6 group hover:-translate-y-1.5 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200" style={{ background: bg }}>
          <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
        </div>
        <span className="badge-neutral text-[10px] font-semibold">{label}</span>
      </div>
      <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-green-DEFAULT opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200">
        Learn more <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

// Module Icon Button
function ModuleButton({ icon: Icon, label, desc, color, bg, href, locale }: {
  icon: React.ElementType; label: string; desc: string;
  color: string; bg: string; href: string; locale: string;
}) {
  return (
    <Link href={`/${locale}${href}`} className="module-card group border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 text-center transition hover:shadow-lg">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md" style={{ background: bg }}>
        <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.8} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-800 leading-tight">{label}</p>
        {/* <p className="text-xs text-neutral-400 leading-tight mt-0.5">{desc}</p> */}
      </div>
    </Link>
  );
}

// Star Rating
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-brand-amber-DEFAULT text-brand-amber-DEFAULT" />
      ))}
    </div>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────
function HeroSection({ locale }: { locale: string }) {
  const [activeModule, setActiveModule] = useState(0);
  const [activeRole, setActiveRole] = useState(HERO_ROLES[0].id);
  const [activeSignal, setActiveSignal] = useState(0);
  const selectedRole = HERO_ROLES.find((r) => r.id === activeRole) || HERO_ROLES[0];

  useEffect(() => {
    const t = setInterval(() => setActiveModule((p) => (p + 1) % MODULES.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveSignal((p) => (p + 1) % HERO_LIVE_SIGNALS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3055 60%, #0D1B2A 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-green-DEFAULT/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-brand-amber-DEFAULT/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="cs-container relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Content and role actions */}
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-brand-green-DEFAULT animate-pulse-slow" />
              <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">
                360 degree campus operating platform
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display font-extrabold leading-none tracking-tight" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "white" }}>
                Campus Sheba.{" "}
                <span style={{ background: "linear-gradient(135deg, #00A651, #00d46b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  One Platform.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl font-body">
                Enterprise-grade, university-verified ecosystem for delivery, marketplace, books, blood, tuition, jobs, donation, parcel, lost and found, and daily services.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HERO_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    activeRole === role.id
                      ? "border-brand-green-DEFAULT/60 bg-brand-green-DEFAULT/10 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <p className="text-sm font-semibold">{role.label}</p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-3">
              <p className="text-sm text-white/70 leading-relaxed">{selectedRole.subtitle}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}${selectedRole.primary.href}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00A651, #00c460)" }}
                >
                  <selectedRole.primary.icon className="w-4 h-4" />
                  {selectedRole.primary.label}
                </Link>
                <Link
                  href={`/${locale}${selectedRole.secondary.href}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 hover:bg-white/10 transition-all duration-200"
                >
                  <selectedRole.secondary.icon className="w-4 h-4" />
                  {selectedRole.secondary.label}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{ background: MODULES[activeModule].bg }}
                >
                  {React.createElement(MODULES[activeModule].icon, {
                    className: "w-4 h-4",
                    style: { color: MODULES[activeModule].color },
                    strokeWidth: 2,
                  })}
                </div>
                <span className="text-sm font-semibold text-white/90 min-w-[140px] transition-all duration-300">
                  {MODULES[activeModule].label}
                </span>
              </div>
              <span className="text-white/40 text-sm">+ integrated live operations</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/login`}
                id="hero-get-started-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white shadow-lg transition-all duration-200 hover:shadow-glow-lg hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #00A651, #00c460)" }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/features`}
                id="hero-explore-features-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white border border-white/15 hover:bg-white/10 transition-all duration-200 active:scale-[0.97]"
              >
                Explore All Services
              </Link>
            </div>
          </div>

          {/* Right: live operations overview */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-green-DEFAULT/15 blur-3xl" />
            <div className="relative rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">Live Campus Pulse</p>
                  <h3 className="text-xl font-display font-bold text-white mt-1">Real-time activity feed</h3>
                </div>
                <span className="text-xs text-white/40">University scoped</span>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-brand-navy-DEFAULT/50 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: HERO_LIVE_SIGNALS[activeSignal].bg }}>
                    {React.createElement(HERO_LIVE_SIGNALS[activeSignal].icon, {
                      className: "w-5 h-5",
                      style: { color: HERO_LIVE_SIGNALS[activeSignal].color },
                      strokeWidth: 2,
                    })}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{HERO_LIVE_SIGNALS[activeSignal].title}</p>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">{HERO_LIVE_SIGNALS[activeSignal].text}</p>
                    <p className="text-[11px] text-brand-green-300 mt-2">{HERO_LIVE_SIGNALS[activeSignal].time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {HERO_LIVE_SIGNALS.slice(0, 4).map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-white/10 bg-white/[0.04]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                        <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/85 font-medium truncate">{item.title}</p>
                        <p className="text-[11px] text-white/45 truncate">{item.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/35 ml-2">{item.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl px-3 py-3 border border-white/10 bg-white/[0.04]">
                  <p className="text-[11px] text-white/45">Critical Response</p>
                  <p className="text-sm font-semibold text-white mt-1">Blood match in 15 min</p>
                </div>
                <div className="rounded-xl px-3 py-3 border border-white/10 bg-white/[0.04]">
                  <p className="text-[11px] text-white/45">Order Fulfillment</p>
                  <p className="text-sm font-semibold text-white mt-1">98 percent on-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <s.icon className="w-4 h-4 text-brand-green-DEFAULT" />
                  <span className="font-display font-extrabold text-3xl lg:text-4xl text-white">{s.value}</span>
                </div>
                <div className="text-sm text-white/40 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {[
              "University Verified Users",
              "Role-Based Access Control",
              "Campus Scoped Data",
              "Moderated Marketplace",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/60 bg-white/[0.03]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-brand-green-DEFAULT" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURES SECTIONS ─────────────────────────────────────────
function FeaturesSection() {
  return (
    <>
      {FEATURES.map((group, gi) => (
        <Section
          key={group.tag}
          className={`py-20 ${gi % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
        >
          <div className="cs-container">
            <SectionHeader tag={group.tag} title={group.title} subtitle={group.subtitle} />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {group.items.map((item, i) => (
                <FeatureCard key={item.title} {...item} index={i} />
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="py-20 bg-brand-navy-700 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green-DEFAULT/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-amber-DEFAULT/5 rounded-full blur-3xl" />
      </div>
      <div className="cs-container relative z-10">
        <SectionHeader
          tag="Simple Process"
          title={<span className="text-white">Get Started in <span style={{ background: "linear-gradient(135deg,#00A651,#00d46b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>4 Steps</span></span>}
          subtitle=""
        />
        <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative text-center group">
              {/* Connector line */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[55%] w-full h-px bg-white/10" />
              )}
              {/* Step circle */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 mx-auto border border-white/10 group-hover:border-brand-green-DEFAULT/40 transition-all duration-300" style={{ background: "rgba(255,255,255,0.05)" }}>
                <step.icon className="w-8 h-8 text-brand-green-DEFAULT" strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-green-DEFAULT flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{step.step}</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/login"
            id="hiw-cta-btn"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #00A651, #00c460)" }}
          >
            Join Campus Sheba Today
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <Section className="py-20 bg-white">
      <div className="cs-container">
        <SectionHeader
          tag="Loved by Students"
          title={<>What Our <span className="gradient-text-green">Community</span> Says</>}
          subtitle="Real stories from real campus students across Bangladesh."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="card p-7 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-5">
                <Stars />
                <span className="badge-green text-[10px]">{t.module}</span>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green-DEFAULT flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── BLOOD BANK EMERGENCY WIDGET ──────────────────────────────
function BloodWidget({ locale }: { locale: string }) {
  return (
    <Section className="py-16 bg-neutral-50">
      <div className="cs-container">
        <div className="rounded-3xl overflow-hidden border border-red-100" style={{ background: "linear-gradient(135deg, #FEF2F2 0%, #FFF 100%)" }}>
          <div className="p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-4">
                <Droplets className="w-3.5 h-3.5" />
                EMERGENCY BLOOD NETWORK
              </span>
              <h2 className="font-display font-bold text-3xl text-neutral-900 mb-3">
                Active Blood{" "}
                <span style={{ color: "#DC2626" }}>Requests</span>
              </h2>
              <p className="text-neutral-500 text-base mb-6 leading-relaxed">
                Join 500+ registered donors on Campus Sheba. Your blood can save a life in 15 minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/blood-bank`} id="blood-register-btn" className="btn-primary">
                  Register as Donor
                </Link>
                <Link href={`/${locale}/blood-bank`} id="blood-request-btn" className="btn-secondary">
                  <Droplets className="w-4 h-4 text-red-500" />
                  Emergency Request
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {BLOOD_REQUESTS.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-xs hover:shadow-sm transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">{r.group}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{r.location}</p>
                      <span className={`badge text-[10px] flex-shrink-0 ${r.urgency === "Critical" ? "bg-red-100 text-red-700 border-red-200" : r.urgency === "Urgent" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                        {r.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{r.time}</p>
                  </div>
                  <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-green-DEFAULT bg-brand-green-50 hover:bg-brand-green-100 transition-colors border border-brand-green-100">
                    Respond
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── UNIVERSITIES SECTION ──────────────────────────────────────
function UniversitiesSection() {
  return (
    <Section className="py-14 bg-white border-y border-neutral-100">
      <div className="cs-container">
        <p className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-8">
          Serving Students at
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {UNIVERSITIES.map((u) => (
            <div key={u} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-50 border border-neutral-200 hover:border-brand-green-DEFAULT hover:bg-brand-green-50 transition-all duration-200 cursor-default group">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-green-DEFAULT transition-colors" />
              <span className="text-sm font-medium text-neutral-600 group-hover:text-brand-green-700 transition-colors">{u}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-green-50 border border-brand-green-DEFAULT/30">
            <Globe className="w-3.5 h-3.5 text-brand-green-DEFAULT" />
            <span className="text-sm font-semibold text-brand-green-700">+ More Coming</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── FAQ SECTION ───────────────────────────────────────────────
const FAQS = [
  { q: "Who can use Campus Sheba?", a: "Any student, teacher, or staff with a valid university ID from a partner campus can register and access all services." },
  { q: "Is it free to join?", a: "Yes! Registration is completely free. Small service fees may apply on certain transactions (typically 5-10%), always shown upfront." },
  { q: "How do I get verified?", a: "Upload your university ID card during signup. Our team reviews it within 24 hours and approves your account." },
  { q: "Can I sell my old items?", a: "Absolutely. Create a listing through Buy & Sell or Book Sheba, set your price, and your campus peers can find and purchase it." },
  { q: "How safe are transactions?", a: "Only verified campus users can transact. We have a review system, dispute resolution, and admin moderation to keep everything trusted." },
  { q: "Is there a mobile app?", a: "Yes! Available on Android (Play Store) and iOS (App Store). The web platform is also fully responsive." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section className="py-20 bg-neutral-50">
      <div className="cs-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeader
              tag="FAQ"
              title={<>Frequently Asked <span className="gradient-text-green">Questions</span></>}
              subtitle="Everything you need to know before getting started."
              center={false}
            />
            <div className="mt-8">
              <p className="text-sm text-neutral-500 mb-4">Still have questions?</p>
              <a
                href="mailto:campussheba24@gmail.com"
                id="faq-contact-link"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green-DEFAULT hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Contact our support team →
              </a>
            </div>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                id={`faq-item-${i}`}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-neutral-200 transition-colors duration-150"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-neutral-800">{faq.q}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${open === i ? "bg-brand-green-DEFAULT rotate-45" : "bg-neutral-100"}`}>
                    <span className={`text-lg leading-none font-light ${open === i ? "text-white" : "text-neutral-500"}`}>+</span>
                  </div>
                </button>
                {open === i && (
                  <div className="px-6 pb-5 animate-fade-in">
                    <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── CTA BANNER ─────────────────────────────────────────────────
function CTASection({ locale }: { locale: string }) {
  return (
    <Section className="py-20 bg-white">
      <div className="cs-container">
        <div
          className="relative rounded-3xl overflow-hidden text-center py-16 px-8"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3055 60%, #0D1B2A 100%)" }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-green-DEFAULT/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-amber-DEFAULT/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="section-tag mb-6 inline-flex" style={{ background: "rgba(0,166,81,0.15)", borderColor: "rgba(0,166,81,0.3)", color: "#4ade80" }}>
              🎓 Join 10,000+ Students
            </span>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white mb-4 tracking-tight">
              Ready to Transform Your<br /> Campus Experience?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students already using Campus Sheba to simplify, enrich, and supercharge their university life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={`/${locale}/login`}
                id="cta-main-btn"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-base text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-lg"
                style={{ background: "linear-gradient(135deg, #00A651, #00c460)" }}
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/about`}
                id="cta-learn-btn"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-base text-white border border-white/15 hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {["University Verified", "100% Secure", "Free to Join", "3+ Campuses"].map((s) => (
                <div key={s} className="flex items-center gap-2 text-white/50 text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-green-DEFAULT" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── MAIN HOME TEMPLATE ───────────────────────────────────────
export default function HomeTemplate({ locale = "en" }: { locale?: string }) {
  return (
    <div className="pt-[calc(var(--navbar-height)+var(--topbar-height))]">
      {/* Hero */}
      {/* <HeroSection locale={locale} /> */}
      <Banners
        bottomOverlay={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {MODULES.slice(0, 7).map((m) => (
              <ModuleButton key={m.id} {...m} locale={locale} />
            ))}
            <Link
              href={`/${locale}/services`}
              className="module-card group border border-dashed border-[#00A651]/40 rounded-xl p-4 flex flex-col items-center gap-3 text-center transition hover:border-[#00A651] hover:shadow-lg"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
                style={{ background: "#F0FFF7" }}
              >
                <LayoutGrid className="w-7 h-7" style={{ color: "#00A651" }} strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold leading-tight" style={{ color: "#00A651" }}>Explore All</p>
              </div>
            </Link>
          </div>
        }
      />

      {/* Trust + Navigation */}
      <UniversitiesSection />

      {/* Entrepreneurship */}
      <EntrepreneurshipSection />

      {/* Food & Dining */}
      <FoodExploreSection />
      <TrendingShopsSection />

      {/* Books */}
      <BooksSectionExpanded />

      {/* Marketplace */}
      <MarketplaceSectionExpanded />

      {/* Blood Bank */}
      <BloodBankSection />

      {/* Tuition */}
      <TuitionSectionExpanded />

      {/* Lost & Found */}
      <LostFoundSectionExpanded />

      {/* Donation Campaigns */}
      <DonationSection />

      {/* Jobs Board */}
      <JobsSection />

      {/* Donation + Jobs compact side-by-side widget */}
      <DonationAndJobsSection />

      {/* All 10 Module Highlights */}
      <FeaturedModuleHighlights />

      {/* Detailed feature breakdowns */}
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BloodWidget locale={locale} />
      <FAQSection />
      <CTASection locale={locale} />
    </div>
  );
}
