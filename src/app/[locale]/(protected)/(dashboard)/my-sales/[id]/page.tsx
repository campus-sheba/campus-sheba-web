import { Link } from "@/i18n/navigation";
import OrderDetailView from "@/modules/dashboard/OrderDetailView";
import { getSellerOrderByIdAction } from "@/services/owner-orders";
import { resolveOwnerId } from "@/modules/orders/orderFulfillment";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SellerOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await getSellerOrderByIdAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{res.message ?? "We could not load this sale."}</p>
        <Link href="/my-sales" className="inline-block text-sm font-semibold text-[#00A651] hover:underline">
          Back to my sales
        </Link>
      </div>
    );
  }

  const cookieStore = await cookies();
  const userRaw = cookieStore.get("user")?.value;
  let currentUserId: string | undefined;
  if (userRaw) {
    try {
      const profile = JSON.parse(decodeURIComponent(userRaw)) as { _id?: string };
      currentUserId = profile._id;
    } catch {
      currentUserId = undefined;
    }
  }

  const sellerItem = (res.data.items ?? []).find(
    (it) => currentUserId && resolveOwnerId(it.owner) === currentUserId,
  );

  return (
    <OrderDetailView
      order={res.data}
      view="seller"
      sellerItemId={sellerItem?._id}
    />
  );
}
