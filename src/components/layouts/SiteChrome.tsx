import { Suspense } from "react";

import Loading from "@/components/common/Loading";
import Navbar from "@/components/siteSettings/navbar/Navbar";
import Footer from "@/components/siteSettings/footer/Footer";
import CartButton from "@/modules/cart/CartButton";
import SupportWidget from "@/modules/support/SupportWidget";

/**
 * Shared site chrome (navbar, footer, floating cart + support) wrapped around
 * page content. Used by the `(public)` and `(protected)` route-group layouts so
 * every browsable page shares one shell — while the `(auth)` group opts out for a
 * focused, distraction-free login/signup experience.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Navbar />
      <main className="pt-[calc(var(--navbar-height)+var(--topbar-height))]">
        {children}
      </main>
      <Footer />
      <CartButton />
      <SupportWidget />
    </Suspense>
  );
}
