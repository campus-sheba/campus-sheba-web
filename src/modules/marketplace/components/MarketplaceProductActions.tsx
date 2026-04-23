"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import type { MarketplaceProduct } from "@/types/marketplace";

type Props = {
  product: Pick<MarketplaceProduct, "_id" | "variants" | "quantity">;
};

export default function MarketplaceProductActions({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stockLeft = product.quantity ?? 0;

  function selectVariant(name: string, option: string) {
    setSelectedVariants((prev) => ({ ...prev, [name]: option }));
  }

  function handleAddToCart() {
    startTransition(async () => {
      const res = await addToCartAction({
        contentId: product._id,
        type: "campus_mart",
        quantity: qty,
      });
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
      {product.variants?.map((v) => (
        <div key={v.name}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {v.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {v.options.map((opt) => {
              const selected = selectedVariants[v.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectVariant(v.name, opt)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    selected
                      ? "border-[#00A651] bg-[#E8F7EF] text-[#00A651]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {stockLeft > 0 && (
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
              onClick={() => setQty((q) => Math.min(stockLeft, q + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isPending || stockLeft <= 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:brightness-95 disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
        {stockLeft <= 0 ? "Out of stock" : isPending ? "Adding…" : "Add to cart"}
      </button>

      {msg && (
        <p
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            msg === "Added to cart!"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
