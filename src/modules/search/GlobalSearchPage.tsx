/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/contexts/AppStateContext";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchGlobalSearch } from "@/services/search.public";
import type { SearchCategoryKey } from "@/types/search";
import {
  SEARCH_CATEGORY_ORDER,
  searchCategoryListUrl,
  searchHitHref,
  searchHitTitle,
} from "@/utils/search/searchRoutes";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const CATEGORY_LABEL_KEYS: Record<SearchCategoryKey, string> = {
  books: "searchCatBooks",
  food: "searchCatFood",
  buySell: "searchCatBuySell",
  products: "searchCatProducts",
  lostAndFound: "searchCatLostFound",
  shops: "searchCatShops",
  emergency: "searchCatEmergency",
  campusLocations: "searchCatCampus",
};

export default function GlobalSearchPage() {
  const t = useTranslations("common.navbar");
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const { state } = useAppState();
  const universityId = state.university.selected?._id;

  const [loading, setLoading] = useState(false);
  const [data, setData] =
    useState<Awaited<ReturnType<typeof fetchGlobalSearch>>>(null);

  useEffect(() => {
    if (q.length < 2 || !universityId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const res = await fetchGlobalSearch(q, {
        universityId,
        category: "all",
        limit: 20,
      });
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, universityId]);

  const buckets = data?.results ?? {};

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper padding="md" className="mx-auto max-w-4xl pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: t("searchResultsTitle"), href: "/search" },
          ]}
        />

        <div className="mt-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-neutral-400" />
          <h1 className="text-xl font-bold text-gray-900">
            {q ? t("searchResultsFor", { query: q }) : t("searchResultsTitle")}
          </h1>
        </div>

        {!universityId ? (
          <p className="mt-6 text-sm text-amber-700">
            {t("searchSelectCampus")}
          </p>
        ) : q.length < 2 ? (
          <p className="mt-6 text-sm text-neutral-500">{t("searchMinChars")}</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-neutral-500">{t("searchLoading")}</p>
        ) : !data || data.totalResults === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            {t("searchNoResults")}
          </p>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">
            {t("searchResultCount", { count: data.totalResults })}
          </p>
        )}

        <div className="mt-8 space-y-8">
          {SEARCH_CATEGORY_ORDER.map((catKey) => {
            const bucket = buckets[catKey];
            if (!bucket?.items?.length) return null;
            return (
              <section key={catKey}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {t(CATEGORY_LABEL_KEYS[catKey])}
                    <span className="ml-2 font-normal text-gray-500">
                      ({bucket.total})
                    </span>
                  </h2>
                  <Link
                    href={searchCategoryListUrl(catKey, q)}
                    className="text-xs font-semibold text-[#00A651] hover:underline"
                  >
                    {t("searchSeeAll")}
                  </Link>
                </div>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
                  {bucket.items.map((item) => (
                    <li key={item._id}>
                      <Link
                        href={searchHitHref(item)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(
                                item.thumbnail,
                              )}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {searchHitTitle(item)}
                          </p>
                          {item.author ? (
                            <p className="text-xs text-gray-500">
                              {item.author}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
