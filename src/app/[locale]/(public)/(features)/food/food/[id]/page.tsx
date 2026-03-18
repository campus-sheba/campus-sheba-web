import Link from "next/link";
import React from "react";
import { foods, shops } from "../../data";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const food = foods.find((f) => f.id === id);
  if (!food) return <div className="p-4">Food not found</div>;
  const shop = shops.find((s) => s.id === food.shopId);

  return (
    <div className="p-4">
      <Link href="/" className="text-red-600">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-3">Food Details</h1>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-center text-red-600 text-6xl">🍴</div>
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-xl">{food.name}</h2>
            <div className="text-sm text-gray-500 mt-2">
              {food.tag && (
                <span className="inline-block border px-2 py-1 rounded mr-2">
                  {food.tag}
                </span>
              )}
            </div>
            <div className="mt-3 text-gray-600">{food.desc}</div>
            <div className="mt-4 text-sm text-gray-600">
              ⭐ {food.rating} • {food.time}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">৳{food.price}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500">Sold by</div>
        <Link
          href={`/[locale]/(public)/(features)/food/shop/${shop?.id}`}
          className="font-semibold mt-2 block"
        >
          {shop?.name}
        </Link>
      </div>

      <div className="fixed left-4 right-4 bottom-6">
        <button className="w-full bg-red-600 text-white py-3 rounded-xl">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}
