import type { Metadata } from "next";
import TermsDocument from "@/components/legal/TermsDocument";

export const metadata: Metadata = {
  title: "Terms of Service — Campus Sheba",
  description: "Campus Sheba Terms of Service governing use of the app and website.",
};

export default function TermsPage() {
  return <TermsDocument />;
}
