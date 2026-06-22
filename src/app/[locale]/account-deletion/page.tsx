import type { Metadata } from "next";
import AccountDeletionDocument from "@/components/legal/AccountDeletionDocument";

export const metadata: Metadata = {
  title: "Account Deletion — Campus Sheba",
  description:
    "How to delete your Campus Sheba account from the app, what happens during pending deletion, and how to contact support.",
};

export default function AccountDeletionPage() {
  return <AccountDeletionDocument />;
}
