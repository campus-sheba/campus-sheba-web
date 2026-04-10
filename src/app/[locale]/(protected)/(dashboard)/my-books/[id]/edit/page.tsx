import { Link } from "@/i18n/navigation";
import MyBookEditPage from "@/modules/dashboard/MyBookEditPage";
import { getCreatorBookByIdAction } from "@/services/book";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MyBookEditRoutePage({ params }: Props) {
  const { id } = await params;
  const res = await getCreatorBookByIdAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{res.message ?? "Listing not found."}</p>
        <Link href="/my-books" className="inline-block text-sm font-semibold text-[#00A651] hover:underline">
          ← Back to my listings
        </Link>
      </div>
    );
  }

  return <MyBookEditPage listing={res.data} />;
}
