import { getMe } from "@/services/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import ProfileLogoutButton from "./ProfileLogoutButton";
import {
  Package,
  Wallet,
  Phone,
  Mail,
  User,
  ArrowRight,
} from "lucide-react";

const DASHBOARD_CENTERS = [
  {
    title: "Lost & Found Center",
    href: "/my-lost-found",
    description: "Track your reports and resolve requests.",
  },
  {
    title: "Delivery Center",
    href: "/my-delivery",
    description: "View delivery-related requests and status.",
  },
  {
    title: "Marketplace Center",
    href: "/my-marketplace",
    description: "Manage marketplace order activities.",
  },
  {
    title: "Books Center",
    href: "/my-books",
    description: "See your books exchange and requests.",
  },
  {
    title: "Blood Requests Center",
    href: "/my-blood-requests",
    description: "Monitor blood request submissions.",
  },
  {
    title: "Tuition Center",
    href: "/my-tuition",
    description: "Follow tuition applications and updates.",
  },
  {
    title: "Job Applications Center",
    href: "/my-job-applications",
    description: "Track your job application flow.",
  },
  {
    title: "Donations Center",
    href: "/my-donations",
    description: "Manage donation request progress.",
  },
  {
    title: "Parcels Center",
    href: "/my-parcels",
    description: "Review parcel movement history.",
  },
];

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let response;
  try {
    response = await getMe();
  } catch {
    redirect(`/api/auth/clear?locale=${locale}`);
  }
  if (!response) return null;
  const user = response.data;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="space-y-6">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
      />

      <div className="rounded-2xl bg-white border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E30A13] to-[#ff4d56] flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Student"}</h1>
              <p className="mt-1 text-sm text-gray-500">Professional dashboard workspace for your campus services.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/settings`}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#E30A13] hover:text-[#E30A13] transition-colors"
            >
              Manage Settings
            </Link>
            <ProfileLogoutButton locale={locale} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Full Name</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.name || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.email || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.phone || "Not set"}</p>
          </div>
          <Link
            href={`/orders`}
            className="rounded-xl border border-gray-200 p-4 hover:border-[#E30A13] transition-colors"
          >
            <p className="text-xs text-gray-500 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Orders</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 flex items-center justify-between">
              Open Order Desk <ArrowRight className="w-4 h-4 text-gray-400" />
            </p>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Service Centers</h2>
          <Link href={`/wallet`} className="text-sm font-medium text-[#E30A13] inline-flex items-center gap-1 hover:underline">
            Wallet <Wallet className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DASHBOARD_CENTERS.map((center) => (
            <Link
              key={center.href}
              href={`/${center.href}`}
              className="rounded-xl border border-gray-200 p-4 hover:border-[#E30A13] transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900 flex items-center justify-between gap-3">
                {center.title}
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </p>
              <p className="mt-2 text-xs text-gray-500">{center.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}