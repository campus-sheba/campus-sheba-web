import type { Metadata } from "next";
import PrivacyPolicyDocument from "@/components/legal/PrivacyPolicyDocument";

export const metadata: Metadata = {
  title: "Privacy Policy — Campus Sheba",
  description:
    "Campus Sheba Privacy Policy. Learn what data we collect, how we use it, and that your data is never sold to third parties.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyDocument />;
}
