"use client";

import type { ComponentType } from "react";
import {
  Bike,
  BookOpen,
  Droplets,
  MapPinned,
  Package,
  ShoppingBag,
  Siren,
  Sparkles,
  MapPin,
  Store,
  ArrowRight,
  GraduationCap,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { AppState } from "@/types/global";

type HubIcon = ComponentType<{ className?: string }>;

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

type HubModule = {
  href: string;
  title: string;
  description: string;
  icon: HubIcon;
  gradient: string;
  ring: string;
};

const LIVE_MODULES: HubModule[] = [
  {
    href: "/marketplace",
    title: "Buy & Sell",
    description: "Peer listings, gadgets, furniture, and daily needs on your campus.",
    icon: ShoppingBag,
    gradient: "from-emerald-500/15 to-teal-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    href: "/books",
    title: "Book Sheba",
    description: "Sell, lend, or donate textbooks. Borrow what you need for the term.",
    icon: BookOpen,
    gradient: "from-blue-500/15 to-sky-500/10",
    ring: "ring-blue-500/20",
  },
  {
    href: "/blood-bank",
    title: "Blood bank",
    description: "Find donors and post urgent blood requests for your university.",
    icon: Droplets,
    gradient: "from-red-500/15 to-rose-500/10",
    ring: "ring-red-500/20",
  },
  {
    href: "/lost-found",
    title: "Lost & Found",
    description: "Report lost items or help others recover phones, IDs, and gear.",
    icon: MapPin,
    gradient: "from-amber-500/15 to-yellow-500/10",
    ring: "ring-amber-500/25",
  },
  {
    href: "/campus-map",
    title: "Campus map",
    description: "Interactive map of halls, lakes, food zones, and landmarks.",
    icon: MapPinned,
    gradient: "from-cyan-500/15 to-teal-500/10",
    ring: "ring-cyan-500/20",
  },
  {
    href: "/emergency-contacts",
    title: "Emergency",
    description: "Security, hospitals, ambulance, police — numbers for your campus.",
    icon: Siren,
    gradient: "from-red-600/20 to-orange-600/15",
    ring: "ring-red-500/30",
  },
  {
    href: "/parcel",
    title: "Parcel delivery",
    description: "Send packages between halls and campus points with tracking.",
    icon: Package,
    gradient: "from-violet-500/15 to-purple-500/10",
    ring: "ring-violet-500/20",
  },
  {
    href: "/delivery",
    title: "Food delivery",
    description: "Order from campus kitchens and nearby spots when delivery is live.",
    icon: Bike,
    gradient: "from-purple-500/15 to-fuchsia-500/10",
    ring: "ring-purple-500/20",
  },
];

const ROADMAP: { title: string; description: string; icon: HubIcon }[] = [
  {
    title: "Campus shops",
    description: "Shop-by-shop marketplace: official outlets, merch, and student-run corners.",
    icon: Store,
  },
  {
    title: "Food & products",
    description: "Menus, combos, and packaged goods tailored to your hall and timing.",
    icon: UtensilsCrossed,
  },
  {
    title: "Skill & services",
    description: "Tutoring, design, repair — book trusted peers with ratings and slots.",
    icon: Wrench,
  },
  {
    title: "Tuition & learning",
    description: "Deeper matchmaking for courses, groups, and mentors (coming with Tuition Sheba).",
    icon: GraduationCap,
  },
];

function ModuleCard({ mod }: { mod: HubModule }) {
  const Icon = mod.icon;
  return (
    <Link
      href={mod.href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${mod.ring}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${mod.gradient}`}
        aria-hidden
      />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-[#00A651] shadow-sm ring-1 ring-gray-200/80">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="relative mt-4 text-base font-bold text-gray-900">{mod.title}</h3>
      <p className="relative mt-1 flex-1 text-sm leading-relaxed text-gray-600">{mod.description}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00A651]">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function CampusHubLanding() {
  const t = useTranslations("common");
  const { state } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = resolveUniversityId(state);
  const campusName =
    state.university.selected?.name ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university?.name
      ? state.user.profile.university.name
      : null);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-20 pt-2">
        <AppBreadcrumb
          items={[
            { label: tt("campusHub.home", "Home"), href: "/" },
            { label: tt("campusHub.title", "Explore campus") },
          ]}
        />

        <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#00A651] via-emerald-600 to-teal-800 px-6 py-12 text-white shadow-2xl shadow-emerald-900/20 md:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/95 ring-1 ring-white/30">
              <Sparkles className="h-3.5 w-3.5" />
              {tt("campusHub.badge", "Campus Sheba")}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {tt("campusHub.headline", "Everything your campus day needs")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">
              {tt(
                "campusHub.lead",
                "Books, safety, maps, parcels, marketplace — one place to discover what your university already offers. Pick your campus for a personalized feed.",
              )}
            </p>
            {campusName ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                {tt("campusHub.personalizedFor", "Personalized for")} {campusName}
              </p>
            ) : (
              <p className="mt-4 text-sm font-medium text-white/85">
                {tt("campusHub.useTopBar", "Use the campus selector in the top bar to unlock maps, emergency numbers, and listings.")}
              </p>
            )}
          </div>
        </div>

        {universityId ? (
          <div className="mt-10">
            <FeatureHeroAds universityId={universityId} />
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center md:px-10">
            <MapPinned className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 text-sm font-semibold text-gray-800">
              {tt("campusHub.chooseCampusTitle", "Choose your university")}
            </p>
            <p className="mx-auto mt-1 max-w-lg text-sm text-gray-600">
              {tt(
                "campusHub.chooseCampusBody",
                "Banners, maps, and emergency contacts use your campus context. Guests can select from the top bar.",
              )}
            </p>
          </div>
        )}

        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            {tt("campusHub.liveServices", "Live on your campus")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            {tt("campusHub.liveServicesSub", "Tap a card — same experience you know from the rest of Campus Sheba.")}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIVE_MODULES.map((mod) => (
              <ModuleCard key={mod.href} mod={mod} />
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-3xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white px-6 py-10 shadow-inner md:px-10 md:py-12">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                {tt("campusHub.roadmapTitle", "On the roadmap")}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-gray-600">
                {tt(
                  "campusHub.roadmapSub",
                  "We are wiring shop-wise selling, food menus, and skill-based services next — your hub will grow with the platform.",
                )}
              </p>
            </div>
            <span className="mt-2 inline-flex w-fit rounded-full bg-gray-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white md:mt-0">
              {tt("campusHub.soon", "Coming soon")}
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ROADMAP.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm ring-1 ring-black/[0.03]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-900 px-6 py-8 text-center text-white md:flex-row md:text-left">
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              {tt("campusHub.ctaEyebrow", "Need help now?")}
            </p>
            <p className="mt-1 text-lg font-bold">{tt("campusHub.ctaTitle", "Emergency contacts & blood requests")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <Link
              href="/emergency-contacts"
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600"
            >
              {tt("campusHub.ctaEmergency", "Emergency")}
            </Link>
            <Link
              href="/blood-bank"
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
            >
              {tt("campusHub.ctaBlood", "Blood bank")}
            </Link>
          </div>
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
