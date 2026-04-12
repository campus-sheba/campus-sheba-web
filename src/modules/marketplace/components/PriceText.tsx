export function formatBdt(amount: number | undefined): string {
  if (amount === undefined || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `৳${amount}`;
  }
}

export default function PriceText({
  price,
  discountPrice,
  className = "",
}: {
  price?: number;
  discountPrice?: number;
  className?: string;
}) {
  const showDiscount =
    discountPrice !== undefined && price !== undefined && discountPrice < price;

  return (
    <span className={className}>
      {showDiscount ? (
        <>
          <span className="font-semibold text-emerald-700">{formatBdt(discountPrice)}</span>
          <span className="ms-2 text-sm text-neutral-400 line-through">{formatBdt(price)}</span>
        </>
      ) : (
        <span className="font-semibold text-neutral-900">{formatBdt(price ?? discountPrice)}</span>
      )}
    </span>
  );
}
