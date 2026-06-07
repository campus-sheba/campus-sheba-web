"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bus,
  CircleDollarSign,
  MapPinned,
  Navigation,
  Package,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { fetchLiveBusesAction } from "@/services/bus";

type TransportIcon = ComponentType<{ className?: string }>;

type TransportModule = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: TransportIcon;
  gradient: string;
  ring: string;
  status: "live" | "preview";
};

const LIVE_MODULES: TransportModule[] = [
  {
    key: "live",
    title: "Schedule & live tracking",
    description:
      "Campus shuttle map with routes, stops, and ETA. Share your bus when the driver is offline.",
    href: "/live-bus",
    icon: Navigation,
    gradient: "from-emerald-500/12 to-teal-500/8",
    ring: "ring-emerald-500/25",
    status: "live",
  },
  {
    key: "parcel",
    title: "Parcel delivery",
    description: "Send packages between halls and landmarks with a campus rider.",
    href: "/parcel",
    icon: Package,
    gradient: "from-slate-500/10 to-gray-500/5",
    ring: "ring-gray-200",
    status: "live",
  },
];

const MORE_MODULES: TransportModule[] = [
  {
    key: "fare",
    title: "Fare guide",
    description: "Verified rickshaw, CNG, auto, and e-cart fares between campus landmarks.",
    href: "/transport/fare-guide",
    icon: CircleDollarSign,
    gradient: "from-amber-500/10 to-orange-500/5",
    ring: "ring-amber-500/15",
    status: "preview",
  },
  {
    key: "rent",
    title: "Vehicle rent",
    description: "Rent a cycle, e-cart, or scooter by the hour or day from your wallet.",
    href: "/transport/rent",
    icon: Bus,
    gradient: "from-violet-500/10 to-purple-500/5",
    ring: "ring-violet-500/15",
    status: "preview",
  },
  {
    key: "ride",
    title: "Ride sharing",
    description: "Split a ride with classmates heading your way. Post an offer or find one.",
    href: "/transport/ride-share",
    icon: Users,
    gradient: "from-rose-500/10 to-pink-500/5",
    ring: "ring-rose-500/15",
    status: "preview",
  },
  {
    key: "ticket",
    title: "Intercity ticket",
    description: "Book Sylhet, Chattogram, and Cox's Bazar coaches with a live seat map.",
    href: "/transport/tickets",
    icon: Ticket,
    gradient: "from-blue-500/10 to-indigo-500/5",
    ring: "ring-blue-500/15",
    status: "preview",
  },
];

function StatusBadge({ status }: { status: "live" | "preview" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-200/80">
      Preview
    </span>
  );
}

function ModuleCard({ mod }: { mod: TransportModule }) {
  const Icon = mod.icon;

  return (
    <Link
      href={mod.href}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition duration-200 hover:shadow-md ${mod.ring}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${mod.gradient}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-[#00A651] shadow-sm ring-1 ring-gray-200/80">
          <Icon className="h-5 w-5" />
        </div>
        <StatusBadge status={mod.status} />
      </div>
      <h3 className="relative mt-4 text-base font-bold text-gray-900">{mod.title}</h3>
      <p className="relative mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
        {mod.description}
      </p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00A651]">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-12 animate-pulse rounded-md bg-gray-100" />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
          {value == null ? "—" : value}
        </p>
      )}
    </div>
  );
}

export default function TransportHub() {
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [busCount, setBusCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchLiveBusesAction().then((r) => {
      if (!active) return;
      if (r.success) {
        setBusCount(r.data.length);
        setLiveCount(r.data.filter((b) => b.isLive).length);
      }
      setStatsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-20 pt-2">
        <AppBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Transport" }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/60 to-white p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00A651] text-white shadow-sm">
                <Navigation className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Campus transport
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                Track shuttles in real time, compare local fares, rent a vehicle, share a ride, or
                book intercity coaches — scoped to your campus.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/live-bus"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  <Navigation className="h-4 w-4" />
                  Track a bus
                </Link>
                <Link
                  href="/transport/fare-guide"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  <CircleDollarSign className="h-4 w-4" />
                  Check fares
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-lg">
              <StatCard label="Buses live now" value={liveCount} loading={statsLoading} />
              <StatCard label="Routes on campus" value={busCount} loading={statsLoading} />
              <div className="col-span-2 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:col-span-1">
                <p className="text-xs font-medium text-gray-500">Related</p>
                <Link
                  href="/parcel"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00A651] hover:underline"
                >
                  <MapPinned className="h-4 w-4" />
                  Parcel delivery
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live services */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900">Live services</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Connected to real-time campus data. Open a module to get started.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LIVE_MODULES.map((mod) => (
              <ModuleCard key={mod.key} mod={mod} />
            ))}
          </div>
        </div>

        {/* Preview modules */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900">More mobility tools</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Interactive previews — explore flows before full launch on your campus.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MORE_MODULES.map((mod) => (
              <ModuleCard key={mod.key} mod={mod} />
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Live bus tracking and parcel delivery use production services. Fare guide, vehicle rent,
          ride sharing, and intercity tickets are preview experiences.
        </p>
      </ContentWrapper>
    </SectionWrapper>
  );
}
