"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, CheckCircle2, Wallet, Gift, CreditCard } from "lucide-react";

type Transaction = {
  id: string;
  type: "credit" | "debit";
  title: string;
  desc: string;
  amount: number;
  date: string;
  icon: string;
};

const TRANSACTIONS: Transaction[] = [
  { id: "1", type: "debit", title: "Chicken Burger Meal", desc: "Campus Bites · Delivery", amount: 360, date: "Today, 2:30 PM", icon: "🍔" },
  { id: "2", type: "credit", title: "Wallet Reload", desc: "via bKash", amount: 1000, date: "Today, 10:00 AM", icon: "💳" },
  { id: "3", type: "debit", title: "Introduction to Algorithms", desc: "Books Exchange", amount: 350, date: "Yesterday", icon: "📚" },
  { id: "4", type: "credit", title: "Cashback Reward", desc: "5% on delivery order", amount: 18, date: "Dec 18, 2024", icon: "🎁" },
  { id: "5", type: "debit", title: "Parcel Delivery", desc: "Al Beruni → Rokeya Hall", amount: 60, date: "Dec 17, 2024", icon: "📦" },
  { id: "6", type: "credit", title: "Wallet Reload", desc: "via Nagad", amount: 500, date: "Dec 15, 2024", icon: "💳" },
  { id: "7", type: "debit", title: "Flood Relief Donation", desc: "DU Welfare Club", amount: 500, date: "Dec 14, 2024", icon: "💚" },
  { id: "8", type: "debit", title: "Math Tuition Session", desc: "Anika Rahman", amount: 500, date: "Dec 12, 2024", icon: "🎓" },
  { id: "9", type: "credit", title: "Referral Bonus", desc: "Friend joined Campus Sheba", amount: 50, date: "Dec 10, 2024", icon: "🎁" },
  { id: "10", type: "debit", title: "Wireless Mouse", desc: "Marketplace purchase", amount: 850, date: "Dec 8, 2024", icon: "🖱️" },
];

const AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function WalletPage() {
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [reloadAmount, setReloadAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [reloadMethod, setReloadMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [reloadSubmitted, setReloadSubmitted] = useState(false);
  const [balance, setBalance] = useState(1258);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const totalIn = TRANSACTIONS.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = TRANSACTIONS.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const filtered = TRANSACTIONS.filter((t) => filter === "all" || t.type === filter);

  const handleReload = () => {
    const amount = Number(reloadAmount || customAmount);
    if (amount > 0) {
      setBalance((b) => b + amount);
      setReloadSubmitted(true);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your balance and view transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#E30A13] to-rose-700 text-white rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-rose-200 text-sm">Available Balance</p>
            <p className="text-4xl font-bold mt-1">৳{balance.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-green-300" />
              <span className="text-xs text-rose-200">Total In</span>
            </div>
            <p className="font-bold">৳{totalIn.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="w-4 h-4 text-red-300" />
              <span className="text-xs text-rose-200">Total Spent</span>
            </div>
            <p className="font-bold">৳{totalOut.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Gift className="w-4 h-4 text-yellow-300" />
              <span className="text-xs text-rose-200">Reward Pts</span>
            </div>
            <p className="font-bold">480 pts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => setShowReloadModal(true)} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2 group-hover:bg-green-600 group-hover:text-white transition-colors"><Plus className="w-5 h-5" /></div>
          <p className="text-sm font-medium text-gray-900">Add Money</p>
        </button>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2"><CreditCard className="w-5 h-5" /></div>
          <p className="text-sm font-medium text-gray-900">Pay Bill</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2"><Gift className="w-5 h-5" /></div>
          <p className="text-sm font-medium text-gray-900">Rewards</p>
        </div>
      </div>

      {/* Reward Points Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
        <span className="text-2xl">🏅</span>
        <div className="flex-1">
          <p className="font-semibold text-amber-800 text-sm">480 Reward Points Available</p>
          <p className="text-xs text-amber-600">Redeem 500 points for ৳50 cashback. Earn points on every order!</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold whitespace-nowrap">Redeem</button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(["all", "credit", "debit"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>{f === "credit" ? "Money In" : f === "debit" ? "Money Out" : "All"}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">{tx.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{tx.title}</p>
                <p className="text-xs text-gray-400">{tx.desc} · {tx.date}</p>
              </div>
              <div className={`font-bold text-sm ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "credit" ? "+" : "-"}৳{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reload Modal */}
      {showReloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Add Money to Wallet</h3>
              <button onClick={() => { setShowReloadModal(false); setReloadAmount(""); setCustomAmount(""); setReloadSubmitted(false); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
            </div>
            {reloadSubmitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Reloaded Successfully!</h4>
                <p className="text-sm text-gray-500 mb-1">৳{Number(reloadAmount || customAmount)} has been added to your wallet.</p>
                <p className="text-sm text-gray-500 mb-4">New balance: <strong>৳{balance.toLocaleString()}</strong></p>
                <button onClick={() => { setShowReloadModal(false); setReloadAmount(""); setCustomAmount(""); setReloadSubmitted(false); }} className="px-5 py-2.5 rounded-xl bg-[#E30A13] text-white text-sm font-medium">Done</button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Select Amount</p>
                  <div className="grid grid-cols-3 gap-2">
                    {AMOUNTS.map((a) => (
                      <button key={a} onClick={() => { setReloadAmount(a); setCustomAmount(""); }} className={`py-2 rounded-xl text-sm font-medium border-2 transition-colors ${reloadAmount === a ? "border-[#E30A13] bg-red-50 text-[#E30A13]" : "border-gray-200 text-gray-700 hover:border-red-300"}`}>৳{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Or Enter Custom Amount</p>
                  <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setReloadAmount(""); }} placeholder="e.g. 750" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Payment Method</p>
                  <div className="space-y-2">
                    {([["bkash", "📱", "bKash"], ["nagad", "📲", "Nagad"], ["rocket", "💳", "Rocket"]] as const).map(([id, icon, label]) => (
                      <button key={id} onClick={() => setReloadMethod(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${reloadMethod === id ? "border-[#E30A13] bg-red-50" : "border-gray-200 hover:border-red-200"}`}>
                        <span className="text-xl">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button disabled={!reloadAmount && !customAmount} onClick={handleReload} className="w-full py-3 rounded-xl bg-[#E30A13] text-white font-bold text-sm disabled:opacity-50 hover:bg-red-700">
                  Add ৳{reloadAmount || customAmount || 0} to Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
