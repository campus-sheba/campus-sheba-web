"use client";

import * as React from "react";
import Link from "next/link";
import { Tag, Wallet } from "lucide-react";
import { FaMap, FaClock, FaPhone } from "react-icons/fa6";

type Item = (typeof ITEMS)[number];
type Params = { id: string; locale: string };

function getItemById(id: string): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}

export default function LostFoundDetailsPage(props: {
  params: Params | Promise<Params>;
}) {
  const { params } = props;
  const actualParams =
    typeof (params as any)?.then === "function"
      ? React.use(params as Promise<Params>)
      : (params as Params);
  const item = getItemById(actualParams.id);
  const isLost = item?.type === "lost";

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
            Item not found
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6">
            The lost &amp; found item you are looking for does not exist.
          </p>
          <Link
            href={`/${actualParams.locale}/lost-found`}
            className="text-blue-600 font-medium"
          >
            Back to Lost &amp; Found
          </Link>
        </div>
      </div>
    );
  }
  // href={`/${actualParams.locale}/lost-found`}
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="cs-container mx-auto pt-5 md:pt-8">
        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-5 md:mb-8">
          <Link href={`/${actualParams.locale}/lost-found`}>
            <span className="-ml-0.5 text-lg">&larr;</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              Item Details
            </h1>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                isLost
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              {item.type}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          {/* LEFT */}
          <div className="space-y-5">
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    isLost
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {item.image}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.title}</h2>

                  <p className="text-sm text-gray-400">{item.time}</p>

                  <div className="inline-flex items-center gap-1 mt-2 bg-gray-50 px-2 py-1 rounded-full text-xs">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </div>
                </div>

                {item.reward && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                      <Wallet className="w-4 h-4" />৳{item.reward}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </section>

            {/* LOCATION */}
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <h3 className="font-semibold mb-4">Location & Time</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
                    <FaMap />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Last Seen</p>
                    <p className="text-sm font-medium">{item.location}</p>
                  </div>
                </div>

                <div className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
                    <FaClock />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="text-sm font-medium">{item.time}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <h3 className="font-semibold mb-4">Contact Information</h3>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium">{item.contactName}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-medium">{item.contactPhone}</p>
                  </div>

                  <Link
                    href={`tel:${item.contactPhone}`}
                    className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <FaPhone />
                    Call
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="cs-container py-3">
          <Link
            href={`tel:${item.contactPhone}`}
            className={`flex justify-center py-3 rounded-xl text-white font-semibold ${
              isLost
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <FaPhone className="mr-2" />
            Contact {isLost ? "Owner" : "Finder"}
          </Link>
        </div>
      </div>
    </div>
  );
}
