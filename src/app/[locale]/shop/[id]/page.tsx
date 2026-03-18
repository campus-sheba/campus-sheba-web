import React from "react";
import Link from "next/link";
import { shops, foods } from "../../(public)/(features)/food/data";
import { MdOutlineRestaurant } from "react-icons/md";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const shop = shops.find(
    (s) =>
      s.id === id || slugify(s.name) === id || s.id === decodeURIComponent(id),
  );
  const menu = foods.filter((f) => f.shopId === shop?.id);

  if (!shop) return <div className="p-4">Shop not found</div>;

  return (
    <div className="p-4 bg-gray-100 max-w-7xl mx-auto">
      <Link href={`/${locale}`} className="text-red-600">
        ← Back
      </Link>
      <h1 className="text-lg md:text-2xl font-semibold mt-3">Shop Details</h1>

      <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm">
        <div className="flex items-start">
          <div className="h-16 min-w-16 rounded-lg bg-red-50 flex items-center justify-center mr-4">
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
          {menu.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-start gap-4"
            >
              <div className="flex justify-center text-red-600  items-center min-w-16 h-16 rounded-lg bg-gray-200">
                <MdOutlineRestaurant className="text-red-600" />
              </div>
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">{m.name}</h4>
                  <div className="text-sm text-gray-500">
                    ⭐ {m.rating} • {m.time}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {m.desc.slice(0, 60)}
                    {m.desc.length > 60 ? "..." : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">৳{m.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
