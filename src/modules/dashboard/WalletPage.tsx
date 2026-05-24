"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getWalletAction,
  getWalletTransactionsAction,
  getWalletTopupsAction,
  getWalletWithdrawalsAction,
  initiateWalletTopupAction,
  requestWalletWithdrawalAction,
} from "@/services/wallet";
import {
  WithdrawalMethod,
  type RequestWithdrawalPayload,
  type UserWallet,
  type WalletTransaction,
  type WalletTopupRecord,
  type WalletWithdrawalRequest,
} from "@/types/wallet";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, Wallet } from "lucide-react";

const ACCENT = "#E30B12";

export default function WalletPage() {
  const t = useTranslations("common.wallet");

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topups, setTopups] = useState<WalletTopupRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawForm, setWithdrawForm] = useState<RequestWithdrawalPayload>({
    amount: 0,
    method: WithdrawalMethod.MOBILE_BANKING,
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    routingNumber: "",
    mobileNumber: "",
  });

  const loadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [wRes, txRes, tpRes, wdRes] = await Promise.all([
        getWalletAction(),
        getWalletTransactionsAction(),
        getWalletTopupsAction({ page: 1, limit: 20 }),
        getWalletWithdrawalsAction({ page: 1, limit: 20 }),
      ]);

      if (!wRes.success || !wRes.data) {
        setError(wRes.message ?? t("loadFailed"));
        setWallet(null);
      } else {
        setWallet(wRes.data);
      }

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      } else {
        setTransactions([]);
      }

      if (tpRes.success) setTopups(tpRes.data);
      else setTopups([]);

      if (wdRes.success) setWithdrawals(wdRes.data);
      else setWithdrawals([]);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function handleTopup(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(topupAmount);
    if (!Number.isFinite(amt) || amt < 10) return;
    startTransition(async () => {
      const res = await initiateWalletTopupAction(amt);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
      setError(!res.success ? res.message : t("topupFailed"));
    });
  }

  function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestWalletWithdrawalAction({
        ...withdrawForm,
        amount: Number(withdrawForm.amount),
      });
      if (res.success) {
        setError(null);
        await loadAll();
        setWithdrawForm((prev) => ({
          ...prev,
          amount: 0,
          accountName: "",
          accountNumber: "",
          bankName: "",
          branchName: "",
          routingNumber: "",
          mobileNumber: "",
        }));
      } else {
        setError(res.message ?? t("withdrawFailed"));
      }
    });
  }

  if (loading && !wallet) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-[#E30B12]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E30B12]/10">
            <Wallet className="h-6 w-6 text-[#E30B12]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-sm text-gray-500">{t("subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {wallet ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("available")}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: ACCENT }}>
              ৳{wallet.balance?.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("escrow")}</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">৳{(wallet.escrowBalance ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("totalEarnings")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">৳{(wallet.totalEarnings ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("totalWithdrawn")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">৳{(wallet.totalWithdrawn ?? 0).toLocaleString()}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">{t("addMoney")}</h2>
          <p className="mt-1 text-xs text-gray-500">{t("topupMin")}</p>
          <form onSubmit={handleTopup} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-gray-600">{t("amount")}</label>
              <input
                type="number"
                min={10}
                step={1}
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/20"
                placeholder="100"
                required
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              uppercase={false}
              disabled={isPending}
              className="!border-0 !bg-[#E30B12] !text-white hover:!brightness-110"
            >
              {isPending ? t("processing") : t("continuePay")}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">{t("requestWithdrawal")}</h2>
          <p className="mt-1 text-xs text-gray-500">{t("withdrawMin")}</p>
          <form onSubmit={handleWithdraw} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{t("amount")}</label>
                <input
                  type="number"
                  min={50}
                  required
                  value={withdrawForm.amount || ""}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">{t("method")}</label>
                <select
                  value={withdrawForm.method}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, method: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12]"
                >
                  <option value={WithdrawalMethod.MOBILE_BANKING}>{t("mobileBanking")}</option>
                  <option value={WithdrawalMethod.BANK_TRANSFER}>{t("bankTransfer")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder={t("accountName")}
                value={withdrawForm.accountName ?? ""}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, accountName: e.target.value }))}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder={t("accountNumber")}
                value={withdrawForm.accountNumber ?? ""}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, accountNumber: e.target.value }))}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder={t("bankName")}
                value={withdrawForm.bankName ?? ""}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, bankName: e.target.value }))}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder={t("mobileNumber")}
                value={withdrawForm.mobileNumber ?? ""}
                onChange={(e) => setWithdrawForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              uppercase={false}
              disabled={isPending}
              className="w-full border-[#E30B12] text-[#E30B12] hover:bg-[#E30B12]/5"
            >
              {isPending ? t("processing") : t("submitWithdrawal")}
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">{t("transactions")}</h2>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">{t("noTransactions")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2">{t("type")}</th>
                  <th className="px-5 py-2">{t("reason")}</th>
                  <th className="px-5 py-2 text-right">{t("amount")}</th>
                  <th className="px-5 py-2">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {tx.type === "Credit" ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{tx.reason}</td>
                    <td className="px-5 py-3 text-right font-semibold">৳{tx.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-bold text-gray-900">{t("topupHistory")}</h2>
          </div>
          {topups.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-500">{t("noTopups")}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topups.map((row) => (
                <li key={row._id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-medium text-gray-900">৳{row.amount?.toLocaleString()}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{row.status}</span>
                  <span className="text-xs text-gray-500">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-bold text-gray-900">{t("withdrawalRequests")}</h2>
          </div>
          {withdrawals.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-500">{t("noWithdrawals")}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {withdrawals.map((row) => (
                <li key={row._id} className="px-5 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900">৳{row.amount?.toLocaleString()}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">{row.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{row.method}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
