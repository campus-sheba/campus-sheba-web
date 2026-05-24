"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const LOCALES = [
  { value: "en", label: "English", short: "EN" },
  { value: "bn", label: "বাংলা", short: "বাং" },
] as const;

type Props = {
  compact?: boolean;
};

export default function LanguageDropdown({ compact = false }: Props) {
  const t = useTranslations("common.navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onSelect = (newLocale: string) => {
    setOpen(false);
    if (newLocale === locale) return;
    const path = pathname ? pathname.split("/").slice(2).join("/") : "";
    router.push(`/${newLocale}/${path}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="topbar-language-btn"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 ${
          compact ? "h-8 px-2 text-xs" : "h-9 px-2.5 text-sm"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("selectLanguage")}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
        <span className="font-semibold tabular-nums">{current.short}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("selectLanguage")}
          className="absolute right-0 top-full z-[55] mt-1.5 min-w-[9.5rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {LOCALES.map((item) => {
            const selected = item.value === locale;
            return (
              <li key={item.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onSelect(item.value)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-emerald-50 font-semibold text-emerald-800"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-bold text-neutral-400">
                    {item.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
