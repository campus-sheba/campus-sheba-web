/**
 * Campus Sheba brand tokens — single source of truth.
 *
 * The primary brand colour is **red `#E30B12`**, taken from the official logo
 * SVG (see `public/assets/images/logo.svg`) and the design mockups. Earlier
 * surfaces used `#00A651` (green); they have been migrated to use these
 * tokens. New UI should reference these constants instead of hard-coding hex.
 *
 * For Tailwind arbitrary-value classes you can interpolate directly, e.g.
 *   className={`bg-[${BRAND_RED}] text-white`}
 * but prefer plain `bg-[#E30B12]` literals so Tailwind can statically extract
 * the value at build time. These constants exist so brand drift is visible
 * (one place to edit) and so JS-only contexts (inline `style={{}}`) can read
 * a typed value.
 */
export const BRAND_RED = "#E30B12";
export const BRAND_RED_HOVER = "#B70910";
export const BRAND_RED_TINT = "#E30B12";

export const BRAND_NAVY = "#0D1B2A";
export const BRAND_AMBER = "#F5A623";
