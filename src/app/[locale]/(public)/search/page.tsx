import { Suspense } from "react";
import GlobalSearchPage from "@/modules/search/GlobalSearchPage";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-500">Loading search…</p>}>
      <GlobalSearchPage />
    </Suspense>
  );
}
