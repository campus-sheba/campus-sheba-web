"use client";
import React from "react";
import ShopCard from "./ShopCard";

export default function ShopList({ items }: { items: any[] }) {
  return (
    <div>
      {items.map((s) => (
        <ShopCard key={s.id} shop={s} />
      ))}
    </div>
  );
}
