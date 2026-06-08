import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalDocument, { type LegalDoc } from "@/components/legal/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  const doc = t.raw("terms") as LegalDoc;
  return {
    title: `${doc.title} | Campus Sheba`,
    description:
      "The terms that govern your access to and use of the Campus Sheba service.",
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");
  const doc = t.raw("terms") as LegalDoc;

  return <LegalDocument doc={doc} />;
}
