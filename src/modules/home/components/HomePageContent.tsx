"use client";

import type { ComponentType } from "react";
import {
  ArrowRight,
  Bike,
  BookOpen,
  Droplets,
  HeartHandshake,
  MapPinned,
  Package,
  ShoppingBag,
  Siren,
  MapPin,
  Sparkles,
  Store,
  GraduationCap,
  Briefcase,
  UtensilsCrossed,
  Wrench,
  Trash2,
  Compass,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { HomeBloodRails } from "./sections/HomeBloodRails";
import { HomeBooksRails } from "./sections/HomeBooksRails";
import { HomeLostFoundRails } from "./sections/HomeLostFoundRails";
import { HomeMarketplaceRails } from "./sections/HomeMarketplaceRails";
import { HomeParcelCampusCtas } from "./sections/HomeParcelCampusCtas";

type CardIcon = ComponentType<{ className?: string }>;

type ServiceCard = {
  href: string;
  title: string;
  description: string;
  icon: CardIcon;
  accent: string;
  /** Short label for SEO / list */
  keyword: string;
};

const LIVE_SERVICES: ServiceCard[] = [
  {
    href: "/buy-sell",
    title: "Buy & Sell",
    description: "List and discover textbooks, gadgets, and everyday items from students nearby.",
    icon: ShoppingBag,
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-200/60",
    keyword: "campus marketplace",
  },
  {
    href: "/books",
    title: "Book Sheba",
    description: "Sell, lend, or donate books. Borrow what you need for the semester.",
    icon: BookOpen,
    accent: "from-blue-500/15 to-sky-500/10 border-blue-200/60",
    keyword: "used textbooks",
  },
  {
    href: "/blood-bank",
    title: "Blood bank",
    description: "Find donors and raise urgent blood requests for your university.",
    icon: Droplets,
    accent: "from-red-500/15 to-rose-500/10 border-red-200/60",
    keyword: "blood donation",
  },
  {
    href: "/lost-found",
    title: "Lost & Found",
    description: "Report lost items or help others recover phones, wallets, and IDs.",
    icon: MapPin,
    accent: "from-amber-500/15 to-yellow-500/10 border-amber-200/60",
    keyword: "lost and found",
  },
  {
    href: "/campus-map",
    title: "Campus map",
    description: "Explore halls, lakes, food zones, and landmarks on an interactive map.",
    icon: MapPinned,
    accent: "from-cyan-500/15 to-teal-500/10 border-cyan-200/60",
    keyword: "campus map",
  },
  {
    href: "/emergency-contacts",
    title: "Emergency contacts",
    description: "Security, hospitals, ambulance, police, and fire — numbers for your campus.",
    icon: Siren,
    accent: "from-red-600/20 to-orange-500/10 border-red-200/70",
    keyword: "emergency helpline",
  },
  {
    href: "/parcel",
    title: "Parcel delivery",
    description: "Send parcels between halls and campus points with clear tracking.",
    icon: Package,
    accent: "from-violet-500/15 to-purple-500/10 border-violet-200/60",
    keyword: "campus courier",
  },
];

const COMING_SOON: { title: string; description: string; icon: CardIcon }[] = [
  {
    title: "Food & dining",
    description: "Campus kitchens, menus, and delivery windows tuned to class breaks.",
    icon: UtensilsCrossed,
  },
  {
    title: "Shops & products",
    description: "Product-based marketplace and verified campus shops in one flow.",
    icon: Store,
  },
  {
    title: "Skills & services",
    description: "Book tutors, designers, and fixers from your student community.",
    icon: Wrench,
  },
  {
    title: "Jobs & gigs",
    description: "Part-time roles, internships, and micro-gigs around your university.",
    icon: Briefcase,
  },
  {
    title: "Tuition Sheba",
    description: "Smarter matching for courses, groups, and mentors.",
    icon: GraduationCap,
  },
  {
    title: "Eco pickup",
    description: "Responsible waste collection and recycling on campus.",
    icon: Trash2,
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Campus Sheba",
  description:
    "360-degree campus lifestyle platform: marketplace, books, blood bank, lost & found, campus map, emergency contacts, and parcel delivery for students in Bangladesh.",
  url: "https://campussheba.com",
  publisher: {
    "@type": "Organization",
    name: "Campus Sheba",
  },
};

const HOME_JUMP_LINKS: { href: string; label: string }[] = [
  { href: "#home-used-marketplace", label: "Used items" },
  { href: "#home-books", label: "Books" },
  { href: "#home-lost-found", label: "Lost & found" },
  { href: "#home-blood", label: "Blood" },
  { href: "#home-parcel-campus", label: "Parcel & safety" },
];

function HomeJumpNav({ tt }: { tt: (key: string, fallback: string) => string }) {
  return (
    <nav
      aria-label={tt("homeContent.jumpNavLabel", "Jump to homepage sections")}
      className="mt-10 flex flex-wrap justify-center gap-2 border-y border-gray-100 py-4"
    >
      {HOME_JUMP_LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:border-[#00A651]/40 hover:text-[#00A651] md:text-sm"
        >
          {l.label}
        </a>
      ))}
      <Link
        href="/explore"
        className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 md:text-sm"
      >
        {tt("homeContent.jumpHub", "Full hub")}
      </Link>
    </nav>
  );
}

function ServicePill({ item }: { item: ServiceCard }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#00A651]/35 hover:shadow-md`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent} border text-[#00A651]`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      {item.title}
      <ArrowRight className="h-3.5 w-3.5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#00A651]" aria-hidden />
    </Link>
  );
}

export function HomePageContent() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const { state } = useAppState();
  const campus = state.university.selected?.name;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-white pt-10 md:pt-16">
        <ContentWrapper maxWidth="container" padding="none" className="px-4 md:px-8">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00A651]">
              {tt("homeContent.kicker", "Campus life, simplified")}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {tt("homeContent.headline", "One platform for study, safety, and everyday campus needs")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              {tt(
                "homeContent.intro",
                "Campus Sheba connects students and staff with trusted services: peer marketplace, book exchange, blood support, lost & found, live campus maps, emergency numbers, and parcel delivery — built for Bangladesh universities.",
              )}
            </p>
            {campus ? (
              <p className="mt-3 text-sm font-semibold text-gray-800">
                {tt("homeContent.showingFor", "Showing tools for")}{" "}
                <span className="text-[#00A651]">{campus}</span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-amber-800">
                {tt(
                  "homeContent.pickCampusHint",
                  "Tip: choose your university from the top bar to personalize banners, maps, and listings.",
                )}
              </p>
            )}
          </header>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 hover:brightness-105"
            >
              <Compass className="h-5 w-5" aria-hidden />
              {tt("homeContent.ctaExplore", "Explore all services")}
            </Link>
            <Link
              href="/buy-sell"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-800 hover:border-[#00A651]/40 hover:bg-gray-50"
            >
              {tt("homeContent.ctaMarketplace", "Browse marketplace")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <HomeJumpNav tt={tt} />
        </ContentWrapper>
      </SectionWrapper>

      <HomeMarketplaceRails />
      <HomeBooksRails />
      <HomeLostFoundRails />
      <HomeBloodRails />
      <HomeParcelCampusCtas />

      <SectionWrapper spacing="none" background="transparent" className="my-0 border-y border-gray-100 bg-gray-50/80 py-12 md:py-16">
        <ContentWrapper maxWidth="container" padding="none" className="px-4 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                {tt("homeContent.quickServicesTitle", "Every live module — one tap away")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                {tt(
                  "homeContent.quickServicesSub",
                  "Prefer a traditional directory? Jump straight into any service; the sections above show real listings when your campus is selected.",
                )}
              </p>
            </div>
            <Link href="/explore" className="text-sm font-bold text-[#00A651] hover:underline">
              {tt("homeContent.viewHub", "View service hub")} →
            </Link>
          </div>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LIVE_SERVICES.map((item) => (
              <ServicePill key={item.href} item={item} />
            ))}
          </div>
        </ContentWrapper>
      </SectionWrapper>

      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-white py-14 md:py-20">
        <ContentWrapper maxWidth="container" padding="none" className="px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100">
                <HeartHandshake className="h-4 w-4" aria-hidden />
                {tt("homeContent.whyTitle", "Why students use us")}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {tt("homeContent.whyHeadline", "Built for real campus routines")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {tt(
                  "homeContent.whyBody",
                  "From night-before exams to sudden emergencies, Campus Sheba keeps essential tools in one trusted place — with your university at the center.",
                )}
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              {[
                {
                  title: tt("homeContent.benefit1Title", "Campus-first"),
                  text: tt(
                    "homeContent.benefit1Text",
                    "Maps, contacts, and listings respect your institution — not generic city results.",
                  ),
                },
                {
                  title: tt("homeContent.benefit2Title", "Peer-powered"),
                  text: tt(
                    "homeContent.benefit2Text",
                    "Books, buy & sell, and blood networks grow from students helping students.",
                  ),
                },
                {
                  title: tt("homeContent.benefit3Title", "Safety aware"),
                  text: tt(
                    "homeContent.benefit3Text",
                    "Emergency directories and lost & found reduce friction when minutes count.",
                  ),
                },
                {
                  title: tt("homeContent.benefit4Title", "Always evolving"),
                  text: tt(
                    "homeContent.benefit4Text",
                    "Food, shops, jobs, and tuition tools are rolling out — your feedback shapes the roadmap.",
                  ),
                },
              ].map((b) => (
                <li
                  key={b.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5 ring-1 ring-black/[0.02]"
                >
                  <h3 className="font-bold text-gray-900">{b.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </ContentWrapper>
      </SectionWrapper>

      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-gradient-to-b from-gray-900 to-gray-950 py-14 text-white md:py-20">
        <ContentWrapper maxWidth="container" padding="none" className="px-4 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {tt("homeContent.roadmapTitle", "Coming soon to your campus")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-300 md:text-base">
                {tt(
                  "homeContent.roadmapSub",
                  "We are shipping food ordering, shop-wise selling, skill bookings, jobs, tuition matching, and sustainable waste pickup — day by day.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-white/15">
                {tt("homeContent.roadmapBadge", "In development")}
              </span>
            </div>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-emerald-400" aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ContentWrapper>
      </SectionWrapper>

      <SectionWrapper spacing="none" background="transparent" className="my-0 border-t border-gray-100 bg-white py-12 md:py-16">
        <ContentWrapper maxWidth="container" padding="none" className="px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#00A651]" aria-hidden />
            <h2 className="mt-4 text-xl font-bold text-gray-900 md:text-2xl">
              {tt("homeContent.deliveryTitle", "Food delivery on the way")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {tt(
                "homeContent.deliveryBody",
                "Delivery Sheba will tie into the same account and campus context you use for parcels and maps — stay tuned for launch announcements.",
              )}
            </p>
            <Link
              href="/delivery"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
            >
              <Bike className="h-4 w-4 text-purple-600" aria-hidden />
              {tt("homeContent.deliveryCta", "Delivery hub")}
            </Link>
          </div>

          <nav aria-label={tt("homeContent.seoNavLabel", "Main campus services")} className="mt-14 border-t border-gray-100 pt-10">
            <h2 className="text-center text-sm font-bold uppercase tracking-wider text-gray-400">
              {tt("homeContent.seoNavTitle", "Popular links")}
            </h2>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
              {LIVE_SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-gray-700 underline-offset-4 hover:text-[#00A651] hover:underline">
                    {s.title} — {s.keyword}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/explore" className="font-semibold text-[#00A651] hover:underline">
                  {tt("homeContent.allServices", "All services overview")}
                </Link>
              </li>
            </ul>
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-gray-500">
              {tt(
                "homeContent.seoClosing",
                "Campus Sheba helps Bangladesh university students buy and sell safely, exchange textbooks, request blood donors, navigate campus with an interactive map, reach emergency contacts, and send parcels — with more lifestyle features launching regularly.",
              )}
            </p>
          </nav>
        </ContentWrapper>
      </SectionWrapper>
    </>
  );
}
