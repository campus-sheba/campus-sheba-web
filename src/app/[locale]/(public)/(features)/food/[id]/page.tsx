import Link from "next/link";
import React from "react";
import { MdOutlineRestaurant } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { foods, shops } from "../data";

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
  const food = foods.find(
    (f) =>
      f.id === id || slugify(f.name) === id || f.id === decodeURIComponent(id),
  );
  if (!food) return <div className="p-4">Food not found</div>;
  const shop = shops.find((s) => s.id === food.shopId);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-50 ">
      <Link href={`/`} className="text-red-600">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-3">Food Details</h1>

      <div>
        <div className="flex justify-center text-red-600 text-6xl min-h-[200px] items-center">
          <MdOutlineRestaurant className="text-red-600" />
        </div>
        <div className="mt-4 flex justify-between items-start bg-white rounded-2xl p-4 md:p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-xl">{food.name}</h2>
                <div className="text-sm mt-2">
                  {food.tag && (
                    <span className="inline-block border border-black px-2 py-1 rounded mr-2">
                      {food.tag}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">৳{food.price}</div>
              </div>
            </div>
            <div className="mt-3 text-gray-600 bg-gray-200 text-xs md:text-base p-2 rounded-md">
              {food.desc}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              ⭐ {food.rating} • <FiClock className="text-white" /> {food.time}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500">Sold by</div>
        <Link href={`/shop/${shop?.id}`} className="font-semibold mt-2 block">
          {shop?.name}
        </Link>
      </div>

      {/* <div className="fixed left-4 right-4 bottom-6">
        <button className="w-full bg-red-600 text-white py-3 rounded-xl">
          🛒 Add to Cart
        </button>
      </div> */}
    </div>
  );
}
