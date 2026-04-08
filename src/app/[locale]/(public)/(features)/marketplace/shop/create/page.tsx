"use client";

import { useEffect, useMemo, useState } from "react";
import DynamicShopCreateForm from "./_components/DynamicShopCreateForm";
import ShopCreateIntro from "./_components/ShopCreateIntro";
import type { ShopCategory, ShopCreateCategoryOption } from "./_components/types";
import { getShopCategoriesAction } from "./actions";
import { usePathname } from "@/i18n/navigation";

const CATEGORY_DEFINITIONS: Array<Pick<ShopCreateCategoryOption, "kind" | "label" | "description">> = [
  {
    kind: "Food",
    label: "Food",
    description: "Meals, snacks, pre-orders, and campus food services.",
  },
  {
    kind: "Product",
    label: "Product",
    description: "Fashion, gadgets, accessories, and physical products.",
  },
  {
    kind: "Service",
    label: "Skill / Service",
    description: "Design, tutoring, editing, creative, and other service-based work.",
  },
];

const normalizeTitle = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const findMatchingCategoryId = (kind: ShopCreateCategoryOption["kind"], categories: ShopCategory[]) => {
  const matchingTerms =
    kind === "Service" ? ["service", "skill"] : [kind.toLowerCase()];

  const matchedCategory = categories.find((category) => {
    const normalizedTitle = normalizeTitle(category.title);
    return matchingTerms.some((term) => normalizedTitle.includes(term));
  });

  return matchedCategory?._id ?? "";
};

export default function CreateShopPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ShopCreateCategoryOption | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);
      const response = await getShopCategoriesAction(1, 100);

      if (!mounted) return;

      if (response.success && response.data) {
        setCategories(response.data);
        setCategoriesError(response.data.length ? null : "Unable to map the supported shop categories from the API response.");
      } else {
        setCategories([]);
        setCategoriesError(response.message ?? "Unable to load shop categories right now.");
      }

      setCategoriesLoading(false);
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo<ShopCreateCategoryOption[]>(
    () =>
      CATEGORY_DEFINITIONS.map((definition) => {
        const categoryId = findMatchingCategoryId(definition.kind, categories);

        return {
          ...definition,
          categoryId,
          available: Boolean(categoryId),
        };
      }),
    [categories],
  );

  if (selectedCategory) {
    return (
      <DynamicShopCreateForm
        locale={locale}
        selectedCategory={selectedCategory}
        onBackToIntro={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <ShopCreateIntro
      categories={categoryOptions}
      categoriesLoading={categoriesLoading}
      categoriesError={categoriesError}
      onStart={(category) => {
        if (!category.available) return;
        setSelectedCategory(category);
      }}
    />
  );
}
