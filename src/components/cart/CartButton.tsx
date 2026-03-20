"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";

type CartButtonProps = {
  locale: string;
};

type MockCartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  accent: string;
};

const MOCK_CART_ITEMS: MockCartItem[] = [
  {
    id: "item-1",
    name: "Chicken Burger Combo",
    price: 290,
    qty: 1,
    accent: "from-red-100 to-orange-100",
  },
  {
    id: "item-2",
    name: "Cold Coffee",
    price: 140,
    qty: 2,
    accent: "from-amber-100 to-yellow-100",
  },
  {
    id: "item-3",
    name: "Notebook A4",
    price: 90,
    qty: 1,
    accent: "from-emerald-100 to-cyan-100",
  },
];

const DELIVERY_FEE = 50;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!entry) return null;

  return decodeURIComponent(entry.slice(name.length + 1));
}

export default function CartButton({ locale }: CartButtonProps) {
  const pathname = usePathname();
  const { dispatch } = useAppState();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [items, setItems] = useState<MockCartItem[]>(MOCK_CART_ITEMS);

  const isLoggedIn = Boolean(getCookieValue("user"));

  const hiddenOnCartPages = pathname?.includes("/cart") || pathname?.includes("/checkout");

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.qty, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.qty * item.price, 0),
    [items],
  );

  const total = subtotal + DELIVERY_FEE;

  const updateItemQty = (itemId: string, nextQty: number) => {
    if (nextQty <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              qty: nextQty,
            }
          : item,
      ),
    );
  };

  if (hiddenOnCartPages) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
          }

          setIsDrawerOpen(true);
        }}
        className="fixed bottom-6 right-6 z-[71] rounded-2xl border border-[#33C2DF]/40 bg-[#EAF8FB] p-2 shadow-lg transition-transform hover:scale-105"
        aria-label="Open cart"
        id="global-cart-button"
      >
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#E30A13] px-1 text-xs font-semibold text-white">
          {totalItems}
        </span>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
          <ShoppingCart className="h-4.5 w-4.5 text-[#00A651]" />
          <span className="text-xs font-semibold text-neutral-700">{total} BDT</span>
        </div>
      </button>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[72] bg-black/40"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[73] h-full w-full max-w-[430px] bg-white shadow-2xl transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart drawer"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h3 className="text-base font-semibold text-neutral-900">Your Cart</h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
              aria-label="Close cart drawer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm font-semibold text-neutral-800">Your cart is empty</p>
                <p className="mt-1 text-xs text-neutral-500">Add items from modules and they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-neutral-100 p-3"
                  >
                    <div className={`grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-br ${item.accent}`}>
                      <span className="text-xs font-bold text-neutral-700">
                        {item.name
                          .split(" ")
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-800">{item.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{item.price} BDT each</p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1">
                          <button
                            onClick={() => updateItemQty(item.id, item.qty - 1)}
                            className="rounded p-0.5 text-neutral-600 transition-colors hover:bg-neutral-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center text-xs font-semibold text-neutral-800">{item.qty}</span>
                          <button
                            onClick={() => updateItemQty(item.id, item.qty + 1)}
                            className="rounded p-0.5 text-neutral-600 transition-colors hover:bg-neutral-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => updateItemQty(item.id, 0)}
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 p-5">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{subtotal} BDT</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{DELIVERY_FEE} BDT</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-neutral-900">
                <span>Total</span>
                <span>{total} BDT</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setItems([])}
                className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                disabled={items.length === 0}
              >
                Clear Cart
              </button>
              <button
                className="rounded-xl bg-[#00A651] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00934a] disabled:bg-neutral-300"
                disabled={items.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showAuthModal && (
        <div className="fixed inset-0 z-[74] grid place-items-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-neutral-900">Authentication Required</h4>
            <p className="mt-2 text-sm text-neutral-600">
              Please log in first to access your cart and continue checkout.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#E30A13] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
                onClick={() => {
                  setShowAuthModal(false);
                  dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
                }}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
