"use client";

import { MapPin, Package, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";

export default function ParcelLanding() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = state.university.selected?._id;

  const onBook = () => {
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    router.push("/my-parcels/new");
  };

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: tt("parcelLanding.home", "Home"), href: "/" },
            { label: tt("parcelLanding.title", "Parcel delivery") },
          ]}
        />

        {!universityId ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("parcelLanding.chooseCampus", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt("parcelLanding.chooseCampusHint", "Use the campus selector for localized banners and delivery.")}
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <FeatureHeroAds universityId={universityId} placement="parcel" />
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-gradient-to-br from-violet-50 to-white p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Package className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {tt("parcelLanding.heroTitle", "Campus parcel delivery")}
              </h1>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                {tt(
                  "parcelLanding.heroSub",
                  "Send packages between halls, departments, and landmarks inside your university. Track status from pickup to delivery.",
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onBook}
                  className="inline-flex items-center rounded-lg bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white active:brightness-95"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {tt("parcelLanding.book", "Book a parcel")}
                </button>
                <Link
                  href="/my-parcels"
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {tt("parcelLanding.myParcels", "My parcels")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: tt("parcelLanding.step1", "Pick locations"),
              body: tt("parcelLanding.step1Sub", "Choose pickup and drop-off points on campus."),
            },
            {
              title: tt("parcelLanding.step2", "Add details"),
              body: tt("parcelLanding.step2Sub", "Size, weight, and recipient contact."),
            },
            {
              title: tt("parcelLanding.step3", "Track delivery"),
              body: tt("parcelLanding.step3Sub", "Follow status until it is delivered."),
            },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{s.body}</p>
            </div>
          ))}
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
