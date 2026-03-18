"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Heart, ChevronLeft, Users, Calendar, Target, CheckCircle2, X } from "lucide-react";

const CAMPAIGNS: Record<string, {
  id: string; title: string; category: string; raised: number; goal: number;
  donors: number; daysLeft: number; organizer: string; accent: string; urgent: boolean; story: string;
}> = {
  c1: { id: "c1", title: "Books for Underprivileged Children", category: "Education", raised: 45000, goal: 80000, donors: 128, daysLeft: 12, organizer: "JU Social Club", accent: "from-blue-400 to-blue-600", urgent: false, story: "Hundreds of underprivileged children in the Savar area lack access to basic educational materials. This campaign aims to provide textbooks, notebooks, and stationery to 200+ students in nearby village schools. Your contribution directly buys books and supplies for children who would otherwise be without." },
  c2: { id: "c2", title: "Emergency Medical Fund — Rashida", category: "Health & Medical", raised: 62000, goal: 100000, donors: 245, daysLeft: 3, organizer: "JU Student Council", accent: "from-red-400 to-red-600", urgent: true, story: "Rashida Begum, a mother of three and domestic worker in our campus neighborhood, has been diagnosed with Stage 3 ovarian cancer. Her family cannot afford the treatment cost of ৳1,00,000. She has been to every hospital in Dhaka but requires further specialized treatment. Please help us save her life." },
  c3: { id: "c3", title: "Tree Plantation Drive 2025", category: "Environment", raised: 18500, goal: 50000, donors: 74, daysLeft: 20, organizer: "Green Earth JU", accent: "from-green-400 to-green-600", urgent: false, story: "We are planting 500 trees across 3 campuses this year. Every ৳100 plants one tree. Help us fight climate change and make our campuses greener. Trees planted will include fruit trees, shade trees, and medicinal plants." },
  c5: { id: "c5", title: "Flood Relief Sylhet 2025", category: "Disaster Relief", raised: 89000, goal: 200000, donors: 412, daysLeft: 5, organizer: "Humanity First BD", accent: "from-teal-400 to-teal-600", urgent: true, story: "Devastating floods have displaced over 200,000 families in Sylhet division. We are distributing dry food packages, clean water, medicine, and blankets to affected families. Every ৳500 feeds a family for a week." },
};

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function DonationDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const campaign = CAMPAIGNS[id] || CAMPAIGNS["c1"];
  const progress = Math.round((campaign.raised / campaign.goal) * 100);

  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [donated, setDonated] = useState(false);

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-2xl">
        <Link href={`/${locale}/donation`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Campaigns
        </Link>

        {donated ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-green-600 font-bold text-xl mb-2">৳{finalAmount.toLocaleString()} donated</p>
            <p className="text-gray-500 text-sm mb-6">Your generous contribution to <strong>{campaign.title}</strong> has been recorded. You are making a real difference!</p>
            <Link href={`/${locale}/donation`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700">
              Browse More Campaigns
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className={`h-36 bg-gradient-to-br ${campaign.accent} flex items-center justify-center relative`}>
                <Heart className="w-14 h-14 text-white/60" />
                {campaign.urgent && <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white">URGENT</span>}
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{campaign.category}</span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{campaign.title}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Organized by {campaign.organizer}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-700 mb-1.5 font-medium">
                    <span>৳{campaign.raised.toLocaleString()} raised</span>
                    <span>Goal: ৳{campaign.goal.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{campaign.donors} donors</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{campaign.daysLeft} days left</span>
                    <span className="flex items-center gap-1.5"><Target className="w-4 h-4" />{progress}% funded</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">The Story</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{campaign.story}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Make a Donation</h2>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((a) => (
                  <button key={a} onClick={() => { setSelectedAmount(a); setCustomAmount(""); }} className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${selectedAmount === a && !customAmount ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-green-400"}`}>
                    ৳{a}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Or enter custom amount</label>
                <input value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }} placeholder="৳ Custom amount" type="number" min="10" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" />
              </div>
              <button disabled={!finalAmount || finalAmount < 10} onClick={() => setShowModal(true)} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
                <Heart className="w-4 h-4" />
                Donate {finalAmount ? `৳${finalAmount.toLocaleString()}` : "Now"}
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-[51] shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Donation</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-3xl font-bold text-green-700">৳{finalAmount.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-0.5">{campaign.title}</p>
              </div>
              <div className="space-y-3">
                {!anonymous && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name</label>
                      <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Enter your name" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone (for receipt)</label>
                      <input value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400" />
                    </div>
                  </>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-600">Donate anonymously</span>
                </label>
                <button disabled={!anonymous && (!donorName || !donorPhone)} onClick={() => { setShowModal(false); setDonated(true); }} className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">
                  Confirm & Donate
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
