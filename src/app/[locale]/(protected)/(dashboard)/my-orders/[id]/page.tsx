import { Link } from "@/i18n/navigation";
import OrderDetailView from "@/modules/dashboard/OrderDetailView";
import { getOrderByIdAction } from "@/services/orders";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
};

export default async function MyOrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { placed } = await searchParams;
  const res = await getOrderByIdAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{res.message ?? "We could not load this order."}</p>
        <Link href="/my-orders" className="inline-block text-sm font-semibold text-[#00A651] hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return <OrderDetailView order={res.data} showPlacedSuccess={placed === "1"} />;
}
