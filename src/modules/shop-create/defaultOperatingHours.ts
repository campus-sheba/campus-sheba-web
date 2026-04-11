import type { ShopOperatingDayPayload } from "@/types/shop-create";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Sensible defaults; owners can adjust after approval if needed */
export function buildDefaultOperatingHours(): ShopOperatingDayPayload[] {
  return DAYS.map((day) => ({
    day,
    isClosed: day === "Friday" || day === "Saturday",
    slots:
      day === "Friday" || day === "Saturday"
        ? []
        : [
            { open: "09:00", close: "12:00" },
            { open: "14:00", close: "18:00" },
          ],
  }));
}
