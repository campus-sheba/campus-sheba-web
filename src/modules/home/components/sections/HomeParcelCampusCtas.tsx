"use client";

import { ArrowRight, MapPinned, Package, Plus, Siren } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";

export function HomeParcelCampusCtas() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const universityId = state.university.selected?._id;

  const onBookParcel = () => {
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    router.push("/my-parcels/new");
  };

  return (
    <section id="home-parcel-campus" aria-labelledby="home-parcel-campus-heading">
      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-white py-12 md:py-16">
        <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="px-4 md:px-8">
          <h2 id="home-parcel-campus-heading" className="sr-only">
            {tt("homeRails.parcelCampusSr", "Parcel delivery, campus map, and emergency contacts")}
          </h2>

          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-8 shadow-sm md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Package className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                  {tt("homeRails.parcelKicker", "Parcel Sheba")}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                  {tt("homeRails.parcelTitle", "Send a parcel across campus")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                  {tt(
                    "homeRails.parcelBody",
                    "Book pickup and drop-off between halls and landmarks. Track status from handover to delivery — same account as the rest of Campus Sheba.",
                  )}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onBookParcel}
                    className="inline-flex items-center rounded-xl bg-[#00A651] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/10 hover:brightness-105"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    {tt("homeRails.parcelCtaPrimary", "Request a parcel")}
                  </button>
                  <Link
                    href="/parcel"
                    className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
                  >
                    {tt("homeRails.parcelCtaSecondary", "How it works")}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
                {!universityId ? (
                  <p className="mt-4 text-xs text-amber-800">
                    {tt("homeRails.parcelCampusHint", "Tip: select your university for localized routing and banners.")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Link
              href="/campus-map"
              className="group flex h-full flex-col rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-white p-6 shadow-sm transition hover:border-cyan-200 hover:shadow-md md:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                <MapPinned className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 md:text-xl">
                {tt("homeRails.mapCtaTitle", "Interactive campus map")}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                {tt(
                  "homeRails.mapCtaBody",
                  "Halls, departments, food zones, and landmarks — explore what matters for your timetable and routes.",
                )}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-bold text-[#00A651] group-hover:underline">
                {tt("homeRails.mapCtaLink", "Open campus map")}
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/emergency-contacts"
              className="group flex h-full flex-col rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/70 to-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md md:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <Siren className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 md:text-xl">
                {tt("homeRails.emergencyCtaTitle", "Emergency contacts")}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                {tt(
                  "homeRails.emergencyCtaBody",
                  "Security desks, hospitals, ambulance, police, and fire — verified numbers for your institution.",
                )}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-bold text-[#00A651] group-hover:underline">
                {tt("homeRails.emergencyCtaLink", "View emergency directory")}
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
