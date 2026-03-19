import React from "react";
import Link from "next/link";
import { shops, foods } from "../../data";
import { MdOutlineRestaurant } from "react-icons/md";
import { FiClock } from "react-icons/fi";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = shops.find((s) => s.id === id);
  const menu = foods.filter((f) => f.shopId === id);

  if (!shop) return <div className="p-4">Shop not found</div>;

  return (
    <div className="p-4 bg-gray-100 max-w-7xl mx-auto">
      <Link href="/" className="text-red-600">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-3">Shop Details</h1>

      <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm">
        <div className="flex items-start">
          <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center mr-4">
            🏪
          </div>
          <div>
            <h2 className="font-semibold text-lg">{shop.name}</h2>
            <div className="text-sm text-gray-500">{shop.desc}</div>
            <div className="mt-3 text-sm text-gray-600">📍 {shop.location}</div>
            <div className="text-sm text-gray-600">🕒 {shop.hours}</div>
            <div className="text-sm text-gray-600">📞 {shop.phone}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Menu Items ({menu.length})</h3>
        <div>
          <div className="flex justify-center text-red-600 text-6xl min-h-[200px] items-center">
            <MdOutlineRestaurant className="text-red-600" />
          </div>
          <div className="mt-4 flex justify-between items-start bg-white rounded-2xl p-4 md:p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-xl">{shop.name}</h2>
                  {/* <div className="text-sm mt-2">
                    {shop.tag && (
                      <span className="inline-block border border-black px-2 py-1 rounded mr-2">
                        {shop.tag || "No Tag"}
                      </span>
                    )} */}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">৳40</div>
                </div>
              </div>
              <div className="mt-3 text-gray-600 bg-gray-200 text-xs md:text-base p-2 rounded-md">
                {shop.desc}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                ⭐ 4.4 • <FiClock className="text-white" /> {shop.hours}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
