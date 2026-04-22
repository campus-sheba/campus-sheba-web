"use server";

import type { DeliveryOption, PaymentGateway } from "@/types/cart";
import { getPrivate } from "@/utils/api/get";
import { checkoutEndpoints } from "@/utils/endpoints/endpoints";

const opts = { includeUniversity: false as const };

export async function getAvailablePaymentGatewaysAction(
  featureKey: string,
): Promise<{ success: true; data: PaymentGateway[] } | { success: false; message: string; data: PaymentGateway[] }> {
  try {
    const res = await getPrivate<{ data: PaymentGateway[] }>(
      `${checkoutEndpoints.paymentGateways}?featureKey=${encodeURIComponent(featureKey)}`,
      opts,
    );
    return { success: true, data: Array.isArray(res?.data) ? res.data : [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load payment gateways";
    return { success: false, message, data: [] };
  }
}

export async function getAvailableDeliveryOptionsAction(
  featureKey: string,
): Promise<{ success: true; data: DeliveryOption[] } | { success: false; message: string; data: DeliveryOption[] }> {
  try {
    const res = await getPrivate<{ data: DeliveryOption[] }>(
      `${checkoutEndpoints.deliveryOptions}?featureKey=${encodeURIComponent(featureKey)}`,
      opts,
    );
    return { success: true, data: Array.isArray(res?.data) ? res.data : [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load delivery options";
    return { success: false, message, data: [] };
  }
}
