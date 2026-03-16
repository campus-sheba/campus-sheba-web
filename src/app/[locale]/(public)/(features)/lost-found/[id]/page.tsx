"use client";

import LostFoundDetailsPage from "./_components/LostFoundDetails";

export default function LostFoundDetailsRoute({
  params,
}: {
  params: { id: string; locale: string };
}) {
  return <LostFoundDetailsPage params={params} />;
}
