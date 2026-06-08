import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalDocument, { type LegalDoc } from "@/components/legal/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  const doc = t.raw("privacy") as LegalDoc;
  return {
    title: `${doc.title} | Campus Sheba`,
    description:
      "How Campus Sheba collects, uses, shares, and protects your personal information.",
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("legal");
  const doc = t.raw("privacy") as LegalDoc;

  return <LegalDocument doc={doc} />;
}
