import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { servicesMenu } from "@/components/siteSettings/navbar/navbar.constants";

const SERVICE_STATS = [
  { value: `${servicesMenu.length}+`, label: "Campus solutions" },
  { value: "24/7", label: "Always discoverable" },
  { value: "120+", label: "Partner campuses" },
  { value: "1", label: "Unified student platform" },
];

const TRUST_POINTS = [
  {
    title: "Built around student life",
    description:
      "From food delivery to tutoring and blood donation, every module is shaped around daily campus needs.",
    icon: Sparkles,
  },
  {
    title: "Verified community access",
    description:
      "Campus-first onboarding helps students, teachers, and service providers connect in a trusted ecosystem.",
    icon: ShieldCheck,
  },
  {
    title: "Fast discovery, less friction",
    description:
      "Browse categories, jump into the exact module you need, and move from search to action in a few clicks.",
    icon: Clock3,
  },
];

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Pick a campus need",
    description:
      "Start with what matters right now: meals, books, tuition, jobs, delivery, donations, or student business tools.",
  },
  {
    step: "02",
    title: "Open a service module",
    description:
      "Each module takes you into a focused experience with the right actions, listings, and workflows for that category.",
  },
  {
    step: "03",
    title: "Book, browse, buy, or contribute",
    description:
      "Move directly into the task, whether you are ordering food, posting a job, finding a tutor, or helping a cause.",
  },
];

const FEATURED_GROUPS = [
  {
    title: "Everyday essentials",
    description: "Services students use regularly to save time and stay organized on campus.",
    items: ["Delivery Sheba", "Book Sheba", "Parcel Delivery", "Garbage Collector"],
  },
  {
    title: "Growth and income",
    description: "Tools for selling, tutoring, freelancing, and launching student-led businesses.",
    items: ["Buy & Sell", "Entrepreneurship", "Tuition Sheba", "Jobs"],
  },
  {
    title: "Community support",
    description: "Modules built for urgent help, giving back, and reconnecting campus communities.",
    items: ["Blood Bank", "Donation", "Lost & Found"],
  },
];

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(227,10,19,0.22),_transparent_34%),linear-gradient(135deg,#0f172a_0%,#111827_44%,#1f2937_100%)] text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-4rem] top-10 h-40 w-40 rounded-full bg-[#E30A13]/30 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-2rem] h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>
        <div className="cs-container relative py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur">
              <Users className="h-4 w-4" />
              One campus hub for daily essentials, earning, and community support
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Explore all Campus Sheba services in one place
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Browse every service module available on Campus Sheba and jump straight into the one you need. From delivery and books to jobs, tuition, blood donation, and student entrepreneurship, this is the complete services directory.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/?auth=signup`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#E30A13] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c40912]"
              >
                Create free account
              </Link>
              <Link
                href={`${servicesMenu[0].href}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Start with {servicesMenu[0].label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SERVICE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-sm"
              >
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="cs-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E30A13]">
              Services Directory
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Pick the right module for the task at hand
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Every card below routes into a dedicated feature page. Use this page as the main entry point whenever you want the full list instead of a single category.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {servicesMenu.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.label}
                  href={`/${service.href}`}
                  className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#E30A13]/25 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.bg}`}
                    >
                      <Icon className={`h-7 w-7 ${service.color}`} />
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Service
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 transition group-hover:text-[#E30A13]">
                    {service.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-[#E30A13]">
                    Open module
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="cs-container grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E30A13]">
              Why this page exists
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              A cleaner way to explore the whole platform
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              The platform has multiple service modules with different goals. This page gives users a complete directory view, so the “Explore All” action has a proper destination instead of dropping people into a dead end.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => {
                const Icon = point.icon;

                return (
                  <div key={point.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E30A13]/10 text-[#E30A13]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{point.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Service journeys
            </p>
            <div className="mt-6 space-y-5">
              {JOURNEY_STEPS.map((item) => (
                <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-bold text-emerald-300">{item.step}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff7f7] py-16 lg:py-20">
        <div className="cs-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E30A13]">
              Browse by purpose
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Start from what you want to solve today
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {FEATURED_GROUPS.map((group) => (
              <div key={group.title} className="rounded-[28px] border border-[#E30A13]/10 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">{group.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{group.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="cs-container">
          <div className="rounded-[36px] bg-gradient-to-br from-[#E30A13] via-[#c70d15] to-[#861118] px-6 py-10 text-white shadow-2xl shadow-[#E30A13]/15 sm:px-10 lg:px-14 lg:py-14">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100">
                  Ready to explore
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Use Campus Sheba as your all-in-one student service layer
                </h2>
                <p className="mt-4 text-base leading-7 text-rose-100">
                  Sign up to access the full ecosystem, or jump straight into a category and see what is already available for your campus.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`?auth=signup`}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#E30A13] transition hover:bg-rose-50"
                >
                  Join Campus Sheba
                </Link>
                <Link
                  href={`/${servicesMenu[1].href}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse marketplace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}