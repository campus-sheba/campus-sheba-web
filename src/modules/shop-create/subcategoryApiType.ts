/**
 * Shop row from GET /user/categories?type=Shop uses `title` (Food, Product, Service, Logistics).
 * Subcategories come from GET /user/categories?type=<X> where X matches inventory taxonomy.
 */
export function subcategoryListTypeForShopTitle(title: string): string | null {
  const t = title.trim().toLowerCase();
  if (t === "food") return "Food";
  if (t === "product") return "Product";
  if (t === "service") return "Skill";
  if (t === "logistics") return "Logistics";
  return null;
}

export function defaultFlagsForShopTitle(title: string): { isAggregator: boolean; isSkillBased: boolean } {
  const t = title.trim().toLowerCase();
  if (t === "logistics") return { isAggregator: true, isSkillBased: false };
  if (t === "service") return { isAggregator: false, isSkillBased: true };
  return { isAggregator: false, isSkillBased: false };
}
