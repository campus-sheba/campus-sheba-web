"use client";
import Link from "next/link";
import React from "react";

export default function ShopCard({ shop }: { shop: any }) {
  return (
    <Link href={`./shop/${shop.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center">
        <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center mr-4">
          <div className="text-red-600">🏪</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{shop.name}</h3>
            <div
              className={`text-sm px-2 py-1 rounded-full ${shop.status === "open" ? "bg-green-100 text-green-700" : "bg-pink-100 text-pink-700"}`}
            >
              {shop.status === "open" ? "Open" : "Closed"}
            </div>
          </div>
          <div className="text-sm text-gray-500">{shop.desc}</div>
          <div className="text-xs text-gray-500 mt-1">
            ⭐ 4.5 • {shop.location}
          </div>
        </div>
      </div>
    </Link>
  );
}
