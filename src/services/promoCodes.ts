"use server";

import type { PublicPromoCodesPage, ValidatePromoResponse } from "@/types/promo";
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { promoCodeEndpoints } from "@/utils/endpoints/endpoints";

const opts = { includeUniversity: false as const };

export async function getPublicPromoCodesAction(params: {
  featureKey: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const q = new URLSearchParams({
    featureKey: params.featureKey,
    page: String(page),
    limit: String(limit),
  });
  try {
    const response = await getPrivate<PublicPromoCodesPage>(
      `${promoCodeEndpoints.public}?${q.toString()}`,
      opts,
    );
    return {
      success: true as const,
      data: response?.data ?? [],
      page: response?.page ?? page,
      total: response?.total ?? 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load promo codes";
    return { success: false as const, message, data: [] as PublicPromoCodesPage["data"], total: 0 };
  }
}

export async function validatePromoCodeAction(input: {
  code: string;
  moduleType: string;
  orderSubtotal: number;
}) {
  try {
    const response = await postPrivate<{ data: ValidatePromoResponse }>(
      promoCodeEndpoints.validate,
      {
        code: input.code,
        moduleType: input.moduleType,
        orderSubtotal: input.orderSubtotal,
      },
      opts,
    );
    const data = response?.data;
    if (!data?.code) {
      return { success: false as const, message: "Invalid promo response", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not validate promo code";
    return { success: false as const, message, data: null };
  }
}
