import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { MarketplaceProduct } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  product: MarketplaceProduct;
  negotiableLabel: string;
  featuredLabel?: string;
};

export default function RetailProductCard({
  product,
  negotiableLabel,
  featuredLabel = "Featured",
}: Props) {
  const photo = product.photos?.[0]?.url || "/placeholder.jpg";
  const hasDiscount =
    product.discountPrice != null &&
    product.price != null &&
    product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : (product.price ?? product.discountPrice);
  const compareAt = hasDiscount ? product.price : undefined;

  return (
    <Link
      href={`/marketplace/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={photo}
          alt={product.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
        {product.isFeatured ? (
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {featuredLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</p>
        {product.condition ? (
          <p className="text-[11px] text-gray-500">{product.condition}</p>
        ) : null}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-baseline gap-2">
            {displayPrice != null ? (
              <span className="text-base font-bold text-[#00A651]">
                ৳{displayPrice.toLocaleString()}
              </span>
            ) : (
              <span className="text-base font-bold text-gray-400">—</span>
            )}
            {compareAt != null ? (
              <span className="text-xs text-gray-400 line-through">৳{compareAt.toLocaleString()}</span>
            ) : null}
          </div>
          {product.isNegotiable ? (
            <span className="text-[10px] font-medium text-amber-700">{negotiableLabel}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
