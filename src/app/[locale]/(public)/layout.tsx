import SiteChrome from "@/components/layouts/SiteChrome";

/**
 * Public route group — browsable by guests and signed-in users alike.
 * Renders the shared site chrome (navbar/footer/cart/support) with no auth gate.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
