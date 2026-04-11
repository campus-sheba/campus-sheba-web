import { Link } from "@/i18n/navigation";
import MyLostFoundEditPage from "@/modules/dashboard/MyLostFoundEditPage";
import { getLostFoundByIdForEditAction } from "@/services/lost-and-found";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MyLostFoundEditRoutePage({ params }: Props) {
  const { id } = await params;
  const res = await getLostFoundByIdForEditAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{res.message ?? "Post not found."}</p>
        <Link
          href="/my-lost-found"
          className="inline-block text-sm font-semibold text-[#00A651] hover:underline"
        >
          ← Back to my lost & found
        </Link>
      </div>
    );
  }

  return <MyLostFoundEditPage post={res.data} />;
}
