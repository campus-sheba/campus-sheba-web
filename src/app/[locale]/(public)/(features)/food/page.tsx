"use client";
import React, { useState } from "react";
import Tabs from "./components/Tabs";
import Filters from "./components/Filters";
import FoodList from "./components/FoodList";
import ShopList from "./components/ShopList";
import { foods, shops } from "./data";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function Page() {
  const [tab, setTab] = useState<"foods" | "shops">("foods");
  const [category, setCategory] = useState("All");

  return (
    <div className="p-4 container mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <FaArrowLeftLong className="text-xl" />
        <div>
          <h1 className="text-2xl font-bold mb-1">Foods</h1>
          <p className="text-sm text-gray-500 mb-4">
            Order from campus & student shops
          </p>
        </div>
      </div>

      <div className="mb-4">
        <input
          placeholder={
            tab === "foods" ? "Search food items..." : "Search shops..."
          }
          className="w-full rounded-xl p-3 bg-gray-100"
        />
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {tab === "foods" && (
        <>
          <Filters category={category} setCategory={setCategory} />
          <FoodList items={foods} />
        </>
      )}

      {tab === "shops" && (
        <>
          <ShopList items={shops} />
        </>
      )}
    </div>
  );
}
