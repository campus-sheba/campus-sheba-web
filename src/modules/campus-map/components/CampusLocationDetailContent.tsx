/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Accessibility,
  CalendarClock,
  Compass,
  Flame,
  Heart,
  Lightbulb,
  ListChecks,
  MapPin,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import Slider from "@/components/slider/Slider";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import {
  addCampusMapFavouriteAction,
  removeCampusMapFavouriteAction,
  reportCampusMapLocationAction,
} from "@/services/campus-map";
import {
  fetchUniversityLocationReviewsAction,
  submitUniversityLocationReviewAction,
} from "@/services/reviews";
import type { CampusMapLocation } from "@/types/campus-map";
import type { ReviewItem } from "@/types/reviews";

const CampusMapLeaflet = dynamic(() => import("./CampusMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
  ),
});

const HERO_H = "h-[36vh] min-h-[260px] md:h-[52vh]";

type Props = {
  location: CampusMapLocation | null;
  loading: boolean;
  error: string | null;
};

function typeColorClass(type?: string): string {
  const t = (type ?? "").toLowerCase();
  const m: Record<string, string> = {
    academic: "bg-blue-100 text-blue-800",
    hall: "bg-violet-100 text-violet-800",
    food: "bg-orange-100 text-orange-800",
    transport: "bg-slate-200 text-slate-800",
    hangout: "bg-pink-100 text-pink-800",
    lake: "bg-cyan-100 text-cyan-800",
    cultural: "bg-amber-100 text-amber-900",
    sports: "bg-rose-100 text-rose-800",
    religious: "bg-indigo-100 text-indigo-800",
    administrative: "bg-stone-100 text-stone-800",
    other: "bg-emerald-100 text-emerald-800",
  };
  return m[t] ?? "bg-emerald-100 text-emerald-800";
}

function hasValidCoords(
  loc: CampusMapLocation,
): loc is CampusMapLocation & { latitude: number; longitude: number } {
  return (
    typeof loc.latitude === "number" &&
    typeof loc.longitude === "number" &&
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude)
  );
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CampusLocationDetailContent({
  location,
  loading,
  error,
}: Props) {
  const { state, dispatch } = useAppState();
  const isAuthed = state.auth.isAuthenticated;

  const [favourited, setFavourited] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportNote, setReportNote] = useState<string | null>(null);

  useEffect(() => {
    setFavourited(Boolean(location?.isFavourited));
  }, [location?._id, location?.isFavourited]);

  useEffect(() => {
    const id = location?._id;
    if (!id) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    setReviewsLoading(true);
    void (async () => {
      const res = await fetchUniversityLocationReviewsAction(id, 1, 20);
      if (cancelled) return;
      setReviews(res.data);
      setReviewsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [location?._id]);

  const handleFavourite = useCallback(async () => {
    if (!location?._id) return;
    if (!isAuthed) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    setFavLoading(true);
    const next = !favourited;
    setFavourited(next);
    const res = next
      ? await addCampusMapFavouriteAction(location._id)
      : await removeCampusMapFavouriteAction(location._id);
    if (!res.success) setFavourited(!next);
    setFavLoading(false);
  }, [dispatch, favourited, isAuthed, location]);

  const handleReviewSubmit = useCallback(async () => {
    setReviewNote(null);
    if (!location?._id) return;
    if (!isAuthed) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    const rating = Math.min(5, Math.max(1, Math.round(reviewRating)));
    setReviewSubmitting(true);
    const res = await submitUniversityLocationReviewAction(
      location._id,
      rating,
      reviewComment.trim() || undefined,
    );
    if (res.success) {
      setReviewComment("");
      setReviewRating(5);
      setReviewNote("Thanks! Your review was submitted.");
      const refreshed = await fetchUniversityLocationReviewsAction(
        location._id,
        1,
        20,
      );
      setReviews(refreshed.data);
    } else {
      setReviewNote(res.message ?? "Could not submit review.");
    }
    setReviewSubmitting(false);
  }, [dispatch, isAuthed, location, reviewComment, reviewRating]);

  const handleReportSubmit = useCallback(async () => {
    setReportNote(null);
    if (!location?._id) return;
    if (!isAuthed) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    const reason = reportReason.trim();
    if (!reason) {
      setReportNote("Please add a reason before reporting.");
      return;
    }
    setReportSubmitting(true);
    const res = await reportCampusMapLocationAction(location._id, reason);
    console.log("res from report", res);
    if (res.success) {
      setReportReason("");
      setReportOpen(false);
      setReportNote("Thanks! The report was sent to admins.");
    } else {
      setReportNote(res.message ?? "Could not submit report.");
    }
    setReportSubmitting(false);
  }, [dispatch, isAuthed, location, reportReason]);

  const galleryImages = useMemo(() => {
    if (!location) return [] as string[];
    const seen = new Set<string>();
    const out: string[] = [];
    if (location.coverImage) {
      seen.add(location.coverImage);
      out.push(location.coverImage);
    }
    for (const url of location.photoGallery ?? []) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
    return out;
  }, [location]);

  const uniName =
    location && typeof location.university === "object" && location.university
      ? location.university.name
      : null;
  const uniShortName =
    location && typeof location.university === "object" && location.university
      ? location.university.shortName
      : null;

  const mapPoints = location && hasValidCoords(location) ? [location] : [];

  const tipLines = (location?.practicalTips ?? "")
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="md"
          className="pb-16 pt-2"
        >
          <div className={`mt-4 w-full animate-pulse rounded-2xl bg-gray-100 ${HERO_H}`} />
          <div className="mt-6 grid gap-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </ContentWrapper>
      </SectionWrapper>
    );
  }

  if (error || !location) {
    return (
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="md"
          className="pb-16 pt-2"
        >
          <AppBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Campus map", href: "/campus-map" },
              { label: "Not found" },
            ]}
          />
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              {error ?? "Place not found."}
            </p>
            <Link
              href="/campus-map"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-2 text-sm font-semibold text-white"
            >
              Back to campus map
            </Link>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Campus map", href: "/campus-map" },
            { label: location.name ?? "Place" },
          ]}
        />

        <div className={`relative mt-4 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 ${HERO_H}`}>
          {galleryImages.length > 0 ? (
            <Slider
              className="h-full"
              containerClassName="h-full"
              slidesPerView={1}
              spaceBetween={0}
              navigation={galleryImages.length > 1}
              pagination={galleryImages.length > 1 ? { clickable: true } : false}
              autoplay={
                galleryImages.length > 1
                  ? { delay: 5000, disableOnInteraction: false }
                  : false
              }
              showNavigationButtons={false}
            >
              {galleryImages.map((url, index) => (
                <div key={`${url}-${index}`} className="relative h-full w-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={url}
                      alt={location.name ?? "Campus location"}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <MapPin className="h-10 w-10" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              {location.type ? (
                <span
                  className={`pointer-events-auto rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${typeColorClass(location.type)}`}
                >
                  {location.type}
                </span>
              ) : null}
              {location.isFeatured ? (
                <span className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-emerald-100/95 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              ) : null}
              {location.isHot ? (
                <span className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-rose-100/95 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                  <Flame className="h-3 w-3" /> Hot
                </span>
              ) : null}
              {location.isPopular ? (
                <span className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-amber-100/95 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                  <Star className="h-3 w-3" /> Popular
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold drop-shadow-sm md:text-3xl">
              {location.name}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {uniName ?? uniShortName ?? "Campus map"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    {typeof location.rating === "number"
                      ? location.rating.toFixed(1)
                      : "New"}
                  </div>
                  <p className="text-xs text-gray-500">
                    {typeof location.reviewCount === "number"
                      ? `${location.reviewCount} review${location.reviewCount === 1 ? "" : "s"}`
                      : "No reviews yet"}
                  </p>
                  {location.crowdLevel ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                      <Users className="h-3.5 w-3.5" /> {location.crowdLevel}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleFavourite}
                  disabled={favLoading}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    favourited
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${favourited ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  {favourited ? "Loved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Report
                </button>
              </div>

              {location.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {location.description}
                </p>
              ) : null}

              {reportOpen ? (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <p className="text-xs font-semibold uppercase text-amber-700">
                    Report incorrect information
                  </p>
                  <textarea
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                    placeholder="Tell us what is wrong with this place"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReportSubmit}
                      disabled={reportSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
                    >
                      {reportSubmitting ? "Sending…" : "Send report"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportOpen(false)}
                      className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    {reportNote ? (
                      <span className="text-xs text-gray-500">{reportNote}</span>
                    ) : null}
                  </div>
                </div>
              ) : reportNote ? (
                <p className="mt-3 text-xs text-gray-500">{reportNote}</p>
              ) : null}
            </div>

            {location.whyFamous ? (
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/70 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base font-semibold text-gray-900">
                    Why it&apos;s famous
                  </h2>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {location.whyFamous}
                </p>
              </div>
            ) : null}

            {tipLines.length > 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-[#00A651]" />
                  <h2 className="text-base font-semibold text-gray-900">
                    Practical tips
                  </h2>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {tipLines.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00A651]" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {mapPoints.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <CampusMapLeaflet
                  locations={mapPoints}
                  selectedId={location._id}
                  onSelect={() => {}}
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                No map coordinates are available for this place yet.
              </p>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">
                  Reviews
                </h2>
                <span className="text-xs text-gray-500">
                  {reviews.length} loaded
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Leave a review
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      aria-label={`Rate ${n}`}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          n <= reviewRating
                            ? "fill-amber-400 text-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                  placeholder="Share your experience…"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting…" : "Submit review"}
                  </button>
                  {reviewNote ? (
                    <span className="text-xs text-gray-500">{reviewNote}</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {reviewsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-xl bg-gray-50"
                    />
                  ))
                ) : reviews.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                    No reviews yet. Be the first to share your experience.
                  </p>
                ) : (
                  reviews.map((review) => {
                    const user =
                      typeof review.user === "object" && review.user
                        ? review.user
                        : null;
                    return (
                      <div
                        key={review._id}
                        className="rounded-xl border border-gray-100 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              {user?.photo ? (
                                <Image
                                  src={user.photo}
                                  alt={user.name ?? "Reviewer"}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 object-cover"
                                />
                              ) : (
                                (user?.name ?? "?").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {user?.name ?? "Anonymous"}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                            {review.rating.toFixed(1)}
                          </div>
                        </div>
                        {review.comment ? (
                          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                            {review.comment}
                          </p>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Quick info
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {location.bestTimeToVisit ? (
                  <div className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 h-4 w-4 text-[#00A651]" />
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Best time to visit
                      </dt>
                      <dd className="text-gray-600">
                        {location.bestTimeToVisit}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {location.crowdLevel ? (
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-[#00A651]" />
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Crowd level
                      </dt>
                      <dd className="capitalize text-gray-600">
                        {location.crowdLevel}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {hasValidCoords(location) ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#00A651]" />
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Coordinates
                      </dt>
                      <dd className="text-gray-600">
                        {location.latitude.toFixed(5)},{" "}
                        {location.longitude.toFixed(5)}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {location.updatedAt ? (
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 text-[#00A651]" />
                    <div>
                      <dt className="font-semibold text-gray-900">
                        Last updated
                      </dt>
                      <dd className="text-gray-600">
                        {formatDate(location.updatedAt)}
                      </dd>
                    </div>
                  </div>
                ) : null}
              </dl>

              {hasValidCoords(location) ? (
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                >
                  <Compass className="h-4 w-4" />
                  Navigate in Google Maps
                </a>
              ) : location.name ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.name} ${uniName ?? ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <MapPin className="h-4 w-4 text-[#00A651]" />
                  Search on Maps
                </a>
              ) : null}
            </div>

            {location.accessibility ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-[#00A651]" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Accessibility
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Wheelchair friendly</span>
                    <span className="font-semibold">
                      {location.accessibility.wheelchair ? "Yes" : "No"}
                    </span>
                  </li>
                  {location.accessibility.lighting ? (
                    <li className="flex items-center justify-between">
                      <span className="text-gray-500">Lighting</span>
                      <span className="font-semibold capitalize">
                        {location.accessibility.lighting}
                      </span>
                    </li>
                  ) : null}
                  {location.accessibility.notes ? (
                    <li className="text-gray-600">
                      {location.accessibility.notes}
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
