"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ContentWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cartEvents";
import { getAddressesAction } from "@/services/addresses";
import {
  createOrderSummaryAction,
  decreaseCartItemAction,
  getCartAction,
  getChargeByTypeAction,
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import { placeOrderAction } from "@/services/orders";
import CartLineItems from "@/modules/cart/CartLineItems";
import CartOrderSummary from "@/modules/cart/CartOrderSummary";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import type { UserAddress } from "@/types/address";
import type {
  CartItem,
  ChargeConfig,
  ChargeType,
  OrderSummaryPayload,
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

const B = { primary: "#00A651", primaryLight: "#E8F7EF", primaryBorder: "#C3E8D5" };

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useAppState();
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"COD" | "ONLINE">("COD");
  const [deliveryTipStr, setDeliveryTipStr] = useState("0");
  const [chargeConfig, setChargeConfig] = useState<ChargeConfig | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(null);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [orderSummaryError, setOrderSummaryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  const lineItemType = items[0]?.type ?? "BuySell";
  const cartType = (lineItemType === "Book" ? "Book" : "BuySell") as "Book" | "BuySell";
  const chargeType: ChargeType =
    lineItemType === "Book" ? "Book" : lineItemType === "Product" ? "Product" : "BuySell";

  const deliveryTip = useMemo(() => {
    const n = Number.parseFloat(deliveryTipStr);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  }, [deliveryTipStr]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * (i.content.discountPrice || i.content.price), 0),
    [items],
  );
  const deliveryFee = chargeConfig?.shipping?.basedPrice ?? 0;
  const totalDisplay =
    orderSummary && selectedAddressId ? orderSummary.total : subtotal + deliveryFee;

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
    const onUpd = () => void loadCartFromServer();
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
      const cookieOk = Boolean(cookieId && delivery.some((a) => a._id === cookieId));
      const nextId = cookieOk ? cookieId : pickDefaultDeliveryAddressId(r.data);
      setSelectedAddressId(nextId);
      if (nextId && !cookieOk) CookieHelper.setAddressId(nextId);
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
      setOrderSummaryLoading(true);
      setOrderSummaryError(null);
      const payload: OrderSummaryPayload = {
        type: cartType,
        rentalType: "Normal",
        addressId: selectedAddressId,
        deliveryType,
        deliveryTip,
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
  }, [cartType, items, selectedAddressId, appliedCoupon, deliveryType, deliveryTip]);

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
      setMessage(response.message ?? "Failed to remove item.");
    }
  };

  const updateQty = async (id: string, next: number) => {
    const target = items.find((i) => i._id === id);
    if (!target) return;
    if (next <= 0) {
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

  const onPlaceOrder = async () => {
    if (!selectedAddressId || items.length === 0) {
      setMessage("Select a delivery address and keep at least one item in your cart.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const payload: OrderSummaryPayload = {
      type: cartType,
      rentalType: "Normal",
      addressId: selectedAddressId,
      deliveryType,
      deliveryTip,
      ...(appliedCoupon ? { code: appliedCoupon } : {}),
      items: items.map((item) => ({ id: item.content._id, quantity: item.quantity })),
    };
    const res = await placeOrderAction(payload);
    setSubmitting(false);
    if (res.success) {
      emitCartUpdated();
      router.push("/my-orders");
    } else {
      setMessage(res.message ?? "Could not place order.");
    }
  };

  if (!isLoggedIn) {
    return (
      <ContentWrapper maxWidth="full" padding="lg" className="mx-auto max-w-lg">
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Please sign in to complete checkout.
        </p>
      </ContentWrapper>
    );
  }

  if (items.length === 0) {
    return (
      <ContentWrapper maxWidth="full" padding="lg" className="mx-auto max-w-xl">
        <p className="text-sm text-gray-600">Your cart is empty.</p>
        <Link href="/cart" className="mt-3 inline-flex text-sm font-semibold text-[#00A651] underline">
          Back to cart
        </Link>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper maxWidth="full" padding="lg" className="mx-auto max-w-xl pb-24">
      <Link
        href="/cart"
        className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-[#00A651]"
      >
        <ArrowLeft className="h-4 w-4" />
        Edit cart
      </Link>

      <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-[13px] text-gray-500">Confirm delivery and place your order.</p>

      <div className="mt-6">
        <CartLineItems
          items={items}
          removingId={removingId}
          onChangeQty={updateQty}
          onRemove={removeItem}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[13px] font-semibold text-gray-800">Delivery address</p>
        {deliveryAddresses.length === 0 ? (
          <p className="text-[13px] text-gray-600">
            Add a delivery address first.{" "}
            <Link href="/my-addresses" className="font-semibold text-[#00A651] underline">
              Manage addresses
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {deliveryAddresses.map((a) => (
              <li key={a._id}>
                <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 has-[:checked]:border-[#00A651] has-[:checked]:bg-[#E8F7EF]">
                  <input
                    type="radio"
                    name="checkout-address"
                    className="mt-1"
                    checked={selectedAddressId === a._id}
                    onChange={() => onSelectAddress(a._id)}
                  />
                  <span className="min-w-0 text-[13px] text-gray-800">
                    <span className="line-clamp-2 font-medium">{a.address}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[13px] font-semibold text-gray-800">Payment &amp; delivery</p>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[13px]">
              <input
                type="radio"
                name="delivery-type"
                checked={deliveryType === "COD"}
                onChange={() => setDeliveryType("COD")}
              />
              Cash on delivery (COD)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[13px]">
              <input
                type="radio"
                name="delivery-type"
                checked={deliveryType === "ONLINE"}
                onChange={() => setDeliveryType("ONLINE")}
              />
              Online payment
            </label>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-600">Delivery tip (optional)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={deliveryTipStr}
              onChange={(e) => setDeliveryTipStr(e.target.value)}
              className="mt-1 w-full max-w-[200px] rounded-xl border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#00A651]"
            />
          </div>
        </div>
      </section>

      <section
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: B.primaryBorder, background: B.primaryLight }}
      >
        <p className="mb-2 text-[13px] font-semibold text-gray-800">Coupon code</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponDraft}
            onChange={(e) => setCouponDraft(e.target.value)}
            placeholder="Optional"
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
            Applied: <span className="font-semibold">{appliedCoupon}</span>
          </p>
        ) : null}
      </section>

      <CartOrderSummary
        hasAddress={Boolean(selectedAddressId && deliveryAddresses.length > 0)}
        isLoading={orderSummaryLoading}
        error={orderSummaryError}
        summary={orderSummary}
        cartSubtotal={subtotal}
        deliveryFeeFallback={deliveryFee}
        totalDisplay={totalDisplay}
      />

      {message ? (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{message}</p>
      ) : null}

      <button
        type="button"
        disabled={submitting || !selectedAddressId}
        onClick={() => void onPlaceOrder()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition active:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-300"
        style={{
          background: selectedAddressId && !submitting ? B.primary : "#D1D5DB",
          boxShadow:
            selectedAddressId && !submitting ? `0 3px 12px rgba(0,166,81,0.28)` : "none",
        }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Placing order…
          </>
        ) : (
          "Place order"
        )}
      </button>
    </ContentWrapper>
  );
}
