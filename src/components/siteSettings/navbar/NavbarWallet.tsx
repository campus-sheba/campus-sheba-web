"use client";

import { Eye, EyeOff, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  balance: number | null;
  loading: boolean;
  visible: boolean;
  onToggleVisible: () => void;
};

export default function NavbarWallet({
  balance,
  loading,
  visible,
  onToggleVisible,
}: Props) {
  const t = useTranslations("common.navbar");

  const balanceLabel = loading
    ? "…"
    : visible
      ? balance != null
        ? `৳${balance.toLocaleString()}`
        : "—"
      : "৳ ••••";

  return (
    <div
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-green-DEFAULT/20 bg-brand-green-50 px-3 text-brand-green-700"
      title={t("wallet")}
    >
      <Wallet className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="text-sm font-semibold tabular-nums tracking-tight">
        {balanceLabel}
      </span>
      <button
        type="button"
        onClick={onToggleVisible}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-brand-green-700/70 transition-colors hover:bg-brand-green-DEFAULT/10 hover:text-brand-green-700"
        aria-label={visible ? t("hideWalletBalance") : t("showWalletBalance")}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
