"use client";

import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { getCartAction } from "@/services/cart";
import { CartItem } from "@/types/cart";

/* ─────────────────────────── types ─────────────────────────── */



const DELIVERY_FEE = 50;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/* ── brand tokens ── */
const B = {
  primary: "#00A651",
  primaryDark: "#008C44",
  primaryLight: "#E8F7EF",
  primaryBorder: "#C3E8D5",
  danger: "#E63946",
};

/* ═══════════════════════════ component ══════════════════════ */
export default function CartButton() {
  const pathname = usePathname();
  const { dispatch } = useAppState();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isLoggedIn = Boolean(getCookieValue("user"));
  const hidden = pathname?.includes("/cart") || pathname?.includes("/checkout");

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * (i.content.discountPrice || i.content.price), 0),
    [items],
  );
  const total = subtotal + DELIVERY_FEE;

  // Placeholder for remove and updateQty actions (to be implemented with API)
  const removeItem = (id: string) => {
    setRemovingId(id);
    // TODO: Call remove from cart API
    setTimeout(() => {
      setItems((p) => p.filter((i) => i._id !== id));
      setRemovingId(null);
    }, 260);
  };

  const updateQty = (id: string, next: number) => {
    if (next <= 0) {
      removeItem(id);
      return;
    }
    // TODO: Call update quantity API
    setItems((p) => p.map((i) => (i._id === id ? { ...i, quantity: next } : i)));
  };

  useEffect(() => {
    (async () => {
      const res = await getCartAction();
      if (res?.data?.items) setItems(res.data.items);
    })();
  }, []);

  if (hidden) return null;

  return (
    <>
      {/* ════════════ FLOATING TRIGGER ════════════ */}
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
          {/* cart icon */}
          <div className="flex flex-col items-center gap-1 px-[14px] pt-3.5 pb-2.5">
            <div
              className="relative w-[38px] h-[38px] rounded-xl flex items-center justify-center"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="w-[17px] h-[17px] transition-transform duration-200 group-hover:scale-110"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
              {totalItems > 0 && (
                <span
                  className="
                    absolute -top-[5px] -right-[5px]
                    min-w-[17px] h-[17px] px-[3px]
                    rounded-full flex items-center justify-center
                    text-[9px] font-bold text-white leading-none
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
            <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          {/* price band */}
          <div
            className="w-full py-[7px] flex items-center justify-center"
            style={{ background: B.primary }}
          >
            <span className="text-[11px] font-bold text-white tracking-wide">
              ৳{total}
            </span>
          </div>
        </div>
      </div>

      {/* ════════════ BACKDROP ════════════ */}
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

      {/* ════════════ SLIDE-IN DRAWER ════════════ */}
      <aside
        className={`
          fixed right-0 top-0 z-[73] h-full w-full max-w-[400px]
          flex flex-col
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
        {/* ── header ── */}
        <div
          className="flex items-center justify-between px-5 h-[60px] flex-shrink-0"
          style={{ background: "#fff", borderBottom: "1px solid #EAECEF" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="w-4 h-4"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-800 leading-tight">
                Your Cart
              </p>
              <p className="text-[11px] text-gray-400 mt-px">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="
              w-[32px] h-[32px] rounded-lg flex items-center justify-center
              text-gray-400 hover:text-gray-700 hover:bg-gray-100
              transition-colors duration-150
            "
            aria-label="Close cart"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── item list ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {items.length === 0 ? (
            <div
              className="mt-8 rounded-2xl flex flex-col items-center text-center py-10 px-6"
              style={{ background: "#fff", border: "1.5px dashed #E0E3E7" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: B.primaryLight }}
              >
                <Package
                  className="w-6 h-6"
                  style={{ color: B.primary }}
                  strokeWidth={1.8}
                />
              </div>
              <p className="text-[13px] font-semibold text-gray-700">
                Your cart is empty
              </p>
              <p className="text-[12px] text-gray-400 mt-1 max-w-[180px] leading-relaxed">
                Add items from the menu to get started.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 rounded-xl p-3 transition-all duration-[260ms]"
                style={{
                  background: "#fff",
                  border: "1px solid #EAECEF",
                  opacity: removingId === item._id ? 0 : 1,
                  transform:
                    removingId === item._id
                      ? "translateX(14px)"
                      : "translateX(0)",
                }}
              >
                {/* product image */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-100 overflow-hidden"
                >
                  {item.content.photos?.[0]?.url ? (
                    <img src={item.content.photos[0].url} alt={item.content.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl">🛒</span>
                  )}
                </div>

                {/* details */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {item.content.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    ৳{item.content.discountPrice || item.content.price} each
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    {/* qty stepper */}
                    <div
                      className="flex items-center gap-1 rounded-lg px-1 py-[3px]"
                      style={{
                        background: "#F3F4F6",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <button
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                      <span className="w-5 text-center text-[12px] font-bold text-gray-800 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-gray-800 tabular-nums">
                        ৳{(item.content.discountPrice || item.content.price) * item.quantity}
                      </span>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="
                          w-7 h-7 rounded-lg flex items-center justify-center
                          text-gray-300 hover:text-red-500 hover:bg-red-50
                          transition-all duration-150
                        "
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── footer ── */}
        <div
          className="px-4 pt-3 pb-4 flex-shrink-0"
          style={{ background: "#fff", borderTop: "1px solid #EAECEF" }}
        >
          {/* order summary */}
          <div
            className="rounded-xl px-4 py-3 mb-3 space-y-1.5"
            style={{
              background: B.primaryLight,
              border: `1px solid ${B.primaryBorder}`,
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Subtotal</span>
              <span className="text-[12px] font-medium text-gray-700 tabular-nums">
                ৳{subtotal}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Delivery fee</span>
              <span className="text-[12px] font-medium text-gray-700 tabular-nums">
                ৳{DELIVERY_FEE}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-2"
              style={{ borderTop: `1px solid ${B.primaryBorder}` }}
            >
              <span className="text-[13px] font-semibold text-gray-800">
                Total
              </span>
              <span
                className="text-[14px] font-bold tabular-nums"
                style={{ color: B.primary }}
              >
                ৳{total}
              </span>
            </div>
          </div>

          {/* cta row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setItems([])}
              disabled={items.length === 0}
              className="
                h-[42px] rounded-xl text-[13px] font-semibold
                text-red-500 border border-red-100 bg-white
                hover:bg-red-50 active:bg-red-100
                transition-colors duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Clear Cart
            </button>
            <button
              disabled={items.length === 0}
              className="
                h-[42px] rounded-xl text-[13px] font-bold text-white
                flex items-center justify-center gap-1.5
                transition-all duration-150 active:brightness-95
                disabled:cursor-not-allowed
              "
              style={{
                background: items.length > 0 ? B.primary : "#D1D5DB",
                boxShadow:
                  items.length > 0 ? `0 3px 12px rgba(0,166,81,0.28)` : "none",
              }}
            >
              Checkout
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════ AUTH MODAL ════════════ */}
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
              className="w-10 h-10 rounded-[11px] flex items-center justify-center mb-4"
              style={{ background: B.primaryLight }}
            >
              <ShoppingCart
                className="w-5 h-5"
                style={{ color: B.primary }}
                strokeWidth={2.2}
              />
            </div>

            <h4 className="text-[16px] font-bold text-gray-900">
              Sign in required
            </h4>
            <p className="mt-1.5 text-[13px] text-gray-500 leading-relaxed">
              Please log in to view your cart and proceed to checkout.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="
                  h-[40px] rounded-xl text-[13px] font-semibold text-gray-600
                  border border-gray-200 bg-white hover:bg-gray-50
                  transition-colors duration-150
                "
              >
                Cancel
              </button>
              <button
                type="button"
                className="
                  h-[40px] rounded-xl text-[13px] font-bold text-white
                  flex items-center justify-center gap-1.5
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
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
