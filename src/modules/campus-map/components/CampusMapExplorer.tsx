/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Flame, MapPin, Search, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import type { AppState } from "@/types/global";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import {
  fetchCampusMapFeaturedAction,
  fetchCampusMapLocationsAction,
  searchCampusMapLocationsAction,
  submitCampusMapLocationAction,
} from "@/services/campus-map";
import type { CampusMapLocation } from "@/types/campus-map";
import { CAMPUS_LOCATION_TYPES } from "@/types/campus-map";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const BANNER_H = "h-[30vh] min-h-[220px] md:h-[50vh]";
const BANNER_FRAME = "overflow-hidden rounded-2xl border border-gray-100";

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" &&
    state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

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

export default function CampusMapExplorer() {
  const t = useTranslations("common");
  const { state, dispatch } = useAppState();
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const universityId = resolveUniversityId(state);

  const [raw, setRaw] = useState<CampusMapLocation[]>([]);
  const [featured, setFeatured] = useState<CampusMapLocation[]>([]);
  const [hot, setHot] = useState<CampusMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hotOnly, setHotOnly] = useState(false);
  const [sort, setSort] = useState<
    "default" | "mostReviewed" | "highestRated" | "recentlyAdded"
  >("default");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchResults, setSearchResults] = useState<CampusMapLocation[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);
  const [suggestDuplicates, setSuggestDuplicates] = useState<
    CampusMapLocation[]
  >([]);
  const [suggestForm, setSuggestForm] = useState({
    name: "",
    type: "",
    whyFamous: "",
    description: "",
    practicalTips: "",
    bestTimeToVisit: "",
    latitude: "",
    longitude: "",
  });
  const [coverPhoto, setCoverPhoto] = useState<UploadedMediaMeta | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<UploadedMediaMeta[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const MAX_GALLERY = 8;

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebounced(search), 320);
    return () => window.clearTimeout(tmr);
  }, [search]);

  useEffect(() => {
    if (!universityId) {
      setFeatured([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const rows = await fetchCampusMapFeaturedAction(universityId);
      console.log("Featured locations:", rows);
      if (cancelled) return;
      setFeatured(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  useEffect(() => {
    if (!universityId) {
      setHot([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetchCampusMapLocationsAction({
        university: universityId,
        page: 1,
        limit: 5,
        isHot: true,
      });
      if (cancelled) return;
      setHot(res.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, popularOnly, featuredOnly, hotOnly, sort, debounced]);

  useEffect(() => {
    if (!universityId) {
      setRaw([]);
      setLoading(false);
      setTotal(0);
      return;
    }
    if (debounced.trim()) return;
    setRaw([]);
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const res = await fetchCampusMapLocationsAction({
        university: universityId,
        page,
        limit,
        type: typeFilter || undefined,
        isPopular: popularOnly ? true : undefined,
        isFeatured: featuredOnly ? true : undefined,
        isHot: hotOnly ? true : undefined,
        sort,
      });
      if (cancelled) return;
      setRaw(res.data);
      setTotal(res.total ?? 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    universityId,
    typeFilter,
    popularOnly,
    featuredOnly,
    hotOnly,
    sort,
    debounced,
    page,
    limit,
  ]);

  useEffect(() => {
    const q = debounced.trim();
    if (!universityId || !q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void (async () => {
      const rows = await searchCampusMapLocationsAction({
        q,
        university: universityId,
        type: typeFilter || undefined,
        limit: 25,
      });
      if (cancelled) return;
      const filtered = rows.filter((loc) => {
        if (popularOnly && !loc.isPopular) return false;
        if (featuredOnly && !loc.isFeatured) return false;
        if (hotOnly && !loc.isHot) return false;
        return true;
      });
      setSearchResults(filtered);
      setTotal(filtered.length);
      setSearchLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, universityId, typeFilter, popularOnly, featuredOnly, hotOnly]);

  const filtered = useMemo(() => {
    const q = debounced.trim();
    return q ? searchResults : raw;
  }, [debounced, raw, searchResults]);

  const isLoading = debounced.trim() ? searchLoading : loading;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showPagination = !debounced.trim() && totalPages > 1;
  
  const bannerSlides = useMemo(() => {
    const merged = [...featured, ...hot, ...raw];
    const seen = new Set<string>();
    return merged.filter((loc) => {
      if (!loc.coverImage) return false;
      if (seen.has(loc._id)) return false;
      seen.add(loc._id);
      return true;
    });
  }, [featured, hot, raw]);

  const handleSuggestSubmit = useCallback(async () => {
    setSuggestNote(null);
    setSuggestDuplicates([]);
    if (!universityId) {
      setSuggestNote("Select a university before submitting.");
      return;
    }
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      setSuggestNote("Sign in to submit a place.");
      return;
    }
    const name = suggestForm.name.trim();
    const type = suggestForm.type.trim();
    const whyFamous = suggestForm.whyFamous.trim();
    const lat = Number(suggestForm.latitude);
    const lng = Number(suggestForm.longitude);

    if (
      !name ||
      !type ||
      !whyFamous ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setSuggestNote("Please fill the required fields.");
      return;
    }

    const galleryUrls = galleryPhotos.map((p) => p.url);

    const payload = {
      universityId,
      name,
      type,
      whyFamous,
      description: suggestForm.description.trim() || undefined,
      practicalTips: suggestForm.practicalTips.trim() || undefined,
      bestTimeToVisit: suggestForm.bestTimeToVisit.trim() || undefined,
      latitude: lat,
      longitude: lng,
      coverImage: coverPhoto?.url || undefined,
      photoGallery: galleryUrls.length ? galleryUrls : undefined,
    };

    console.log("Submitting suggestion:", payload);

    setSuggestLoading(true);
    const res = await submitCampusMapLocationAction(payload);
    console.log("Submission response:", res);
    if (res.success) {
      setSuggestNote("Thanks! Your suggestion was submitted for review.");
      const raw = res.data as Record<string, unknown> | undefined;
      const inner =
        raw && typeof raw.data === "object" && raw.data !== null
          ? (raw.data as Record<string, unknown>)
          : undefined;
      const duplicates = (inner?.possibleDuplicates ??
        raw?.possibleDuplicates) as CampusMapLocation[] | undefined;
      if (Array.isArray(duplicates)) setSuggestDuplicates(duplicates);
      setSuggestForm({
        name: "",
        type: "",
        whyFamous: "",
        description: "",
        practicalTips: "",
        bestTimeToVisit: "",
        latitude: "",
        longitude: "",
      });
      setCoverPhoto(null);
      setGalleryPhotos([]);
    } else {
      setSuggestNote(res.message ?? "Submission failed.");
    }
    setSuggestLoading(false);
  }, [
    coverPhoto,
    dispatch,
    galleryPhotos,
    state.auth.isAuthenticated,
    suggestForm,
    universityId,
  ]);

  const handleCoverUpload = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setSuggestNote(null);
    setCoverUploading(true);
    const res = await uploadMediaFiles([file], MediaFeatureName.UNIVERSITY);
    setCoverUploading(false);
    if (!res.success || !res.files?.length) {
      setSuggestNote(res.message ?? "Cover image upload failed.");
      return;
    }
    setCoverPhoto(res.files[0]);
  }, []);

  const handleGalleryUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const remain = MAX_GALLERY - galleryPhotos.length;
      if (remain <= 0) return;
      const slice = Array.from(files).slice(0, remain);
      setSuggestNote(null);
      setGalleryUploading(true);
      const res = await uploadMediaFiles(slice, MediaFeatureName.UNIVERSITY);
      setGalleryUploading(false);
      if (!res.success || !res.files?.length) {
        setSuggestNote(res.message ?? "Gallery upload failed.");
        return;
      }
      setGalleryPhotos((prev) => [...prev, ...res.files!].slice(0, MAX_GALLERY));
    },
    [galleryPhotos.length],
  );

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("campusMap.home", "Home"), href: "/" },
            { label: tt("campusMap.title", "Campus map") },
          ]}
        />

        

        {!universityId ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-14 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-base font-semibold text-gray-800">
              {tt("campusMap.pickCampus", "Pick your university")}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {tt(
                "campusMap.pickCampusHint",
                "Select your campus from the top bar to load the live map and places.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <div className={`relative w-full bg-gray-50 ${BANNER_FRAME} ${BANNER_H}`}>
                {bannerSlides.length === 0 ? (
                  <div className="flex h-full min-h-[inherit] items-center justify-center px-4 text-center text-sm text-gray-500">
                    {tt("campusMap.bannerEmpty", "No campus highlights yet.")}
                  </div>
                ) : (
                  <div className={`w-full transition-opacity duration-500 ease-out ${BANNER_H}`}>
                    <Swiper
                      modules={[Autoplay, Pagination, Navigation, EffectFade]}
                      spaceBetween={0}
                      slidesPerView={1}
                      effect={bannerSlides.length > 1 ? "fade" : undefined}
                      autoplay={
                        bannerSlides.length > 1
                          ? { delay: 5000, disableOnInteraction: false }
                          : false
                      }
                      pagination={
                        bannerSlides.length > 1 ? { clickable: true } : false
                      }
                      navigation={bannerSlides.length > 1}
                      className="h-full w-full"
                    >
                      {bannerSlides.map((loc, index) => {
                        const universityShortName =
                          typeof loc.university === "object" && loc.university
                            ? loc.university.shortName
                            : undefined;
                        return (
                          <SwiperSlide key={loc._id}>
                            <Link
                              href={`/campus-map/${loc._id}`}
                              className="relative block h-full w-full"
                            >
                              <Image
                                src={loc.coverImage as string}
                                alt={loc.name ?? "Campus location"}
                                fill
                                sizes="100vw"
                                priority={index === 0}
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                                  {universityShortName ??
                                    tt("campusMap.title", "Campus map")}
                                </p>
                                <h2 className="mt-1 text-xl font-semibold">
                                  {loc.name}
                                </h2>
                                {loc.description ? (
                                  <p className="mt-1 line-clamp-2 text-sm text-white/85">
                                    {loc.description}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                )}
              </div>
            </div>

          

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tt("campusMap.suggest", "Suggest a place")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {tt(
                      "campusMap.suggestHint",
                      "Know a spot that should be on the map? Submit it for review.",
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuggestOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {suggestOpen ? "Hide form" : "Open form"}
                </button>
              </div>

              {suggestOpen ? (
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Name *
                      </label>
                      <input
                        value={suggestForm.name}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                        placeholder="Bottle Tree Garden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Type *
                      </label>
                      <select
                        value={suggestForm.type}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            type: event.target.value,
                          }))
                        }
                        className="mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                      >
                        <option value="">Select type</option>
                        {CAMPUS_LOCATION_TYPES.filter((tpe) => tpe).map(
                          (tpe) => (
                            <option key={tpe} value={tpe}>
                              {tpe.charAt(0).toUpperCase() + tpe.slice(1)}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">
                      Why it is famous *
                    </label>
                    <textarea
                      value={suggestForm.whyFamous}
                      onChange={(event) =>
                        setSuggestForm((prev) => ({
                          ...prev,
                          whyFamous: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                      placeholder="What makes it special?"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Latitude *
                      </label>
                      <input
                        value={suggestForm.latitude}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            latitude: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                        placeholder="23.8801"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Longitude *
                      </label>
                      <input
                        value={suggestForm.longitude}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            longitude: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                        placeholder="90.2682"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">
                      Description
                    </label>
                    <textarea
                      value={suggestForm.description}
                      onChange={(event) =>
                        setSuggestForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                      placeholder="Short overview of the place"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Practical tips
                      </label>
                      <textarea
                        value={suggestForm.practicalTips}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            practicalTips: event.target.value,
                          }))
                        }
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Best time to visit
                      </label>
                      <input
                        value={suggestForm.bestTimeToVisit}
                        onChange={(event) =>
                          setSuggestForm((prev) => ({
                            ...prev,
                            bestTimeToVisit: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
                        placeholder="Evenings (5-9 PM)"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Cover image
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        {coverPhoto ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <Image
                              src={coverPhoto.url}
                              alt="Cover preview"
                              fill
                              sizes="80px"
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(coverPhoto.url)}
                            />
                            <button
                              type="button"
                              onClick={() => setCoverPhoto(null)}
                              aria-label="Remove cover image"
                              className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
                            >
                              ×
                            </button>
                          </div>
                        ) : null}
                        <label className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-[#00A651] hover:text-[#00A651]">
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={coverUploading}
                            onChange={(event) =>
                              void handleCoverUpload(event.target.files)
                            }
                          />
                          {coverUploading
                            ? "Uploading…"
                            : coverPhoto
                              ? "Replace cover"
                              : "Upload cover"}
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">
                        Photo gallery ({galleryPhotos.length}/{MAX_GALLERY})
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {galleryPhotos.map((photo, idx) => (
                          <div
                            key={`${photo.key}-${idx}`}
                            className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <Image
                              src={photo.url}
                              alt="Gallery photo"
                              fill
                              sizes="80px"
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(photo.url)}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryPhotos((prev) =>
                                  prev.filter((_, j) => j !== idx),
                                )
                              }
                              aria-label="Remove photo"
                              className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-[#00A651] hover:text-[#00A651]">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          disabled={
                            galleryUploading ||
                            galleryPhotos.length >= MAX_GALLERY
                          }
                          onChange={(event) =>
                            void handleGalleryUpload(event.target.files)
                          }
                        />
                        {galleryUploading
                          ? "Uploading…"
                          : galleryPhotos.length >= MAX_GALLERY
                            ? "Max photos"
                            : "Add photos"}
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSuggestSubmit}
                      disabled={suggestLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-5 py-2 text-sm font-semibold text-white hover:brightness-105"
                    >
                      {suggestLoading ? "Submitting..." : "Submit suggestion"}
                    </button>
                    {suggestNote ? (
                      <span className="text-xs text-gray-500">
                        {suggestNote}
                      </span>
                    ) : null}
                  </div>

                  {suggestDuplicates.length > 0 ? (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                      <p className="text-xs font-semibold uppercase text-amber-700">
                        Possible duplicates
                      </p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {suggestDuplicates.map((dup) => (
                          <Link
                            key={dup._id}
                            href={`/campus-map/${dup._id}`}
                            className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50"
                          >
                            {dup.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-10">
              <div className="mb-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex flex-col gap-3">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#00A651] focus:bg-white"
                      placeholder={tt("campusMap.searchPh", "Search places…")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      {CAMPUS_LOCATION_TYPES.map((x) => (
                        <option key={x || "all"} value={x}>
                          {x
                            ? x.charAt(0).toUpperCase() + x.slice(1)
                            : tt("campusMap.allTypes", "All types")}
                        </option>
                      ))}
                    </select>

                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={popularOnly}
                        onChange={(e) => setPopularOnly(e.target.checked)}
                        className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                      />
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {tt("campusMap.popular", "Popular only")}
                    </label>
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                      />
                      {tt("campusMap.featuredFilter", "Featured")}
                    </label>
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={hotOnly}
                        onChange={(e) => setHotOnly(e.target.checked)}
                        className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                      />
                      {tt("campusMap.hotFilter", "Hot")}
                    </label>
                    <select
                      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700"
                      value={sort}
                      onChange={(e) =>
                        setSort(
                          e.target.value as
                            | "default"
                            | "mostReviewed"
                            | "highestRated"
                            | "recentlyAdded",
                        )
                      }
                    >
                      <option value="default">Default</option>
                      <option value="mostReviewed">Most reviewed</option>
                      <option value="highestRated">Highest rated</option>
                      <option value="recentlyAdded">Recently added</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    {debounced.trim()
                      ? `${filtered.length} results`
                      : `${total || filtered.length} places`}
                  </p>
                  {debounced.trim() ? (
                    <span className="text-xs text-gray-400">
                      Showing search results
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
                  />
                ))
              ) : filtered.length === 0 ? (
                <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                  {tt("campusMap.empty", "No places match your filters.")}
                </div>
              ) : (
                filtered.map((loc) => (
                  <Link
                    key={loc._id}
                    href={`/campus-map/${loc._id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      {loc.coverImage ? (
                        <Image
                          src={loc.coverImage}
                          alt={loc.name ?? "Campus location"}
                          width={640}
                          height={360}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-gray-100">
                          <MapPin className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {loc.type ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${typeColorClass(loc.type)}`}
                          >
                            {loc.type}
                          </span>
                        ) : null}
                        {loc.isFeatured ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Featured
                          </span>
                        ) : null}
                        {loc.isHot ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            Hot
                          </span>
                        ) : loc.isPopular ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            Popular
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
                          {loc.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="h-4 w-4 text-amber-500" />
                          {typeof loc.rating === "number"
                            ? loc.rating.toFixed(1)
                            : "New"}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {typeof loc.reviewCount === "number"
                          ? `${loc.reviewCount} reviews`
                          : "No reviews yet"}
                      </p>
                      {loc.whyFamous ? (
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {loc.whyFamous}
                        </p>
                      ) : loc.description ? (
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {loc.description}
                        </p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {loc.bestTimeToVisit ? (
                          <span className="rounded-full bg-gray-100 px-2 py-1">
                            {loc.bestTimeToVisit}
                          </span>
                        ) : null}
                        {loc.crowdLevel ? (
                          <span className="rounded-full bg-gray-100 px-2 py-1 capitalize">
                            {loc.crowdLevel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {showPagination ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || isLoading}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages || isLoading}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
