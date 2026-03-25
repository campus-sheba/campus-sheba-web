"use client";

import { useState } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { BookOpen, Repeat, HandHeart } from "lucide-react";
import BookListingsTab from "./BookListingsTab";
import LentBooksTab from "./LentBooksTab";
import BorrowedBooksTab from "./BorrowedBooksTab";

const tabs = [
  { id: "listings", label: "My Book Listings", icon: BookOpen },
  { id: "lent", label: "Lent & Requests", icon: HandHeart },
  { id: "borrowed", label: "Borrowed Books", icon: Repeat },
] as const;

export default function MyBooksPage() {
  const [activeTab, setActiveTab] = useState<"listings" | "lent" | "borrowed">("listings");

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/profile` },
          { label: "Books Center" },
        ]}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Block */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none">
            <BookOpen className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Books Center</h1>
            <p className="mt-1 text-sm text-gray-600 max-w-lg leading-relaxed">
              Manage your academic and creative reads. Track what you're listing for sale, letting friends borrow, or actively borrowing yourself.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto bg-gray-50/50 border-b border-gray-100 px-2 pt-2 no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? "border-blue-600 text-blue-700 bg-white shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.02)]"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                } rounded-t-xl`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 bg-gray-50/30 min-h-[500px]">
          {activeTab === "listings" && <BookListingsTab />}
          {activeTab === "lent" && <LentBooksTab />}
          {activeTab === "borrowed" && <BorrowedBooksTab />}
        </div>
      </div>
    </div>
  );
}
