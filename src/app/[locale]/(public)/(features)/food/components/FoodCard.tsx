"use client";
import Link from "next/link";
import React from "react";
import { MdOutlineRestaurant } from "react-icons/md";

export default function FoodCard({ food }: { food: any }) {
  return (
    <Link href={`./food/${food.id}`} className="block">
      <div className="bg-white rounded-2xl p-2 md:p-4 shadow-sm mb-4">
        <div className="flex justify-between items-start gap-1">
          <div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 flex items-center justify-center p-2 min-w-[60px] min-h-[60px] rounded-lg">
                <MdOutlineRestaurant className="text-red-600 text-2xl mb-2" />
              </div>
              <div>
                <h3 className="font-semibold text-md md:text-lg">
                  {food.name}
                </h3>
                <p className="text-xs md:text-md">{food.shopId}</p>
                <div className="text-xs text-gray-500 mt-2">
                  ⭐ {food.rating} • {food.time}
                </div>
                <div className="text-xs md:text-sm flex items-start gap-1 mt-2">
                  {food.desc.slice(0, 20)}
                  {food.desc.length > 20 ? "..." : ""}
                  <div className="text-sm md:text-xl font-bold">
                    ৳{food.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button className="mt-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs md:text-sm min-w-[85px]">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
