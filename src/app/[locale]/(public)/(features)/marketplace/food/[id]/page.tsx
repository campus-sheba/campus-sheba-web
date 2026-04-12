import { redirect } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function LegacyMarketplaceFoodDetailRedirect({ params }: Props) {
  const { locale, id } = await params;
  redirect({ href: `/food/${id}`, locale });
}
