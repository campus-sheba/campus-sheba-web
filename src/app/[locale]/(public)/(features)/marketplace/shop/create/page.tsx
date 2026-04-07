"use client";

import { useState } from "react";
import DynamicShopCreateForm from "./_components/DynamicShopCreateForm";
import ShopCreateIntro from "./_components/ShopCreateIntro";

export default function CreateShopPage({ params }: { params: { locale: string } }) {
  const locale = (params as { locale: string }).locale || "en";
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return <ShopCreateIntro locale={locale} onStart={() => setShowForm(true)} />;
  }

  return <DynamicShopCreateForm locale={locale} onBackToIntro={() => setShowForm(false)} />;
}
