"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bus,
  CircleDollarSign,
  MapPinned,
  Navigation,
  Radio,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { fetchLiveBusesAction } from "@/services/bus";

type Tile = {
  key: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  live?: boolean;
  preview?: boolean;
  span?: boolean;
};

const TILES: Tile[] = [
  {
    key: "live",
    title: "Schedule & Live Tracking",
    desc: "Real-time campus shuttle map, routes, stops & ETA. Share your bus when the driver is offline.",
    href: "/live-bus",
    icon: Navigation,
    gradient: "from-emerald-500 to-green-600",
    accent: "text-emerald-50",
    live: true,
    span: true,
  },
  {
    key: "fare",
    title: "Fare Guide",
    desc: "Verified rickshaw, CNG, auto & e-cart fares between campus landmarks.",
    href: "/transport/fare-guide",
    icon: CircleDollarSign,
    gradient: "from-amber-500 to-orange-600",
    accent: "text-amber-50",
    preview: true,
  },
  {
    key: "rent",
    title: "Vehicle Rent",
    desc: "Rent a cycle, e-cart or scooter by the hour or day — pay from your wallet.",
    href: "/transport/rent",
    icon: Bus,
    gradient: "from-violet-500 to-purple-600",
    accent: "text-violet-50",
    preview: true,
  },
  {
    key: "ride",
    title: "Ride Sharing",
    desc: "Split a ride with classmates heading your way. Post an offer or find one.",
    href: "/transport/ride-share",
    icon: Users,
    gradient: "from-rose-500 to-pink-600",
    accent: "text-rose-50",
    preview: true,
  },
  {
    key: "ticket",
    title: "Intercity Ticket",
    desc: "Book Sylhet, Chattogram & Cox's Bazar coaches with a live seat map.",
    href: "/transport/tickets",
    icon: Ticket,
    gradient: "from-blue-500 to-indigo-600",
    accent: "text-blue-50",
    preview: true,
  },
];

export default function TransportHub() {
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [busCount, setBusCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void fetchLiveBusesAction().then((r) => {
      if (!active) return;
      if (r.success) {
        setBusCount(r.data.length);
        setLiveCount(r.data.filter((b) => b.isLive).length);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Transport" }]} />

        {/* Hero */}
        <div className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#00A651] via-emerald-600 to-teal-700 p-8 text-white shadow-xl md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-black/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Campus Mobility
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Get anywhere on campus, in real time
            </h1>
            <p className="mt-3 text-sm text-white/85 md:text-base">
              Track shuttles live, check fair fares, rent a ride, share a trip, or book an
              intercity coach — all in one place, scoped to your campus.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/live-bus"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <Navigation className="h-4 w-4" /> Track a bus now
              </Link>
              <Link
                href="/transport/tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Ticket className="h-4 w-4" /> Book intercity
              </Link>
            </div>

            {/* live stats */}
            <div className="mt-7 flex flex-wrap gap-6">
              <Stat label="Buses live now" value={liveCount} accent />
              <Stat label="Routes on campus" value={busCount} />
              <Stat label="Avg wait saved" value={"~40%"} isText />
            </div>
          </div>
        </div>

        {/* Sub-module bento grid */}
        <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${t.gradient} p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                t.span ? "md:col-span-2 lg:col-span-1 lg:row-span-1" : ""
              }`}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl transition group-hover:scale-125" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <t.icon className="h-5 w-5" />
                  </div>
                  {t.live ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                    </span>
                  ) : t.preview ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                      Preview
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
                <p className={`mt-1.5 text-sm ${t.accent}`}>{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}

          {/* Parcel cross-link (real module) */}
          <Link
            href="/parcel"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <MapPinned className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Parcel Delivery</h3>
              <p className="mt-1.5 text-sm text-gray-500">
                Send packages between halls and landmarks with a campus rider.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00A651]">
              Send a parcel <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Live Bus &amp; Parcel are connected to live services. Fare Guide, Rent, Ride Sharing &amp;
          Intercity Ticket are interactive previews.
        </p>
      </ContentWrapper>
    </SectionWrapper>
  );
}

function Stat({
  label,
  value,
  accent,
  isText,
}: {
  label: string;
  value: number | string | null;
  accent?: boolean;
  isText?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-extrabold ${accent ? "text-white" : "text-white/95"}`}>
          {value == null ? "—" : isText ? value : value}
        </span>
        {accent && typeof value === "number" && value > 0 ? (
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
        ) : null}
      </div>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
