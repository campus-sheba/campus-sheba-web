"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Clock, Loader2, Truck } from "lucide-react";
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
  increaseCartItemAction,
  removeCartItemAction,
} from "@/services/cart";
import {
  getAvailableDeliveryOptionsAction,
  getAvailablePaymentGatewaysAction,
} from "@/services/checkout";
import { placeOrderAction } from "@/services/orders";
import CartLineItems from "@/modules/cart/CartLineItems";
import CartOrderSummary from "@/modules/cart/CartOrderSummary";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import type { UserAddress } from "@/types/address";
import type {
  CartItem,
  DeliveryOption,
  OrderSummaryPayload,
  OrderSummaryResponse,
  PaymentGateway,
} from "@/types/cart";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function toFeatureKey(itemType: string): string {
  const map: Record<string, string> = {
    Book: "book",
    BuySell: "buy_sell",
    Product: "campus_mart",
    Food: "food",
    Parcel: "parcel",
  };
  return map[itemType] ?? "buy_sell";
}

function etaLabel(etaMinutes?: number): string {
  if (!etaMinutes) return "";
  if (etaMinutes < 60) return `~${etaMinutes} min`;
  const h = Math.round(etaMinutes / 60);
  return h === 24 ? "~24 hrs" : `~${h} hr${h > 1 ? "s" : ""}`;
}

const B = { primary: "#00A651", primaryLight: "#E8F7EF", primaryBorder: "#C3E8D5" };

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useAppState();

  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryKey, setSelectedDeliveryKey] = useState<string | null>(null);
  const [checkoutConfigLoading, setCheckoutConfigLoading] = useState(false);

  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryTipStr, setDeliveryTipStr] = useState("0");

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
  const featureKey = toFeatureKey(lineItemType);
  const cartType = lineItemType === "Book" ? "Book" : "BuySell";

  const deliveryTip = useMemo(() => {
    const n = Number.parseFloat(deliveryTipStr);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  }, [deliveryTipStr]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * (i.content.discountPrice || i.content.price), 0),
    [items],
  );
  const totalDisplay =
    orderSummary && selectedAddressId ? orderSummary.total : subtotal;

  // Load cart
  const loadCartFromServer = useCallback(async () => {
    const res = await getCartAction();
    if (res.success && res.data) setItems(normalizeCartLineItems(res.data));
    else setItems([]);
  }, []);

  useEffect(() => { void loadCartFromServer(); }, [loadCartFromServer]);

  useEffect(() => {
    const onUpd = () => void loadCartFromServer();
    window.addEventListener(CART_UPDATED_EVENT, onUpd);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpd);
  }, [loadCartFromServer]);

  // Load addresses
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

  // Load payment gateways + delivery options whenever featureKey changes
  useEffect(() => {
    if (!featureKey || !isLoggedIn) return;
    setCheckoutConfigLoading(true);
    void (async () => {
      const [gwRes, doRes] = await Promise.all([
        getAvailablePaymentGatewaysAction(featureKey),
        getAvailableDeliveryOptionsAction(featureKey),
      ]);
      setCheckoutConfigLoading(false);

      const gw = gwRes.data;
      setGateways(gw);
      if (gw.length > 0 && !selectedGatewayKey) {
        setSelectedGatewayKey(gw[0].key);
      }

      const opts = doRes.data;
      setDeliveryOptions(opts);
      if (opts.length > 0 && !selectedDeliveryKey) {
        setSelectedDeliveryKey(opts[0].key);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureKey, isLoggedIn]);

  // Recalculate order summary whenever key inputs change
  useEffect(() => {
    let cancelled = false;
    if (!selectedAddressId || items.length === 0 || !selectedGatewayKey || !selectedDeliveryKey) {
      setOrderSummary(null);
      setOrderSummaryError(null);
      setOrderSummaryLoading(false);
      return;
    }
    setOrderSummaryLoading(true);
    setOrderSummaryError(null);

    void (async () => {
      const payload: OrderSummaryPayload = {
        type: cartType,
        rentalType: "Normal",
        addressId: selectedAddressId,
        paymentGatewayKey: selectedGatewayKey,
        deliveryOptionKey: selectedDeliveryKey,
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
    return () => { cancelled = true; };
  }, [cartType, items, selectedAddressId, appliedCoupon, deliveryTip, selectedGatewayKey, selectedDeliveryKey]);

  const removeItem = async (id: string) => {
    setRemovingId(id);
    const res = await removeCartItemAction(id);
    setRemovingId(null);
    if (res.success) { setMessage(null); emitCartUpdated(); }
    else setMessage(res.message ?? "Failed to remove item.");
  };

  const updateQty = async (id: string, next: number) => {
    const target = items.find((i) => i._id === id);
    if (!target) return;
    if (next <= 0) { await removeItem(id); return; }
    const action = next > target.quantity
      ? increaseCartItemAction(target.content._id)
      : decreaseCartItemAction(target.content._id);
    const res = await action;
    if (res.success) { setMessage(null); emitCartUpdated(); }
    else setMessage(res.message ?? "Failed to update quantity.");
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
    if (!selectedGatewayKey) { setMessage("Select a payment method."); return; }
    if (!selectedDeliveryKey) { setMessage("Select a delivery option."); return; }

    setSubmitting(true);
    setMessage(null);

    const payload: OrderSummaryPayload = {
      type: cartType,
      rentalType: "Normal",
      addressId: selectedAddressId,
      paymentGatewayKey: selectedGatewayKey,
      deliveryOptionKey: selectedDeliveryKey,
      deliveryTip,
      ...(appliedCoupon ? { code: appliedCoupon } : {}),
      items: items.map((item) => ({ id: item.content._id, quantity: item.quantity })),
    };

    const res = await placeOrderAction(payload);
    setSubmitting(false);

    if (res.success) {
      emitCartUpdated();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        router.push("/my-orders");
      }
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

  const selectedGateway = gateways.find((g) => g.key === selectedGatewayKey);
  const isOnlineGateway = selectedGateway?.paymentType === "Online";

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

      {/* Delivery address */}
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
                    className="mt-0.5"
                    checked={selectedAddressId === a._id}
                    onChange={() => { setSelectedAddressId(a._id); CookieHelper.setAddressId(a._id); setMessage(null); }}
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

      {/* Delivery options */}
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-[#00A651]" />
          <p className="text-[13px] font-semibold text-gray-800">Delivery option</p>
        </div>
        {checkoutConfigLoading ? (
          <div className="flex gap-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 flex-1 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : deliveryOptions.length === 0 ? (
          <p className="text-[13px] text-gray-500">No delivery options available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {deliveryOptions.map((opt) => {
              const active = selectedDeliveryKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedDeliveryKey(opt.key)}
                  className={`flex flex-1 min-w-[140px] flex-col gap-0.5 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-[#00A651] bg-[#E8F7EF]"
                      : "border-gray-200 bg-gray-50/60 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-gray-900">{opt.title}</span>
                    {active && <CheckCircle2 className="h-3.5 w-3.5 text-[#00A651] flex-shrink-0" />}
                  </div>
                  {opt.etaMinutes ? (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock className="h-3 w-3" />
                      {etaLabel(opt.etaMinutes)}
                    </span>
                  ) : null}
                  {opt.description ? (
                    <span className="text-[11px] text-gray-400 line-clamp-1">{opt.description}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Payment gateways */}
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[13px] font-semibold text-gray-800">Payment method</p>
        {checkoutConfigLoading ? (
          <div className="flex gap-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 flex-1 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : gateways.length === 0 ? (
          <p className="text-[13px] text-gray-500">No payment methods available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {gateways.map((gw) => {
              const active = selectedGatewayKey === gw.key;
              const logoUrl = gw.icon?.url ?? gw.logo?.url;
              return (
                <button
                  key={gw.key}
                  type="button"
                  onClick={() => setSelectedGatewayKey(gw.key)}
                  className={`flex flex-1 min-w-[140px] items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-[#00A651] bg-[#E8F7EF]"
                      : "border-gray-200 bg-gray-50/60 hover:border-gray-300"
                  }`}
                >
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={gw.title}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gray-200 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-gray-900 truncate">{gw.shortLabel ?? gw.title}</p>
                    {gw.description ? (
                      <p className="text-[10px] text-gray-400 line-clamp-1">{gw.description}</p>
                    ) : null}
                  </div>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-[#00A651] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
        {isOnlineGateway ? (
          <p className="mt-2 text-[11px] text-gray-500">
            You will be redirected to the payment page after placing your order.
          </p>
        ) : null}
      </section>

      {/* Delivery tip */}
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <label className="block text-[13px] font-semibold text-gray-800">
          Delivery tip <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={deliveryTipStr}
          onChange={(e) => setDeliveryTipStr(e.target.value)}
          className="mt-2 w-full max-w-[180px] rounded-xl border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#00A651]"
          placeholder="0"
        />
      </section>

      {/* Coupon */}
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
        deliveryFeeFallback={0}
        totalDisplay={totalDisplay}
      />

      {message ? (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{message}</p>
      ) : null}

      <button
        type="button"
        disabled={submitting || !selectedAddressId || !selectedGatewayKey || !selectedDeliveryKey}
        onClick={() => void onPlaceOrder()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition active:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-300"
        style={{
          background:
            selectedAddressId && selectedGatewayKey && selectedDeliveryKey && !submitting
              ? B.primary
              : "#D1D5DB",
          boxShadow:
            selectedAddressId && selectedGatewayKey && selectedDeliveryKey && !submitting
              ? "0 3px 12px rgba(0,166,81,0.28)"
              : "none",
        }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {isOnlineGateway ? "Redirecting to payment…" : "Placing order…"}
          </>
        ) : isOnlineGateway ? (
          "Continue to payment"
        ) : (
          "Place order"
        )}
      </button>
    </ContentWrapper>
  );
}
