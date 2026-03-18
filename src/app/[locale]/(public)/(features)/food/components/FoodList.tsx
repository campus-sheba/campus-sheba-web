"use client";
import React from "react";
import FoodCard from "./FoodCard";

export default function FoodList({ items }: { items: any[] }) {
  return (
    <div>
      {items.map((f) => (
        <FoodCard key={f.id} food={f} />
      ))}
    </div>
  );
}
