/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContentWrapper } from "@/components/wrappers";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cartEvents";
import {
  clearCartAction,
  decreaseCartItemAction,
  getCartAction,
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import CartLineItems from "@/modules/cart/CartLineItems";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import type { CartItem } from "@/types/cart";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

const B = {
  primary: "#00A651",
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isLoggedIn = Boolean(getCookieValue("user"));

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + i.quantity * (i.content.discountPrice || i.content.price),
        0,
      ),
    [items],
  );

  const loadCartFromServer = useCallback(async () => {
    const res = await getCartAction();
    if (res.success && res.data) {
      setItems(normalizeCartLineItems(res.data));
    } else {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void loadCartFromServer();
  }, [loadCartFromServer]);

  useEffect(() => {
    const onUpd = () => {
      void loadCartFromServer();
    };
    window.addEventListener(CART_UPDATED_EVENT, onUpd);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpd);
  }, [loadCartFromServer]);

  const removeItem = async (id: string) => {
    const target = items.find((i) => i._id === id);
    if (!target) return;
    setRemovingId(id);
    const response = await removeCartItemAction(id);
    setRemovingId(null);
    if (response.success) {
      setMessage(null);
      emitCartUpdated();
    } else {
      setMessage(response.message ?? "Failed to remove cart item.");
    }
  };

  const updateQty = async (id: string, next: number) => {
    const target = items.find((i) => i._id === id);
    if (!target) return;
    if (next <= 0 || target.quantity <= 0) {
      await removeItem(id);
      return;
    }
    const action =
      next > target.quantity
        ? increaseCartItemAction(target.content._id)
        : decreaseCartItemAction(target.content._id);
    const response = await action;
    if (response.success) {
      setMessage(null);
      emitCartUpdated();
    } else {
      setMessage(response.message ?? "Failed to update quantity.");
    }
  };

  const handleClearCart = async () => {
    setIsBusy(true);
    const res = await clearCartAction();
    if (res.success) {
      setMessage(null);
      emitCartUpdated();
    } else {
      setMessage(res.message ?? "Failed to clear cart.");
    }
    setIsBusy(false);
  };

  if (!isLoggedIn) {
    return (
      <ContentWrapper maxWidth="full" padding="lg" className="mx-auto max-w-lg">
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sign in to view your cart.
        </p>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper
      maxWidth="full"
      padding="lg"
      className="mx-auto max-w-xl pb-24"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cart</h1>
          <p className="text-[13px] text-gray-500">
            {items.reduce((s, i) => s + i.quantity, 0)}{" "}
            {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/buy-sell"
          className="text-[13px] font-semibold text-[#00A651] underline underline-offset-2"
        >
          Add items
        </Link>
      </div>

      <CartLineItems
        items={items}
        removingId={removingId}
        onChangeQty={updateQty}
        onRemove={removeItem}
        emptyHint="Browse Buy & Sell or the shop to add items."
      />

      {items.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-[13px] font-semibold text-gray-800">Subtotal</span>
            <span className="text-[15px] font-bold tabular-nums text-gray-900">
              ৳{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-gray-500">
            Delivery address, payment, and promo codes are set on the next step.
          </p>

          {message && (
            <p className="mb-3 mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              {message}
            </p>
          )}

          <div className="mt-6 grid gap-2">
            <Link
              href="/checkout"
              className="
                flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white
                transition active:brightness-95
              "
              style={{
                background: B.primary,
                boxShadow: `0 3px 12px rgba(0,166,81,0.28)`,
              }}
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>

            <button
              type="button"
              onClick={handleClearCart}
              disabled={isBusy}
              className="h-11 rounded-xl border border-red-100 bg-white text-[13px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40"
            >
              Clear cart
            </button>
          </div>
        </>
      )}
    </ContentWrapper>
  );
}
