"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Star,
  CheckCircle,
  Building2,
  ChevronRight,
  Globe,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";
import {
  BLOOD_REQUESTS,
  FAQS,
  FEATURES,
  HERO_LIVE_SIGNALS,
  HERO_ROLES,
  HOW_IT_WORKS,
  MODULES,
  STATS,
  TESTIMONIALS,
  UNIVERSITIES,
} from "./homeTemplate.data";

function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
        }
      },
      { threshold },
    );

    if (ref.current) {
      obs.observe(ref.current);
    }

    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Section({
  children,
  className = "",
  id = "",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
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

function SectionHeader({
  tag,
  title,
  subtitle,
  center = true,
}: {
  tag: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      <span className="section-tag mb-4 inline-flex">{tag}</span>
      <h2 className="section-heading mt-3 mb-4">{title}</h2>
      {subtitle && (
        <p className={`section-subheading ${center ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  color,
  bg,
  title,
  desc,
  label,
  index,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  label: string;
  index: number;
}) {
  return (
    <div
      className="card p-6 group hover:-translate-y-1.5 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
          style={{ background: bg }}
        >
          <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
        </div>
        <span className="badge-neutral text-[10px] font-semibold">{label}</span>
      </div>
      <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-green-DEFAULT opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200">
        Learn more <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

export function ModuleButton({
  icon: Icon,
  label,
  color,
  bg,
  href,
  locale,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  href: string;
  locale: string;
}) {
  return (
    <Link
      href={`/${locale}${href}`}
      className="module-card group border border-gray-200 rounded-xl pz-1 py-3 md:p-4 flex flex-col items-center gap-3 text-center transition hover:shadow-lg justify-center"
    >
      <div
        className="w-10 md:w-14 h-10 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
        style={{ background: bg }}
      >
        <Icon
          className="w-5 md:w-7 h-5 md:h-7"
          style={{ color }}
          strokeWidth={1.8}
        />
      </div>
      <div className="text-center">
        <p className="text-xs md:text-sm font-semibold text-neutral-800 leading-tight">
          {label}
        </p>
      </div>
    </Link>
  );
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5 fill-brand-amber-DEFAULT text-brand-amber-DEFAULT"
        />
      ))}
    </div>
  );
}

export function HeroSection({ locale }: { locale: string }) {
  const [activeModule, setActiveModule] = useState(0);
  const [activeRole, setActiveRole] = useState(HERO_ROLES[0].id);
  const [activeSignal, setActiveSignal] = useState(0);
  const selectedRole =
    HERO_ROLES.find((role) => role.id === activeRole) || HERO_ROLES[0];

  useEffect(() => {
    const timer = setInterval(
      () => setActiveModule((prev) => (prev + 1) % MODULES.length),
      2200,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveSignal((prev) => (prev + 1) % HERO_LIVE_SIGNALS.length),
      3200,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0D1B2A 0%, #1a3055 60%, #0D1B2A 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-green-DEFAULT/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-brand-amber-DEFAULT/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="cs-container relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-brand-green-DEFAULT animate-pulse-slow" />
              <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">
                360 degree campus operating platform
              </span>
            </div>

            <div className="space-y-3">
              <h1
                className="font-display font-extrabold leading-none tracking-tight"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  color: "white",
                }}
              >
                Campus Sheba{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #00A651, #00d46b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  One Platform.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl font-body">
                Enterprise-grade, university-verified ecosystem for delivery,
                marketplace, books, blood, tuition, jobs, donation, parcel, lost
                and found, and daily services.
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
              <p className="text-sm text-white/70 leading-relaxed">
                {selectedRole.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}${selectedRole.primary.href}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #00A651, #00c460)",
                  }}
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
              <span className="text-white/40 text-sm">
                + integrated live operations
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/login`}
                id="hero-get-started-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white shadow-lg transition-all duration-200 hover:shadow-glow-lg hover:-translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #00A651, #00c460)",
                }}
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

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-green-DEFAULT/15 blur-3xl" />
            <div className="relative rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Live Campus Pulse
                  </p>
                  <h3 className="text-xl font-display font-bold text-white mt-1">
                    Real-time activity feed
                  </h3>
                </div>
                <span className="text-xs text-white/40">University scoped</span>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-brand-navy-DEFAULT/50 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: HERO_LIVE_SIGNALS[activeSignal].bg }}
                  >
                    {React.createElement(HERO_LIVE_SIGNALS[activeSignal].icon, {
                      className: "w-5 h-5",
                      style: { color: HERO_LIVE_SIGNALS[activeSignal].color },
                      strokeWidth: 2,
                    })}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {HERO_LIVE_SIGNALS[activeSignal].title}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">
                      {HERO_LIVE_SIGNALS[activeSignal].text}
                    </p>
                    <p className="text-[11px] text-brand-green-300 mt-2">
                      {HERO_LIVE_SIGNALS[activeSignal].time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {HERO_LIVE_SIGNALS.slice(0, 4).map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 border border-white/10 bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: item.bg }}
                      >
                        <item.icon
                          className="w-3.5 h-3.5"
                          style={{ color: item.color }}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/85 font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-white/45 truncate">
                          {item.text}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/35 ml-2">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl px-3 py-3 border border-white/10 bg-white/[0.04]">
                  <p className="text-[11px] text-white/45">Critical Response</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    Blood match in 15 min
                  </p>
                </div>
                <div className="rounded-xl px-3 py-3 border border-white/10 bg-white/[0.04]">
                  <p className="text-[11px] text-white/45">Order Fulfillment</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    98 percent on-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <stat.icon className="w-4 h-4 text-brand-green-DEFAULT" />
                  <span className="font-display font-extrabold text-3xl lg:text-4xl text-white">
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm text-white/40 font-medium">
                  {stat.label}
                </div>
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

export function FeaturesSection() {
  return (
    <>
      {FEATURES.map((group, index) => (
        <Section
          key={group.tag}
          className={`py-20 ${index % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}
        >
          <div className="cs-container">
            <SectionHeader
              tag={group.tag}
              title={group.title}
              subtitle={group.subtitle}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {group.items.map((item, itemIndex) => (
                <FeatureCard key={item.title} {...item} index={itemIndex} />
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      className="py-20 bg-brand-navy-700 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green-DEFAULT/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-amber-DEFAULT/5 rounded-full blur-3xl" />
      </div>
      <div className="cs-container relative z-10">
        <SectionHeader
          tag="Simple Process"
          title={
            <span className="text-white">
              Get Started in{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#00A651,#00d46b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                4 Steps
              </span>
            </span>
          }
          subtitle=""
        />
        <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.step} className="relative text-center group">
              {index < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[55%] w-full h-px bg-white/10" />
              )}
              <div
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 mx-auto border border-white/10 group-hover:border-brand-green-DEFAULT/40 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <step.icon
                  className="w-8 h-8 text-brand-green-DEFAULT"
                  strokeWidth={1.5}
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-green-DEFAULT flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {step.step}
                  </span>
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

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

export function TestimonialsSection() {
  return (
    <Section className="py-20 bg-white">
      <div className="cs-container">
        <SectionHeader
          tag="Loved by Students"
          title={
            <>
              What Our <span className="gradient-text-green">Community</span>{" "}
              Says
            </>
          }
          subtitle="Real stories from real campus students across Bangladesh."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="card p-7 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-5">
                <Stars />
                <span className="badge-green text-[10px]">
                  {testimonial.module}
                </span>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green-DEFAULT flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function BloodWidget({ locale }: { locale: string }) {
  return (
    <Section className="py-16 bg-neutral-50">
      <div className="cs-container">
        <div
          className="rounded-3xl overflow-hidden border border-red-100"
          style={{
            background: "linear-gradient(135deg, #FEF2F2 0%, #FFF 100%)",
          }}
        >
          <div className="p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-4">
                <Droplets className="w-3.5 h-3.5" />
                EMERGENCY BLOOD NETWORK
              </span>
              <h2 className="font-display font-bold text-3xl text-neutral-900 mb-3">
                Active Blood <span style={{ color: "#DC2626" }}>Requests</span>
              </h2>
              <p className="text-neutral-500 text-base mb-6 leading-relaxed">
                Join 500+ registered donors on Campus Sheba. Your blood can save
                a life in 15 minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/blood-bank`}
                  id="blood-register-btn"
                  className="btn-primary"
                >
                  Register as Donor
                </Link>
                <Link
                  href={`/${locale}/blood-bank`}
                  id="blood-request-btn"
                  className="btn-secondary"
                >
                  <Droplets className="w-4 h-4 text-red-500" />
                  Emergency Request
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {BLOOD_REQUESTS.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-xs hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {request.group}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {request.location}
                      </p>
                      <span
                        className={`badge text-[10px] flex-shrink-0 ${
                          request.urgency === "Critical"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : request.urgency === "Urgent"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {request.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{request.time}</p>
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

export function UniversitiesSection() {
  return (
    <Section className="py-14 bg-white border-y border-neutral-100">
      <div className="cs-container">
        <p className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-8">
          Serving Students at
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {UNIVERSITIES.map((university) => (
            <div
              key={university}
              className="flex items-center gap-2 px-5 py-2 md:py-2.5 rounded-full bg-neutral-50 border border-neutral-200 hover:border-brand-green-DEFAULT hover:bg-brand-green-50 transition-all duration-200 cursor-default group"
            >
              <Building2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-green-DEFAULT transition-colors" />
              <span className="text-xs md:text-sm font-medium text-neutral-600 group-hover:text-brand-green-700 transition-colors">
                {university}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-5 py-2 md:py-2.5 rounded-full bg-brand-green-50 border border-brand-green-DEFAULT/30">
            <Globe className="w-3.5 h-3.5 text-brand-green-DEFAULT" />
            <span className="text-xs md:text-sm font-semibold text-brand-green-700">
              + More Coming
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section className="py-20 bg-neutral-50">
      <div className="cs-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeader
              tag="FAQ"
              title={
                <>
                  Frequently Asked{" "}
                  <span className="gradient-text-green">Questions</span>
                </>
              }
              subtitle="Everything you need to know before getting started."
              center={false}
            />
            <div className="mt-8">
              <p className="text-sm text-neutral-500 mb-4">
                Still have questions?
              </p>
              <a
                href="mailto:campussheba24@gmail.com"
                id="faq-contact-link"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green-DEFAULT hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Contact our support team
              </a>
            </div>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                id={`faq-item-${index}`}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-neutral-200 transition-colors duration-150"
              >
                <button
                  onClick={() => setOpen(open === index ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={open === index}
                >
                  <span className="text-sm font-semibold text-neutral-800">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${open === index ? "bg-brand-green-DEFAULT rotate-45" : "bg-neutral-100"}`}
                  >
                    <span
                      className={`text-lg leading-none font-light ${open === index ? "text-white" : "text-neutral-500"}`}
                    >
                      +
                    </span>
                  </div>
                </button>
                {open === index && (
                  <div className="px-6 pb-5 animate-fade-in">
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {faq.a}
                    </p>
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

export function CTASection({ locale }: { locale: string }) {
  return (
    <Section className="py-20 bg-white">
      <div className="cs-container">
        <div
          className="relative rounded-3xl overflow-hidden text-center py-16 px-8"
          style={{
            background:
              "linear-gradient(135deg, #0D1B2A 0%, #1a3055 60%, #0D1B2A 100%)",
          }}
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-green-DEFAULT/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-amber-DEFAULT/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span
              className="section-tag mb-6 inline-flex"
              style={{
                background: "rgba(0,166,81,0.15)",
                borderColor: "rgba(0,166,81,0.3)",
                color: "#4ade80",
              }}
            >
              Join 10,000+ Students
            </span>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white mb-4 tracking-tight">
              Ready to Transform Your
              <br /> Campus Experience?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students already using Campus Sheba to simplify,
              enrich, and supercharge their university life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={`/${locale}/login`}
                id="cta-main-btn"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-base text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-lg"
                style={{
                  background: "linear-gradient(135deg, #00A651, #00c460)",
                }}
              >
                Get Started - It&apos;s Free
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

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {[
                "University Verified",
                "100% Secure",
                "Free to Join",
                "3+ Campuses",
              ].map((signal) => (
                <div
                  key={signal}
                  className="flex items-center gap-2 text-white/50 text-xs font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-brand-green-DEFAULT" />
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function HomeModulesOverlay({ locale }: { locale: string }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {MODULES.slice(0, 7).map((module) => (
        <ModuleButton key={module.id} {...module} locale={locale} />
      ))}
      <Link
        href={`/${locale}/services`}
        className="module-card group border border-dashed border-[#00A651]/40 rounded-xl p-1 py-3 md:p-4 flex flex-col items-center gap-3 text-center transition hover:border-[#00A651] hover:shadow-lg justify-center"
      >
        <div
          className="w-10 md:w-14 h-10 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
          style={{ background: "#F0FFF7" }}
        >
          <LayoutGrid
            className="w-5 md:w-7 h-5 md:h-7"
            style={{ color: "#00A651" }}
            strokeWidth={1.8}
          />
        </div>
        <div className="text-center">
          <p
            className="text-xs md:text-sm font-semibold leading-tight"
            style={{ color: "#00A651" }}
          >
            Explore All
          </p>
        </div>
      </Link>
    </div>
  );
}
