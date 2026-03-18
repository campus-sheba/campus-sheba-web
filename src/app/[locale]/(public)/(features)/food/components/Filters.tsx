"use client";
import React from "react";
import { MdOutlineRestaurant } from "react-icons/md";

export default function Filters({
  category,
  setCategory,
}: {
  category: string;
  setCategory: (c: string) => void;
}) {
  const categories = ["All", "Snacks", "Meals", "Desserts"];
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => setCategory(c)}
          className={`py-2 px-6 rounded-md text-sm ${category === c ? "bg-red-600 text-white" : "bg-white border"}`}
        >
          {c == "All" ? <MdOutlineRestaurant className="inline mr-2" /> : null}
          {c}
        </button>
      ))}
    </div>
  );
}
