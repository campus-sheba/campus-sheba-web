"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getCoinBalanceAction,
  getCoinConfigAction,
  getCoinTransactionsAction,
  redeemCoinsAction,
} from "@/services/points";
import type { CoinBalance, CoinConfig, CoinTransaction } from "@/types/points";
import { ArrowDownLeft, ArrowUpRight, Coins, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

const ACCENT = "#E30B12";

const REASON_LABELS: Record<string, string> = {
  REFERRAL_SIGNUP: "Referral Signup Bonus",
  REFERRAL_FIRST_ORDER: "Referral First Order",
  FIRST_ORDER_BONUS: "First Order Bonus",
  ADMIN_ADJUSTMENT: "Admin Adjustment",
  WALLET_REDEEM: "Redeemed to Wallet",
};

export default function CampusCoinsPage() {
  const [balance, setBalance] = useState<CoinBalance | null>(null);
  const [config, setConfig] = useState<CoinConfig | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);
  const [redeemCoins, setRedeemCoins] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, cfgRes, txRes] = await Promise.all([
        getCoinBalanceAction(),
        getCoinConfigAction(),
        getCoinTransactionsAction({ page: 1, limit: 30 }),
      ]);

      if (balRes.success) setBalance(balRes.data);
      else setError(balRes.message);

      if (cfgRes.success) setConfig(cfgRes.data);

      if (txRes.success && txRes.data) setTransactions(txRes.data.transactions);
      else setTransactions([]);
    } catch {
      setError("Failed to load Campus Coins data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(redeemCoins);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setRedeemMsg(null);
    startTransition(async () => {
      const res = await redeemCoinsAction(amount);
      if (res.success && res.data) {
        setRedeemMsg(
          `Redeemed ${res.data.coinsSpent} coins → ৳${res.data.bdtCredited} added to your wallet.`
        );
        setRedeemCoins("");
        await loadAll();
      } else {
        setRedeemMsg(res.success ? "Redemption failed." : res.message);
      }
    });
  }

  if (loading && !balance) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-[#E30B12]" />
      </div>
    );
  }

  const minRedeem = config?.minRedeemCoins ?? 0;
  const rate = config?.coinsPerBDT ?? 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Coins className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Campus Coins</h1>
            <p className="text-sm text-gray-500">Earn coins, redeem for wallet BDT.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {/* Balance cards */}
      {balance ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Balance</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{balance.balance.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-amber-600/70">coins</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Earned</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{balance.totalEarned.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-gray-400">coins (lifetime)</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Redeemed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{balance.totalSpent.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-gray-400">coins (lifetime)</p>
          </div>
        </div>
      ) : null}

      {/* Config banner */}
      {config?.isEnabled ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">{rate} coins = ৳1 BDT</span>
          {" · "}Minimum redeem: <span className="font-semibold">{minRedeem} coins</span>
          {config.maxRedeemCoinsPerDay
            ? ` · Daily limit: ${config.maxRedeemCoinsPerDay.toLocaleString()} coins`
            : null}
        </div>
      ) : config && !config.isEnabled ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Campus Coins system is currently disabled.
        </div>
      ) : null}

      {/* Redeem form */}
      {config?.isEnabled ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">Redeem Coins</h2>
          <p className="mt-1 text-xs text-gray-500">
            Convert your coins to BDT — credited to your wallet instantly.
          </p>
          <form onSubmit={handleRedeem} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-xs font-medium text-gray-600">Coins to redeem</label>
              <input
                type="number"
                min={minRedeem || 1}
                step={1}
                value={redeemCoins}
                onChange={(e) => setRedeemCoins(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/20"
                placeholder={String(minRedeem || 500)}
                required
              />
            </div>
            {redeemCoins && Number(redeemCoins) > 0 ? (
              <p className="text-xs text-gray-500 self-end pb-2.5">
                = ৳{(Number(redeemCoins) / rate).toFixed(2)}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="secondary"
              uppercase={false}
              disabled={isPending}
              className="!border-0 !bg-amber-500 !text-white hover:!brightness-110"
            >
              {isPending ? "Redeeming..." : "Redeem"}
            </Button>
          </form>
          {redeemMsg ? (
            <p className={`mt-3 text-sm ${redeemMsg.includes("Redeemed") ? "text-green-700" : "text-red-600"}`}>
              {redeemMsg}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Transaction history */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2">Type</th>
                  <th className="px-5 py-2">Reason</th>
                  <th className="px-5 py-2 text-right">Amount</th>
                  <th className="px-5 py-2 text-right">Balance</th>
                  <th className="px-5 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {tx.type === "EARN" ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={tx.type === "EARN" ? "text-green-700" : "text-red-600"}>
                          {tx.type === "EARN" ? "+Earn" : "-Spend"}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {REASON_LABELS[tx.reason] ?? tx.reason}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      <span className={tx.type === "EARN" ? "text-green-700" : "text-red-600"}>
                        {tx.type === "EARN" ? "+" : "-"}{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500">{tx.balanceAfter.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
