"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X, Flame, Leaf } from "lucide-react";

const SPICY_LEVELS = ["Mild", "Medium", "Hot", "Extra Hot"] as const;

export default function FoodFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key);
      update(key, current === value ? null : value);
    },
    [searchParams, update],
  );

  const clear = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const search = searchParams.get("search") ?? "";
  const spicyLevel = searchParams.get("spicyLevel") ?? "";
  const isVegetarian = searchParams.get("isVegetarian") === "true";
  const isVegan = searchParams.get("isVegan") === "true";
  const hasFilters = !!(search || spicyLevel || isVegetarian || isVegan);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          placeholder="Search food…"
          onChange={(e) => update("search", e.target.value || null)}
          className="w-full rounded-full border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20"
        />
      </div>

      <button
        type="button"
        onClick={() => toggle("isVegetarian", "true")}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
          isVegetarian
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700"
        }`}
      >
        <Leaf className="h-3.5 w-3.5" />
        Veg
      </button>

      <button
        type="button"
        onClick={() => toggle("isVegan", "true")}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
          isVegan
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
        }`}
      >
        <Leaf className="h-3.5 w-3.5" />
        Vegan
      </button>

      {SPICY_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => toggle("spicyLevel", level)}
          className={`flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
            spicyLevel === level
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:text-orange-700"
          }`}
        >
          <Flame className="h-3 w-3" />
          {level}
        </button>
      ))}

      {hasFilters ? (
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
