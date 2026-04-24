"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import type { MarketplaceFoodVariation } from "@/types/marketplace";

type Props = {
  foodId: string;
  quantity?: number;
  variations?: MarketplaceFoodVariation[];
  isAvailable?: boolean;
};

export default function FoodDetailActions({ foodId, quantity, variations, isAvailable }: Props) {
  const [qty, setQty] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    variations?.[0]?.title ?? null,
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stockLeft = quantity ?? 0;
  const unavailable = isAvailable === false || stockLeft <= 0;

  function handleAddToCart() {
    startTransition(async () => {
      const res = await addToCartAction({ contentId: foodId, type: "food", quantity: qty });
      if (res.success) {
        emitCartUpdated();
        setMsg("Added to cart!");
        setTimeout(() => setMsg(null), 2500);
      } else {
        setMsg(res.message ?? "Could not add to cart.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {variations && variations.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Choose variation
          </p>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => {
              const active = selectedVariation === v.title;
              return (
                <button
                  key={v.title}
                  type="button"
                  onClick={() => setSelectedVariation(v.title)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-[#00A651] bg-[#E8F7EF] text-[#00A651]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {v.title}
                  {v.price ? (
                    <span className="ml-1 text-xs font-bold">৳{v.price}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!unavailable ? (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</span>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(stockLeft || 99, q + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isPending || unavailable}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:brightness-95 disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
        {unavailable ? "Unavailable" : isPending ? "Adding…" : "Add to cart"}
      </button>

      {msg ? (
        <p
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            msg === "Added to cart!"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
