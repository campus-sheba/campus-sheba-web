import MyBooksEditPage from "@/modules/dashboard/MyBooksEditPage";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MyBooksEditRoutePage({ params }: Props) {
  const { id } = await params;
  return <MyBooksEditPage bookId={id} />;
}
