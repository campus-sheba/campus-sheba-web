import type { Cart, CartItem } from "@/types/cart";

/** API may split cart into `items` and `otherItems` (e.g. shop vs marketplace). */
export function normalizeCartLineItems(cart: Cart | null | undefined): CartItem[] {
  if (!cart) return [];
  const main = Array.isArray(cart.items) ? cart.items : [];
  const other = Array.isArray(cart.otherItems) ? cart.otherItems : [];
  if (other.length === 0) return main;
  const ids = new Set(main.map((i) => i._id));
  const merged = [...main];
  for (const o of other) {
    if (!ids.has(o._id)) merged.push(o);
  }
  return merged;
}
