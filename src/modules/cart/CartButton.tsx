"use client";

import { usePathname } from "next/navigation";
import { ShoppingCart, X, ArrowRight } from "lucide-react";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import {
  clearCartAction,
  decreaseCartItemAction,
  getCartAction,
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import CartLineItems from "@/modules/cart/CartLineItems";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cartEvents";
import type { Cart, CartItem } from "@/types/cart";

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
  primaryLight: "#E8F7EF",
  primaryBorder: "#C3E8D5",
  danger: "#E63946",
};

export default function CartButton() {
  const pathname = usePathname();
  const { dispatch } = useAppState();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isLoggedIn = Boolean(getCookieValue("user"));
  const hidden = pathname?.includes("/cart") || pathname?.includes("/checkout");

  const totalItems = useMemo(
    () =>
      typeof cart?.itemCount === "number"
        ? cart.itemCount
        : items.reduce((s, i) => s + i.quantity, 0),
    [cart?.itemCount, items],
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + i.quantity * (i.content.discountPrice || i.content.price),
        0,
      ),
    [items],
  );

  const removeItem = async (id: string) => {
    const target = items.find((i) => i._id === id);
    if (!target) return;
    setRemovingId(id);
    const response = await removeCartItemAction(id);
    if (response.success) {
      setMessage(null);
      emitCartUpdated();
    } else {
      setMessage(response.message ?? "Failed to remove cart item.");
    }
    setRemovingId(null);
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

  const loadCartFromServer = useCallback(async () => {
    const res = await getCartAction();
    if (res.success && res.data) {
      setCart(res.data);
      setItems(normalizeCartLineItems(res.data));
    } else {
      setCart(null);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await loadCartFromServer();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCartFromServer]);

  useEffect(() => {
    const onCartUpdated = () => {
      void loadCartFromServer();
    };
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
  }, [loadCartFromServer]);

  useEffect(() => {
    if (!isDrawerOpen || !isLoggedIn) return;
    void loadCartFromServer();
  }, [isDrawerOpen, isLoggedIn, loadCartFromServer]);

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

  if (hidden) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Open cart"
        onClick={() =>
          isLoggedIn ? setIsDrawerOpen(true) : setShowAuthModal(true)
        }
        onKeyDown={(e) =>
          e.key === "Enter" &&
          (isLoggedIn ? setIsDrawerOpen(true) : setShowAuthModal(true))
        }
        className="fixed right-0 bottom-[48%] z-20 translate-y-1/2 cursor-pointer"
      >
        <div
          className="
            group relative flex flex-col items-center select-none
            rounded-l-2xl overflow-hidden
            transition-all duration-200 ease-out
            hover:-translate-x-[2px]
            hover:shadow-[0_6px_24px_rgba(0,166,81,0.24)]
          "
          style={{
            background: "#fff",
            border: `1.5px solid ${B.primaryBorder}`,
            borderRight: "none",
            boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
          }}
        >
          <div className="flex flex-col items-center gap-1 px-[14px] pt-3.5 pb-2.5">
            <div
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="h-[17px] w-[17px] transition-transform duration-200 group-hover:scale-110"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
              {totalItems > 0 && (
                <span
                  className="
                    absolute -top-[5px] -right-[5px]
                    flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-[3px]
                    text-[9px] font-bold leading-none text-white
                  "
                  style={{
                    background: B.danger,
                    boxShadow: "0 1px 5px rgba(230,57,70,0.40)",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-gray-400">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          <div
            className="flex w-full items-center justify-center py-[7px]"
            style={{ background: B.primary }}
          >
            <span className="text-[11px] font-bold tracking-wide text-white">
              ৳{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[72] transition-opacity duration-300"
          style={{
            background: "rgba(17,24,39,0.38)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed right-0 top-0 z-[73] flex h-full w-full max-w-[400px] flex-col
          transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          background: "#F8F9FA",
          boxShadow: "-2px 0 28px rgba(0,0,0,0.10)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div
          className="flex h-[60px] flex-shrink-0 items-center justify-between px-5"
          style={{ background: "#fff", borderBottom: "1px solid #EAECEF" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="h-4 w-4"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight text-gray-800">
                Your Cart
              </p>
              <p className="mt-px text-[11px] text-gray-400">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="
              flex h-[32px] w-[32px] items-center justify-center rounded-lg
              text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700
            "
            aria-label="Close cart"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="flex justify-end">
            <Link
              href="/buy-sell"
              className="text-[12px] font-semibold text-[#00A651] underline underline-offset-2"
              onClick={() => setIsDrawerOpen(false)}
            >
              Add items
            </Link>
          </div>

          <CartLineItems
            items={items}
            removingId={removingId}
            onChangeQty={updateQty}
            onRemove={removeItem}
          />
        </div>

        <div
          className="flex-shrink-0 px-4 pb-4 pt-3"
          style={{ background: "#fff", borderTop: "1px solid #EAECEF" }}
        >
          {items.length > 0 ? (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <span className="text-[12px] font-semibold text-gray-700">Subtotal</span>
              <span className="text-[13px] font-bold tabular-nums text-gray-900">
                ৳{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : null}

          <Link
            href="/cart"
            className="mb-3 block w-full rounded-xl border border-[#C3E8D5] bg-white py-2.5 text-center text-[13px] font-semibold text-[#00A651] transition hover:bg-[#E8F7EF]"
            onClick={() => setIsDrawerOpen(false)}
          >
            View full cart
          </Link>

          {message && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/checkout"
              className="
                flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white
                transition active:brightness-95
              "
              style={{
                background: items.length > 0 ? B.primary : "#D1D5DB",
                boxShadow:
                  items.length > 0 ? `0 3px 12px rgba(0,166,81,0.28)` : "none",
              }}
              onClick={(e) => {
                if (items.length === 0 || isBusy) {
                  e.preventDefault();
                }
              }}
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>

            <button
              type="button"
              onClick={handleClearCart}
              disabled={items.length === 0 || isBusy}
              className="
                h-11 rounded-xl border border-red-100 bg-white text-[13px] font-semibold text-red-500
                transition-colors duration-150 hover:bg-red-50 active:bg-red-100
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              Clear cart
            </button>
          </div>
        </div>
      </aside>

      {showAuthModal && (
        <div
          className="fixed inset-0 z-[74] grid place-items-center px-4"
          style={{
            background: "rgba(17,24,39,0.48)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl p-6"
            style={{
              background: "#fff",
              boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
              border: "1px solid #F3F4F6",
            }}
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-[11px]"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="h-5 w-5"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
            </div>

            <h4 className="text-[16px] font-bold text-gray-900">Sign in required</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Please log in to view your cart and proceed to checkout.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="
                  h-[40px] rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-600
                  transition-colors duration-150 hover:bg-gray-50
                "
              >
                Cancel
              </button>
              <button
                type="button"
                className="
                  flex h-[40px] items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold text-white
                  transition-all duration-150 active:brightness-95
                "
                style={{
                  background: B.danger,
                  boxShadow: "0 3px 12px rgba(230,57,70,0.28)",
                }}
                onClick={() => {
                  setShowAuthModal(false);
                  dispatch({
                    type: "OPEN_AUTH_MODAL",
                    payload: { defaultTab: "login" },
                  });
                }}
              >
                Log In
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
