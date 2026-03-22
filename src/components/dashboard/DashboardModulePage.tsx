import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

type DashboardModulePageProps = {
  locale: string;
  title: string;
  subtitle: string;
  ordersLink: string;
  moduleLink: string;
  moduleLabel: string;
};

export default function DashboardModulePage({
  locale,
  title,
  subtitle,
  ordersLink,
  moduleLink,
  moduleLabel,
}: DashboardModulePageProps) {
  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/${locale}/profile` },
          { label: title },
        ]}
      />

      <div className="rounded-2xl bg-white border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/${locale}${ordersLink}`}
            className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#E30A13] hover:text-[#E30A13] transition-colors"
          >
            <span>Open related order history</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/${locale}${moduleLink}`}
            className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#E30A13] hover:text-[#E30A13] transition-colors"
          >
            <span>Go to {moduleLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
