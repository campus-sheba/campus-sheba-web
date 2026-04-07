"use server";

import { getPublic } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { userEndpoints } from "@/utils/endpoints/endpoints";
import { shopEndpoints } from "@/utils/endpoints/shopEndpoints";
import type { OwnerAddShopPayload, ShopCategory } from "./_components/types";

interface CategoriesApiResponse {
  page: number;
  limit: number;
  total: number;
  data: ShopCategory[];
}

type CategoriesResponseShape =
  | CategoriesApiResponse
  | { data?: CategoriesApiResponse | ShopCategory[] }
  | ShopCategory[];

interface ActionResult<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CreatedShopInfo {
  _id?: string;
  name?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export async function getShopCategoriesAction(
  page = 1,
  limit = 50,
): Promise<ActionResult<ShopCategory[]>> {
  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      type: "Shop",
    });

    const response = await getPublic<CategoriesResponseShape>(
      `${userEndpoints.categories}?${query.toString()}`,
    );

    const categories = extractCategories(response);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch shop categories."),
      data: [],
    };
  }
}

function extractCategories(response: CategoriesResponseShape): ShopCategory[] {
  if (Array.isArray(response)) return response;

  if (response && typeof response === "object") {
    const topLevelData = (response as { data?: unknown }).data;
    if (Array.isArray(topLevelData)) return topLevelData as ShopCategory[];

    if (topLevelData && typeof topLevelData === "object") {
      const nested = (topLevelData as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested as ShopCategory[];
    }
  }

  return [];
}

export async function getShopSubCategoriesAction(
  categoryId: string,
  page = 1,
  limit = 100,
): Promise<ActionResult<ShopCategory[]>> {
  if (!categoryId) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const parameterCandidates = ["parent", "parentId", "category", "categoryId"];

    for (const key of parameterCandidates) {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        type: "Shop",
        [key]: categoryId,
      });

      const response = await getPublic<CategoriesResponseShape>(
        `${userEndpoints.categories}?${query.toString()}`,
      );

      const data = extractCategories(response);
      if (data.length > 0) {
        return {
          success: true,
          data,
        };
      }
    }

    return {
      success: true,
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch sub-categories."),
      data: [],
    };
  }
}

export async function createOwnerShopAction(
  payload: OwnerAddShopPayload,
): Promise<ActionResult<CreatedShopInfo>> {
  try {
    const body = payload as unknown as Record<string, unknown>;
    const response = await postPrivate<{ data?: CreatedShopInfo } | CreatedShopInfo>(
      shopEndpoints.createShop,
      body,
    );

    const createdShop =
      "data" in (response as Record<string, unknown>)
        ? ((response as { data?: CreatedShopInfo }).data ?? {})
        : (response as CreatedShopInfo);

    return {
      success: true,
      data: createdShop,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to create shop."),
    };
  }
}