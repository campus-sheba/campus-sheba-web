import type { Metadata } from "next";
import ComingSoon from "./ComingSoon";

export const metadata: Metadata = {
  title: "Campus Sheba — Coming Soon",
  description:
    "Campus Sheba is coming soon — the digital home of campus life. One app to explore, move, eat, shop, and connect across your campus.",
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
