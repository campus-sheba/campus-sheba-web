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
import {
  getPublicPromoCodesAction,
  validatePromoCodeAction,
} from "@/services/promoCodes";
import CartLineItems from "@/modules/cart/CartLineItems";
import CartOrderSummary from "@/modules/cart/CartOrderSummary";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import { normalizeCartLineItems } from "@/modules/cart/mergeCartLineItems";
import type { UserAddress } from "@/types/address";
import type { PublicPromoCode } from "@/types/promo";
import type {
  Cart,
  CartDeliveryMethod,
  CartItem,
  CartPaymentGateway,
  CartSavedAddress,
  DeliveryOption,
  OrderSummaryPayload,
  OrderSummaryResponse,
  PaymentGateway,
} from "@/types/cart";

/** Upgrade the compact cart-inline gateway/method shapes to the richer checkout shape. */
function inlineGatewaysToFull(list: CartPaymentGateway[]): PaymentGateway[] {
  return list.map((g) => ({
    _id: g.key,
    key: g.key,
    title: g.title,
    description:
      g.key === "wallet" && typeof g.balance === "number"
        ? `Balance ৳${g.balance.toLocaleString()}`
        : undefined,
    logo: g.logo
      ? { url: g.logo.url, key: g.logo.key, size: g.logo.size }
      : null,
    icon: null,
    paymentType:
      g.key === "sslcommerz"
        ? "Online"
        : g.key === "wallet"
          ? "Wallet"
          : "Offline",
  }));
}
function inlineMethodsToFull(list: CartDeliveryMethod[]): DeliveryOption[] {
  return list.map((d) => ({
    _id: d.key,
    key: d.key,
    title: d.title,
    etaMinutes: d.etaMinutes,
  }));
}
function inlineAddressToUser(a: CartSavedAddress): UserAddress {
  return {
    _id: a._id,
    address: a.address,
    type: (a.type as UserAddress["type"]) ?? "DELIVERY",
    latitude: a.latitude,
    longitude: a.longitude,
    description: a.description,
    isDefault: a.isDefault,
  } as UserAddress;
}

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
    // snake_case (cart API response)
    buy_sell: "buy_sell",
    book: "book",
    campus_mart: "campus_mart",
    food: "food",
    parcel: "parcel",
    skill: "skill",
    // PascalCase (legacy / direct usage)
    BuySell: "buy_sell",
    Book: "book",
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

const B = {
  primary: "#00A651",
  primaryLight: "#E8F7EF",
  primaryBorder: "#C3E8D5",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useAppState();

  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGatewayKey, setSelectedGatewayKey] = useState<string | null>(
    null,
  );
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryKey, setSelectedDeliveryKey] = useState<string | null>(
    null,
  );
  const [checkoutConfigLoading, setCheckoutConfigLoading] = useState(false);

  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponFieldError, setCouponFieldError] = useState<string | null>(null);
  const [publicPromos, setPublicPromos] = useState<PublicPromoCode[]>([]);
  const [publicPromosLoading, setPublicPromosLoading] = useState(false);
  const [deliveryTipStr, setDeliveryTipStr] = useState("0");

  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(
    null,
  );
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [orderSummaryError, setOrderSummaryError] = useState<string | null>(
    null,
  );

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

  const lineItemType = items[0]?.type ?? "buy_sell";
  const featureKey = toFeatureKey(lineItemType);
  const cartType = lineItemType;

  const deliveryTip = useMemo(() => {
    const n = Number.parseFloat(deliveryTipStr);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  }, [deliveryTipStr]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + i.quantity * (i.content.discountPrice || i.content.price),
        0,
      ),
    [items],
  );
  const totalDisplay =
    orderSummary && selectedAddressId ? orderSummary.total : subtotal;

  // Load cart
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
    void loadCartFromServer();
  }, [loadCartFromServer]);

  useEffect(() => {
    const onUpd = () => void loadCartFromServer();
    window.addEventListener(CART_UPDATED_EVENT, onUpd);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpd);
  }, [loadCartFromServer]);

  useEffect(() => {
    if (!isLoggedIn || items.length === 0) {
      setPublicPromos([]);
      return;
    }
    let cancelled = false;
    setPublicPromosLoading(true);
    void (async () => {
      const res = await getPublicPromoCodesAction({
        featureKey,
        page: 1,
        limit: 20,
      });
      if (cancelled) return;
      setPublicPromosLoading(false);
      if (res.success) setPublicPromos(res.data);
      else setPublicPromos([]);
    })();
    return () => {
      cancelled = true;
    };
  }, [featureKey, isLoggedIn, items.length]);

  /**
   * Addresses: prefer the `savedDeliveryAddress` returned inline with GET /cart
   * and skip the separate /addresses round-trip when present.
   */
  useEffect(() => {
    if (!isLoggedIn) return;
    const inline = cart?.savedDeliveryAddress;
    if (inline) {
      const addr = inlineAddressToUser(inline);
      setAddresses([addr]);
      setSelectedAddressId(addr._id);
      CookieHelper.setAddressId(addr._id);
      return;
    }
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
      if (nextId && !cookieOk) CookieHelper.setAddressId(nextId);
    })();
  }, [isLoggedIn, cart?.savedDeliveryAddress]);

  /**
   * Payment gateways + delivery methods: prefer the inline lists returned with
   * GET /cart (which already reflect wallet balance + eligible methods for this
   * cart's contents) and only call the per-feature config APIs as a fallback.
   */
  useEffect(() => {
    if (!featureKey || !isLoggedIn) return;

    const inlineGw = cart?.paymentGateways;
    const inlineDm = cart?.deliveryMethods;
    if (inlineGw && inlineGw.length > 0 && inlineDm && inlineDm.length > 0) {
      const gw = inlineGatewaysToFull(inlineGw);
      const dm = inlineMethodsToFull(inlineDm);
      setGateways(gw);
      setDeliveryOptions(dm);
      setSelectedGatewayKey((prev) => prev ?? gw[0]?.key ?? null);
      setSelectedDeliveryKey((prev) => prev ?? dm[0]?.key ?? null);
      return;
    }

    setCheckoutConfigLoading(true);
    void (async () => {
      const [gwRes, doRes] = await Promise.all([
        getAvailablePaymentGatewaysAction(featureKey),
        getAvailableDeliveryOptionsAction(featureKey),
      ]);
      setCheckoutConfigLoading(false);

      const gw = gwRes.data;
      setGateways(gw);
      if (gw.length > 0 && !selectedGatewayKey)
        setSelectedGatewayKey(gw[0].key);

      const opts = doRes.data;
      setDeliveryOptions(opts);
      if (opts.length > 0 && !selectedDeliveryKey)
        setSelectedDeliveryKey(opts[0].key);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureKey, isLoggedIn, cart?.paymentGateways, cart?.deliveryMethods]);

  // Recalculate order summary whenever key inputs change
  useEffect(() => {
    let cancelled = false;
    if (
      !selectedAddressId ||
      items.length === 0 ||
      !selectedGatewayKey ||
      !selectedDeliveryKey
    ) {
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
  }, [
    cartType,
    items,
    selectedAddressId,
    appliedCoupon,
    deliveryTip,
    selectedGatewayKey,
    selectedDeliveryKey,
  ]);

  const removeItem = async (id: string) => {
    setRemovingId(id);
    const res = await removeCartItemAction(id);
    setRemovingId(null);
    if (res.success) {
      setMessage(null);
      emitCartUpdated();
    } else setMessage(res.message ?? "Failed to remove item.");
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
    const res = await action;
    if (res.success) {
      setMessage(null);
      emitCartUpdated();
    } else setMessage(res.message ?? "Failed to update quantity.");
  };

  const applyValidatedCode = async (raw: string) => {
    const code = raw.trim();
    if (!code.length) {
      setAppliedCoupon(null);
      setCouponFieldError(null);
      setMessage(null);
      return;
    }
    setCouponValidating(true);
    setCouponFieldError(null);
    setMessage(null);
    const res = await validatePromoCodeAction({
      code,
      moduleType: featureKey,
      orderSubtotal: subtotal,
    });
    setCouponValidating(false);
    if (res.success && res.data) {
      setAppliedCoupon(res.data.code);
      setCouponDraft(res.data.code);
      setCouponFieldError(null);
    } else {
      setAppliedCoupon(null);
      setCouponFieldError(res.message ?? "This code cannot be applied.");
    }
  };

  const onApplyCoupon = () => {
    void applyValidatedCode(couponDraft);
  };

  const onClearCoupon = () => {
    setAppliedCoupon(null);
    setCouponDraft("");
    setCouponFieldError(null);
    setMessage(null);
  };

  const onPickPublicPromo = (code: string) => {
    setCouponDraft(code);
    void applyValidatedCode(code);
  };

  const onPlaceOrder = async () => {
    if (!selectedAddressId || items.length === 0) {
      setMessage(
        "Select a delivery address and keep at least one item in your cart.",
      );
      return;
    }
    if (!selectedGatewayKey) {
      setMessage("Select a payment method.");
      return;
    }
    if (!selectedDeliveryKey) {
      setMessage("Select a delivery option.");
      return;
    }

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
      items: items.map((item) => ({
        id: item.content._id,
        quantity: item.quantity,
      })),
    };

    const res = await placeOrderAction(payload);
    setSubmitting(false);

    if (res.success) {
      emitCartUpdated();
      if (res.requiresRedirect && res.paymentUrl) {
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
        <Link
          href="/cart"
          className="mt-3 inline-flex text-sm font-semibold text-[#00A651] underline"
        >
          Back to cart
        </Link>
      </ContentWrapper>
    );
  }

  const selectedGateway = gateways.find((g) => g.key === selectedGatewayKey);
  const isOnlineGateway = selectedGateway?.paymentType === "Online";

  return (
    <ContentWrapper
      maxWidth="full"
      padding="lg"
      className="mx-auto max-w-7xl pb-24"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#00A651]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cart Items */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              Order Items
            </h2>
            <CartLineItems
              items={items}
              removingId={removingId}
              onChangeQty={updateQty}
              onRemove={removeItem}
            />
          </section>

          {/* Address */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              Delivery Address
            </h2>

            {deliveryAddresses.length === 0 ? (
              <p className="text-sm text-gray-600">
                No address found.{" "}
                <Link href="/my-addresses" className="text-[#00A651] underline">
                  Add address
                </Link>
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {deliveryAddresses.map((a) => (
                  <label
                    key={a._id}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      selectedAddressId === a._id
                        ? "border-[#00A651] bg-[#E8F7EF]"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={selectedAddressId === a._id}
                      onChange={() => setSelectedAddressId(a._id)}
                    />
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                      {a.address}
                    </p>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Delivery + Payment in Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">
                Delivery Option
              </h2>

              <div className="space-y-2">
                {deliveryOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedDeliveryKey(opt.key)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selectedDeliveryKey === opt.key
                        ? "border-[#00A651] bg-[#E8F7EF]"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">{opt.title}</p>
                    <p className="text-xs text-gray-500">
                      {etaLabel(opt.etaMinutes)}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">
                Payment Method
              </h2>

              <div className="space-y-2">
                {gateways.map((gw) => (
                  <button
                    key={gw.key}
                    onClick={() => setSelectedGatewayKey(gw.key)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 ${
                      selectedGatewayKey === gw.key
                        ? "border-[#00A651] bg-[#E8F7EF]"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="h-8 w-8 bg-gray-100 rounded-md" />
                    <p className="text-sm font-medium">{gw.title}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Coupon + Tip */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              Offers & Tip
            </h2>

            <div className="flex gap-2">
              <input
                value={couponDraft}
                onChange={(e) => setCouponDraft(e.target.value)}
                placeholder="Promo code"
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <button className="rounded-xl bg-[#00A651] px-4 text-sm text-white">
                Apply
              </button>
            </div>

            <input
              type="number"
              value={deliveryTipStr}
              onChange={(e) => setDeliveryTipStr(e.target.value)}
              className="mt-3 w-40 rounded-xl border px-3 py-2 text-sm"
              placeholder="Tip amount"
            />
          </section>
        </div>

        {/* RIGHT SIDE (Sticky Summary) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <CartOrderSummary
              hasAddress={Boolean(selectedAddressId)}
              isLoading={orderSummaryLoading}
              error={orderSummaryError}
              summary={orderSummary}
              cartSubtotal={subtotal}
              deliveryFeeFallback={0}
              totalDisplay={totalDisplay}
            />

            <button
              disabled={submitting}
              onClick={() => void onPlaceOrder()}
              className="w-full h-12 rounded-xl bg-[#00A651] text-white font-bold shadow-md"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}
