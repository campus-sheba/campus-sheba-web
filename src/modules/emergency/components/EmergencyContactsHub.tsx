"use client";

import {
  Ambulance,
  Flame,
  Hospital,
  MapPin,
  MapPinned,
  Phone,
  Search,
  Shield,
  Siren,
  Building2,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchEmergencyContactsByCategoryAction } from "@/services/emergency-contacts";
import type { EmergencyContact, EmergencyContactsByCategory } from "@/types/emergency-contact";
import type { AppState } from "@/types/global";

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

const CATEGORY_ORDER = [
  "Campus Security",
  "Nearby Hospitals",
  "Ambulance Services",
  "Police Stations",
  "Fire Service",
  "Other",
];

function categoryStyle(category: string): { Icon: typeof Shield; bar: string } {
  if (category.includes("Security")) return { Icon: Shield, bar: "from-slate-800 to-slate-950" };
  if (category.includes("Hospital")) return { Icon: Hospital, bar: "from-rose-600 to-red-800" };
  if (category.includes("Ambulance")) return { Icon: Ambulance, bar: "from-orange-500 to-amber-700" };
  if (category.includes("Police")) return { Icon: Building2, bar: "from-indigo-700 to-blue-900" };
  if (category.includes("Fire")) return { Icon: Flame, bar: "from-red-600 to-orange-700" };
  return { Icon: Siren, bar: "from-emerald-600 to-teal-800" };
}

function sortCategoryKeys(data: EmergencyContactsByCategory): string[] {
  const keys = Object.keys(data);
  return keys.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const primary = contact.phoneNumbers?.[0];
  const smsHref =
    contact.hasSMS && primary
      ? `sms:${primary.replace(/\s/g, "")}?body=${encodeURIComponent("Emergency inquiry from Campus Sheba.")}`
      : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900">{contact.name}</h3>
          {contact.description ? (
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{contact.description}</p>
          ) : null}
          {contact.location ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              {contact.location}
            </p>
          ) : null}
        </div>
        <Link
          href={`/emergency-contacts/${contact._id}`}
          className="shrink-0 rounded-full bg-gray-100 p-2 text-gray-500 transition group-hover:bg-[#00A651]/10 group-hover:text-[#00A651]"
          aria-label="Details"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(contact.phoneNumbers ?? []).map((num) => (
          <a
            key={num}
            href={`tel:${num.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A651] px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105"
          >
            <Phone className="h-3.5 w-3.5" />
            {num}
          </a>
        ))}
        {smsHref ? (
          <a
            href={smsHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            <MessageCircle className="h-3.5 w-3.5 text-teal-600" />
            SMS
          </a>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(contact.tags ?? []).slice(0, 5).map((tag) => (
          <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EmergencyContactsHub() {
  const t = useTranslations("common");
  const { state } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = resolveUniversityId(state);

  const [data, setData] = useState<EmergencyContactsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebounced(search), 280);
    return () => window.clearTimeout(tmr);
  }, [search]);

  useEffect(() => {
    if (!universityId) {
      setData({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const res = await fetchEmergencyContactsByCategoryAction(universityId);
      if (cancelled) return;
      if (res.success) setData(res.data);
      else setData({});
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const flatSorted = useMemo(() => {
    const rows: EmergencyContact[] = [];
    for (const list of Object.values(data)) {
      rows.push(...list);
    }
    return rows.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  }, [data]);

  const quickDial = useMemo(() => flatSorted.slice(0, 4), [flatSorted]);

  const searchQ = debounced.trim().toLowerCase();
  const searchHits = useMemo(() => {
    if (!searchQ) return null;
    return flatSorted.filter((c) => {
      const blob = [c.name, c.description, c.location, ...(c.phoneNumbers ?? []), ...(c.tags ?? []), c.category]
        .join(" ")
        .toLowerCase();
      return blob.includes(searchQ);
    });
  }, [flatSorted, searchQ]);

  const categoryKeys = useMemo(() => sortCategoryKeys(data), [data]);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: tt("emergency.home", "Home"), href: "/" },
            { label: tt("emergency.title", "Emergency contacts") },
          ]}
        />

        <div className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-red-900 px-6 py-10 text-white shadow-xl md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/25">
              <Siren className="h-4 w-4" />
              {tt("emergency.badge", "Safety first")}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              {tt("emergency.title", "Emergency contacts")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
              {tt(
                "emergency.subtitle",
                "Security, hospitals, ambulance, police, and fire — curated for your campus. Save this page offline.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/blood-bank"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-md hover:bg-red-50"
              >
                {tt("emergency.linkBlood", "Blood bank")}
              </Link>
              <Link
                href="/campus-map"
                className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                {tt("emergency.linkMap", "Campus map")}
              </Link>
            </div>
          </div>
        </div>

        {!universityId ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-14 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-base font-semibold text-gray-800">
              {tt("emergency.pickCampus", "Select your university")}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {tt("emergency.pickCampusHint", "We load the right numbers for your campus automatically.")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <FeatureHeroAds universityId={universityId} />
            </div>

            <div className="mt-10">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm outline-none ring-1 ring-black/[0.03] transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
                  placeholder={tt("emergency.searchPh", "Search by name, tag, or phone…")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : flatSorted.length === 0 ? (
              <p className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                {tt("emergency.empty", "No emergency contacts are published for this campus yet.")}
              </p>
            ) : (
              <>
                {!searchHits && quickDial.length > 0 ? (
                  <div className="mt-10">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      {tt("emergency.quickDial", "Quick dial")}
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {quickDial.map((c) => {
                        const phone = c.phoneNumbers?.[0];
                        return (
                          <a
                            key={c._id}
                            href={phone ? `tel:${phone.replace(/\s/g, "")}` : undefined}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm ring-1 ring-black/[0.03] transition hover:border-[#00A651]/40 hover:shadow-md"
                          >
                            <span className="text-xs font-semibold text-[#00A651]">{c.category}</span>
                            <span className="mt-1 line-clamp-2 font-bold text-gray-900">{c.name}</span>
                            {phone ? (
                              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-gray-700">
                                <Phone className="h-4 w-4 text-[#00A651]" />
                                {phone}
                              </span>
                            ) : null}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {searchHits ? (
                  <div className="mt-10 grid gap-4 md:grid-cols-2">
                    {searchHits.map((c) => (
                      <ContactCard key={c._id} contact={c} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-10 space-y-12">
                    {categoryKeys.map((cat) => {
                      const items = data[cat];
                      if (!items?.length) return null;
                      const { Icon, bar } = categoryStyle(cat);
                      return (
                        <section key={cat}>
                          <div
                            className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${bar} px-4 py-3 text-white shadow-md`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold">{cat}</h2>
                              <p className="text-xs text-white/80">
                                {items.length} {tt("emergency.contacts", "contacts")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {items.map((c) => (
                              <ContactCard key={c._id} contact={c} />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}

                <div className="mt-14 flex flex-col gap-4 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A651] text-white shadow-lg shadow-emerald-600/25">
                      <MapPinned className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {tt("emergency.campusOverview", "Know where you are going")}
                      </h3>
                      <p className="mt-1 max-w-md text-sm text-gray-600">
                        {tt(
                          "emergency.campusOverviewSub",
                          "Use the live campus map to find halls, gates, medical points, and hangouts before an emergency.",
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/campus-map"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#00A651] px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-105"
                  >
                    {tt("emergency.openFullMap", "Open campus map")} →
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
