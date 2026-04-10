/** Dispatched after cart mutations so floating cart and /cart page stay in sync. */
export const CART_UPDATED_EVENT = "campus-sheba:cart-updated";

export function emitCartUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
