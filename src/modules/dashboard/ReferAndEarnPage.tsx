"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMyReferralCodeAction,
  getMyReferralsAction,
  getReferralLeaderboardAction,
} from "@/services/referral";
import type {
  LeaderboardEntry,
  ReferralCode,
  ReferralEntry,
  ReferralStatus,
} from "@/types/referral";
import { CheckCircle2, Clock, Copy, Loader2, RefreshCw, Trophy, Users } from "lucide-react";
import Image from "next/image";

type Tab = "referrals" | "leaderboard";

export default function ReferAndEarnPage() {
  const [codeData, setCodeData] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "">("");
  const [activeTab, setActiveTab] = useState<Tab>("referrals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [codeRes, refRes, lbRes] = await Promise.all([
        getMyReferralCodeAction(),
        getMyReferralsAction({ page: 1, limit: 50 }),
        getReferralLeaderboardAction(),
      ]);

      if (codeRes.success) setCodeData(codeRes.data);
      else setError(codeRes.message);

      if (refRes.success && refRes.data) setReferrals(refRes.data.referrals);
      else setReferrals([]);

      if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data.data);
      else setLeaderboard([]);
    } catch {
      setError("Failed to load referral data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  function handleCopy() {
    if (!codeData?.referralCode) return;
    void navigator.clipboard.writeText(codeData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = statusFilter
    ? referrals.filter((r) => r.status === statusFilter)
    : referrals;

  if (loading && !codeData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651]/10">
            <Users className="h-6 w-6 text-[#00A651]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Refer &amp; Earn</h1>
            <p className="text-sm text-gray-500">Share your code. Earn Campus Coins when friends order.</p>
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

      {/* Referral code card */}
      {codeData ? (
        <div className="rounded-2xl border border-[#00A651]/20 bg-gradient-to-br from-[#00A651]/5 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00A651]">Your Referral Code</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-bold tracking-widest text-gray-900">{codeData.referralCode}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-gray-100 px-3 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-gray-900">{codeData.totalReferrals}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 px-3 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-[#00A651]">{codeData.rewardedReferrals}</p>
              <p className="text-xs text-gray-500">Rewarded</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 px-3 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-amber-600">{codeData.pendingReferrals}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {(["referrals", "leaderboard"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "referrals" ? "My Referrals" : "Leaderboard"}
          </button>
        ))}
      </div>

      {activeTab === "referrals" ? (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {(["", "PENDING", "REWARDED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-[#00A651] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "" ? "All" : s === "PENDING" ? "Pending" : "Rewarded"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">No referrals yet. Share your code to start earning!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((entry, i) => (
                <ReferralCard key={i} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900">Top Referrers</h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No leaderboard data yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {leaderboard.map((entry, rank) => (
                <li key={rank} className="flex items-center gap-4 px-5 py-3">
                  <span className={`w-6 text-center text-sm font-bold ${rank === 0 ? "text-amber-500" : rank === 1 ? "text-gray-400" : rank === 2 ? "text-amber-700" : "text-gray-400"}`}>
                    {rank + 1}
                  </span>
                  {entry.referrer.photo ? (
                    <Image
                      src={entry.referrer.photo}
                      alt={entry.referrer.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#00A651]/10 flex items-center justify-center text-xs font-bold text-[#00A651]">
                      {entry.referrer.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{entry.referrer.name}</p>
                    <p className="text-xs text-gray-500">{entry.totalReferrals} total · {entry.rewardedReferrals} rewarded</p>
                  </div>
                  <span className="text-sm font-bold text-[#00A651]">{entry.rewardedReferrals}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ReferralCard({ entry }: { entry: ReferralEntry }) {
  const isPending = entry.status === "PENDING";
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {entry.referee.photo ? (
        <Image
          src={entry.referee.photo}
          alt={entry.referee.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
          {entry.referee.name[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{entry.referee.name}</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPending ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
            }`}
          >
            {isPending ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {isPending ? "Pending" : "Rewarded"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{entry.referee.phone}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
          <span>Signup bonus: <strong>{entry.refereeSignupCoins}</strong> coins</span>
          {!isPending ? (
            <>
              <span>Your reward: <strong className="text-[#00A651]">{entry.referrerRewardCoins}</strong> coins</span>
              <span>Their bonus: <strong>{entry.refereeFirstOrderCoins}</strong> coins</span>
            </>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Joined {new Date(entry.createdAt).toLocaleDateString()}
          {entry.rewardedAt ? ` · Rewarded ${new Date(entry.rewardedAt).toLocaleDateString()}` : ""}
        </p>
      </div>
    </li>
  );
}
