/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContentWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cartEvents";
import { getAddressesAction } from "@/services/addresses";
import {
  clearCartAction,
  createOrderSummaryAction,
  decreaseCartItemAction,
  getCartAction,
  getChargeByTypeAction,
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import CartLineItems from "@/modules/cart/CartLineItems";
import CartOrderSummary from "@/modules/cart/CartOrderSummary";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import type { UserAddress } from "@/types/address";
import type {
  CartItem,
  ChargeConfig,
  ChargeType,
  OrderSummaryResponse,
} from "@/types/cart";

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
};

export default function CartPage() {
  const { state } = useAppState();
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [chargeConfig, setChargeConfig] = useState<ChargeConfig | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(
    null,
  );
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [orderSummaryError, setOrderSummaryError] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const isLoggedIn = Boolean(getCookieValue("user"));
  const deliveryAddresses = useMemo(
    () => addresses.filter((a) => a.type === "DELIVERY"),
    [addresses],
  );

  const selectedUniversityId =
    state.university.selected?._id ??
    state.user.profile?.university?._id ??
    getCookieValue("universityId");

  const lineItemType = items[0]?.type ?? "buy_sell";
  const cartType = lineItemType;
  const chargeType: ChargeType =
    lineItemType === "book" ? "Book" : lineItemType === "campus_mart" ? "Product" : "BuySell";

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + i.quantity * (i.content.discountPrice || i.content.price),
        0,
      ),
    [items],
  );
  const deliveryFee = chargeConfig?.shipping?.basedPrice ?? 0;
  const totalDisplay =
    orderSummary && selectedAddressId
      ? orderSummary.total
      : subtotal + deliveryFee;

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

  useEffect(() => {
    if (!isLoggedIn) return;
    void (async () => {
      const r = await getAddressesAction();
      if (!r.success) return;
      setAddresses(r.data);
      const cookieId = CookieHelper.getAddressId();
      const delivery = r.data.filter((a) => a.type === "DELIVERY");
      const cookieOk = Boolean(
        cookieId && delivery.some((a) => a._id === cookieId),
      );
      const nextId = cookieOk ? cookieId : pickDefaultDeliveryAddressId(r.data);
      setSelectedAddressId(nextId);
      if (nextId && !cookieOk) {
        CookieHelper.setAddressId(nextId);
      }
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!selectedUniversityId) return;
    void (async () => {
      const res = await getChargeByTypeAction(chargeType, selectedUniversityId);
      if (res.success) setChargeConfig(res.data);
    })();
  }, [chargeType, selectedUniversityId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!selectedAddressId || items.length === 0) {
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
        addressId: selectedAddressId,
        paymentGatewayKey: "cod",
        deliveryOptionKey: "regular",
        deliveryTip: 0,
        ...(appliedCoupon ? { code: appliedCoupon } : {}),
        items: items.map((item) => ({
          id: item.content._id,
          quantity: item.quantity,
        })),
      };
      const summary = await createOrderSummaryAction(payload);
      if (cancelled) return;
      setOrderSummaryLoading(false);
      if (summary.success && summary.data) {
        setOrderSummary(summary.data);
        setOrderSummaryError(null);
      } else {
        setOrderSummary(null);
        setOrderSummaryError(
          summary.message ?? "Could not load order summary.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartType, items, selectedAddressId, appliedCoupon]);

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

  const onSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    CookieHelper.setAddressId(id);
    setMessage(null);
  };

  const onApplyCoupon = () => {
    const code = couponDraft.trim();
    setAppliedCoupon(code.length ? code : null);
    setMessage(null);
  };

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

  if (!isLoggedIn) {
    return (
      <ContentWrapper maxWidth="full" padding="lg" className="mx-auto max-w-lg">
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sign in to view your cart and delivery addresses.
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
          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <MapPin className="h-4 w-4 text-[#00A651]" strokeWidth={2} />
              Delivery address
            </div>
            {deliveryAddresses.length === 0 ? (
              <p className="text-[13px] text-gray-600">
                No delivery addresses yet.{" "}
                <Link
                  href="/my-addresses"
                  className="font-semibold text-[#00A651] underline"
                >
                  Add one
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {deliveryAddresses.map((a) => (
                  <li key={a._id}>
                    <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 has-[:checked]:border-[#00A651] has-[:checked]:bg-[#E8F7EF]">
                      <input
                        type="radio"
                        name="cart-address"
                        className="mt-1"
                        checked={selectedAddressId === a._id}
                        onChange={() => onSelectAddress(a._id)}
                      />
                      <span className="min-w-0 text-[13px] text-gray-800">
                        <span className="line-clamp-2 font-medium">
                          {a.address}
                        </span>
                        {a.description ? (
                          <span className="mt-1 block text-[11px] text-gray-500">
                            {a.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/my-addresses"
              className="mt-3 inline-block text-[12px] font-semibold text-[#00A651] underline"
            >
              Manage addresses
            </Link>
          </section>

          <section
            className="mt-4 rounded-2xl border p-4"
            style={{ borderColor: B.primaryBorder, background: B.primaryLight }}
          >
            <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <Tag className="h-4 w-4 text-[#00A651]" strokeWidth={2} />
              Coupon code
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponDraft}
                onChange={(e) => setCouponDraft(e.target.value)}
                placeholder="e.g. SHUKHEE10"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#00A651]"
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                className="shrink-0 rounded-xl bg-[#00A651] px-4 py-2.5 text-[13px] font-bold text-white active:brightness-95"
              >
                Apply
              </button>
            </div>
            {appliedCoupon ? (
              <p className="mt-2 text-[11px] text-gray-600">
                Applied:{" "}
                <span className="font-semibold text-gray-800">
                  {appliedCoupon}
                </span>{" "}
                — change the code and tap Apply again to replace.
              </p>
            ) : null}
          </section>

          <CartOrderSummary
            hasAddress={Boolean(selectedAddressId)}
            isLoading={orderSummaryLoading}
            error={orderSummaryError}
            summary={orderSummary}
            cartSubtotal={subtotal}
            deliveryFeeFallback={deliveryFee}
            totalDisplay={totalDisplay}
          />

          {message && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              {message}
            </p>
          )}

          <div className="grid gap-2">
            <Link
              href="/checkout"
              className="
                flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white
                transition active:brightness-95
              "
              style={{
                background: selectedAddressId ? B.primary : "#D1D5DB",
                boxShadow: selectedAddressId
                  ? `0 3px 12px rgba(0,166,81,0.28)`
                  : "none",
              }}
              onClick={(e) => {
                if (!selectedAddressId) {
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
