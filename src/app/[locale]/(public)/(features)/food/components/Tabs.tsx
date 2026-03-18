"use client";
import React from "react";

export default function Tabs({
  tab,
  setTab,
}: {
  tab: "foods" | "shops";
  setTab: (t: "foods" | "shops") => void;
}) {
  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => setTab("foods")}
        className={`flex-1 py-2 rounded-xl ${tab === "foods" ? "bg-red-600 text-white" : "bg-gray-100"}`}
      >
        Foods
      </button>
      <button
        onClick={() => setTab("shops")}
        className={`flex-1 py-2 rounded-xl ${tab === "shops" ? "bg-red-600 text-white" : "bg-gray-100"}`}
      >
        Shops
      </button>
    </div>
  );
}
