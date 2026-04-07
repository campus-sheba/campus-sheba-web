"use client";

import { useState } from "react";
import DynamicShopCreateForm from "./_components/DynamicShopCreateForm";
import ShopCreateIntro from "./_components/ShopCreateIntro";

export default function CreateShopPage() {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return <ShopCreateIntro onStart={() => setShowForm(true)} />;
  }

  return <DynamicShopCreateForm onBackToIntro={() => setShowForm(false)} />;
}
