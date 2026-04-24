"use client";

import Image from "next/image";
import { AlertCircle, Minus, Package, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/cart";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

/** Cart API may return a singular `photo` object or the legacy `photos` array. */
function pickCartPhoto(content: CartItem["content"]): string | undefined {
  return content.photo?.url ?? content.photos?.[0]?.url;
}

function shopNameOf(content: CartItem["content"]): string | undefined {
  const shop = content.shop;
  if (shop && typeof shop === "object" && typeof shop.name === "string") {
    return shop.name;
  }
  return undefined;
}

const B = {
  primary: "#00A651",
  primaryLight: "#E8F7EF",
};

type Props = {
  items: CartItem[];
  removingId: string | null;
  onChangeQty: (lineId: string, nextQty: number) => void;
  onRemove: (lineId: string) => void;
  emptyHint?: string;
};

export default function CartLineItems({
  items,
  removingId,
  onChangeQty,
  onRemove,
  emptyHint = "Add items from the menu to get started.",
}: Props) {
  if (items.length === 0) {
    return (
      <div
        className="mt-2 rounded-2xl flex flex-col items-center text-center py-10 px-6"
        style={{ background: "#fff", border: "1.5px dashed #E0E3E7" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: B.primaryLight }}
        >
          <Package className="w-6 h-6" style={{ color: B.primary }} strokeWidth={1.8} />
        </div>
        <p className="text-[13px] font-semibold text-gray-700">Your cart is empty</p>
        <p className="text-[12px] text-gray-400 mt-1 max-w-[220px] leading-relaxed">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const photoUrl = pickCartPhoto(item.content);
        const unit = item.content.discountPrice || item.content.price;
        const shopName = shopNameOf(item.content);
        const unavailable = item.isAvailableForCheckout === false;
        return (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-xl p-3 transition-all duration-[260ms]"
            style={{
              background: "#fff",
              border: "1px solid #EAECEF",
              opacity: removingId === item._id ? 0 : 1,
              transform: removingId === item._id ? "translateX(14px)" : "translateX(0)",
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-100 overflow-hidden">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={item.content.title}
                  width={44}
                  height={44}
                  unoptimized={shouldUnoptimizeRemoteImage(photoUrl)}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-2xl">🛒</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-800 truncate">{item.content.title}</p>
              {shopName ? (
                <p className="text-[10px] text-gray-400 truncate">{shopName}</p>
              ) : null}
              <p className="text-[11px] text-gray-400 mt-0.5">৳{unit} each</p>
              {unavailable && item.availabilityReason ? (
                <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  {item.availabilityReason}
                </p>
              ) : null}

              <div className="mt-2 flex items-center justify-between">
                <div
                  className="flex items-center gap-1 rounded-lg px-1 py-[3px]"
                  style={{
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onChangeQty(item._id, item.quantity - 1)}
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                  <span className="w-5 text-center text-[12px] font-bold text-gray-800 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(item._id, item.quantity + 1)}
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-gray-800 tabular-nums">
                    ৳{unit * item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item._id)}
                    className="
                      w-7 h-7 rounded-lg flex items-center justify-center
                      text-gray-300 hover:text-red-500 hover:bg-red-50
                      transition-all duration-150
                    "
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
