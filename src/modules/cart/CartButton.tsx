"use client";

import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  X,
  ArrowRight,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { CookieHelper } from "@/lib/appStateHelper";
import { useAppState } from "@/contexts/AppStateContext";
import {
  clearCartAction,
  createOrderSummaryAction,
  decreaseCartItemAction,
  getCartAction,
  getChargeByTypeAction,
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import { getAddressesAction } from "@/services/addresses";
import CartOrderSummary from "@/modules/cart/CartOrderSummary";
import CartLineItems from "@/modules/cart/CartLineItems";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cartEvents";
import type { UserAddress } from "@/types/address";
import { CartItem, ChargeConfig, ChargeType, type OrderSummaryResponse } from "@/types/cart";

/* ─────────────────────────── types ─────────────────────────── */



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
  const { dispatch, state } = useAppState();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [chargeConfig, setChargeConfig] = useState<ChargeConfig | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(null);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [orderSummaryError, setOrderSummaryError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [drawerAddressId, setDrawerAddressId] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);

  const isLoggedIn = Boolean(getCookieValue("user"));
  const hidden = pathname?.includes("/cart") || pathname?.includes("/checkout");
  const selectedUniversityId =
    state.university.selected?._id ?? state.user.profile?.university?._id ?? getCookieValue("universityId");
  const selectedAddressId =
    state.address.selected?.id ??
    (typeof state.address.selected === "object" &&
    state.address.selected &&
    "_id" in state.address.selected
      ? String(state.address.selected._id)
      : null) ??
    getCookieValue("addressId");

  const deliveryAddresses = useMemo(
    () => addresses.filter((a) => a.type === "DELIVERY"),
    [addresses],
  );
  const selectedDeliveryAddress = useMemo(
    () => deliveryAddresses.find((a) => a._id === drawerAddressId) ?? null,
    [deliveryAddresses, drawerAddressId],
  );
  const lineItemType = items[0]?.type ?? "BuySell";
  const cartType = (lineItemType === "Book" ? "Book" : "BuySell") as "Book" | "BuySell";
  const chargeType: ChargeType =
    lineItemType === "Book" ? "Book" : lineItemType === "Product" ? "Product" : "BuySell";

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * (i.content.discountPrice || i.content.price), 0),
    [items],
  );
  const deliveryFee = chargeConfig?.shipping?.basedPrice ?? 0;
  const total =
    isDrawerOpen && orderSummary && drawerAddressId
      ? orderSummary.total
      : subtotal + deliveryFee;

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

    const action = next > target.quantity
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
      setItems(normalizeCartLineItems(res.data));
    } else {
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

  /* Address list + drawer selection: init when drawer opens only. */
  useEffect(() => {
    if (!isDrawerOpen || !isLoggedIn) return;
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await loadCartFromServer();
      const r = await getAddressesAction();
      if (cancelled || !r.success) return;
      setAddresses(r.data);
      const delivery = r.data.filter((a) => a.type === "DELIVERY");
      const fromApp =
        selectedAddressId && delivery.some((a) => a._id === selectedAddressId)
          ? selectedAddressId
          : null;
      const cookieId = CookieHelper.getAddressId();
      const fromCookie =
        !fromApp && cookieId && delivery.some((a) => a._id === cookieId) ? cookieId : null;
      const nextId = fromApp ?? fromCookie ?? pickDefaultDeliveryAddressId(r.data);
      setDrawerAddressId(nextId);
      if (nextId && !fromApp && !fromCookie) {
        CookieHelper.setAddressId(nextId);
      }
    })();
    return () => {
      cancelled = true;
    };
    // selectedAddressId: intentionally read only when drawer opens; omitting avoids resetting radios mid-drawer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, isLoggedIn, loadCartFromServer]);

  useEffect(() => {
    if (!selectedUniversityId) return;
    (async () => {
      const res = await getChargeByTypeAction(chargeType, selectedUniversityId);
      if (res.success) setChargeConfig(res.data);
    })();
  }, [chargeType, selectedUniversityId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();

      if (!isDrawerOpen || !drawerAddressId || items.length === 0) {
        if (!cancelled) {
          setOrderSummary(null);
          setOrderSummaryError(null);
          setOrderSummaryLoading(false);
        }
        return;
      }

      if (cancelled) return;
      setOrderSummaryLoading(true);
      setOrderSummaryError(null);

      const payload = {
        type: cartType,
        rentalType: "Normal" as const,
        addressId: drawerAddressId,
        deliveryType: "COD" as const,
        deliveryTip: 0,
        ...(appliedCoupon ? { code: appliedCoupon } : {}),
        items: items.map((item) => ({ id: item.content._id, quantity: item.quantity })),
      };
      const summary = await createOrderSummaryAction(payload);
      if (cancelled) return;
      setOrderSummaryLoading(false);
      if (summary.success && summary.data) {
        setOrderSummary(summary.data);
        setOrderSummaryError(null);
      } else {
        setOrderSummary(null);
        setOrderSummaryError(summary.message ?? "Could not load order summary.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartType, isDrawerOpen, items, drawerAddressId, appliedCoupon]);

  const handleClearCart = async () => {
    setIsBusy(true);
    const res = await clearCartAction();
    if (res.success) {
      setOrderSummary(null);
      setOrderSummaryError(null);
      setMessage(null);
      emitCartUpdated();
    } else {
      setMessage(res.message ?? "Failed to clear cart.");
    }
    setIsBusy(false);
  };

  const onSelectDrawerAddress = (id: string) => {
    setDrawerAddressId(id);
    CookieHelper.setAddressId(id);
    setMessage(null);
  };

  const onApplyCoupon = () => {
    const code = couponDraft.trim();
    setAppliedCoupon(code.length ? code : null);
    if (code.length > 0) setShowCouponField(true);
    setMessage(null);
  };

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

        {/* ── scroll: line items + address + coupon (same order as /cart) ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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

          {items.length > 0 && (
            <>
              <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-800">
                    <MapPin className="h-3.5 w-3.5 text-[#00A651]" strokeWidth={2} />
                    Delivery address
                  </div>
                  {deliveryAddresses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="rounded-lg border border-[#C3E8D5] px-2 py-1 text-[11px] font-semibold text-[#00A651] hover:bg-[#E8F7EF]"
                    >
                      Change
                    </button>
                  ) : null}
                </div>
                {selectedDeliveryAddress ? (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-2.5">
                    <p className="line-clamp-2 text-[12px] font-medium text-gray-800">
                      {selectedDeliveryAddress.address}
                    </p>
                    {selectedDeliveryAddress.description ? (
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {selectedDeliveryAddress.description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {deliveryAddresses.length === 0 ? (
                  <p className="text-[12px] text-gray-600">
                    No delivery addresses.{" "}
                    <Link
                      href="/my-addresses"
                      className="font-semibold text-[#00A651] underline"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Add one
                    </Link>
                  </p>
                ) : null}
                <Link
                  href="/my-addresses"
                  className="mt-2 inline-block text-[11px] font-semibold text-[#00A651] underline"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Manage addresses
                </Link>
              </section>

              <section
                className="rounded-2xl border p-3"
                style={{ borderColor: B.primaryBorder, background: B.primaryLight }}
              >
                <button
                  type="button"
                  onClick={() => setShowCouponField((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-800">
                    <Tag className="h-3.5 w-3.5 text-[#00A651]" strokeWidth={2} />
                    Have a coupon?
                  </div>
                  {showCouponField ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {showCouponField ? (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponDraft}
                        onChange={(e) => setCouponDraft(e.target.value)}
                        placeholder="e.g. SHUKHEE10"
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[12px] outline-none focus:border-[#00A651]"
                      />
                      <button
                        type="button"
                        onClick={onApplyCoupon}
                        className="shrink-0 rounded-lg bg-[#00A651] px-3 py-2 text-[12px] font-bold text-white active:brightness-95"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon ? (
                      <p className="mt-1.5 text-[10px] text-gray-600">
                        Applied: <span className="font-semibold text-gray-800">{appliedCoupon}</span>
                      </p>
                    ) : null}
                  </div>
                ) : appliedCoupon ? (
                  <p className="mt-1.5 text-[10px] text-gray-600">
                    Applied: <span className="font-semibold text-gray-800">{appliedCoupon}</span>
                  </p>
                ) : null}
              </section>
            </>
          )}
        </div>

        {/* ── footer ── */}
        <div
          className="px-4 pt-3 pb-4 flex-shrink-0"
          style={{ background: "#fff", borderTop: "1px solid #EAECEF" }}
        >
          <Link
            href="/cart"
            className="mb-3 block w-full rounded-xl border border-[#C3E8D5] bg-white py-2.5 text-center text-[13px] font-semibold text-[#00A651] transition hover:bg-[#E8F7EF]"
            onClick={() => setIsDrawerOpen(false)}
          >
            View full cart
          </Link>

          <CartOrderSummary
            hasAddress={Boolean(drawerAddressId && deliveryAddresses.length > 0)}
            isLoading={orderSummaryLoading}
            error={orderSummaryError}
            summary={orderSummary}
            cartSubtotal={subtotal}
            deliveryFeeFallback={deliveryFee}
            totalDisplay={total}
          />

          {message && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Link
              href={drawerAddressId ? "/checkout" : "/cart"}
              className="
                flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white
                transition active:brightness-95
              "
              style={{
                background: items.length > 0 && drawerAddressId ? B.primary : "#D1D5DB",
                boxShadow:
                  items.length > 0 && drawerAddressId
                    ? `0 3px 12px rgba(0,166,81,0.28)`
                    : "none",
              }}
              onClick={(e) => {
                if (items.length === 0 || isBusy) {
                  e.preventDefault();
                  return;
                }
                if (!drawerAddressId) {
                  e.preventDefault();
                  setMessage("Select a delivery address to continue.");
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
                h-11 rounded-xl text-[13px] font-semibold
                text-red-500 border border-red-100 bg-white
                hover:bg-red-50 active:bg-red-100
                transition-colors duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Clear cart
            </button>
          </div>
        </div>
      </aside>

      {showAddressModal && isDrawerOpen && (
        <div className="fixed inset-0 z-[74] grid place-items-center px-4">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() => setShowAddressModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-[360px] rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Select delivery address</p>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close address selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {deliveryAddresses.length === 0 ? (
              <p className="text-sm text-gray-600">No delivery addresses found.</p>
            ) : (
              <ul className="max-h-[280px] space-y-2 overflow-y-auto">
                {deliveryAddresses.map((a) => (
                  <li key={a._id}>
                    <label className="flex cursor-pointer gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-2.5 has-[:checked]:border-[#00A651] has-[:checked]:bg-[#E8F7EF]">
                      <input
                        type="radio"
                        name="drawer-cart-address-modal"
                        className="mt-0.5"
                        checked={drawerAddressId === a._id}
                        onChange={() => {
                          onSelectDrawerAddress(a._id);
                          setShowAddressModal(false);
                        }}
                      />
                      <span className="min-w-0 text-[12px] text-gray-800">
                        <span className="line-clamp-2 font-medium">{a.address}</span>
                        {a.description ? (
                          <span className="mt-0.5 block text-[10px] text-gray-500">{a.description}</span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

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
