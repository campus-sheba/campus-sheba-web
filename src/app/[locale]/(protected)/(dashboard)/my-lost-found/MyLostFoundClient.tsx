/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock3, Eye, Plus } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  getMyLostFoundPostsAction,
  type LostFoundItem,
} from "@/app/[locale]/(public)/(features)/lost-found/actions";

const getItemTitle = (item: LostFoundItem) => item.title || item.items?.[0]?.name || "Untitled item";

const formatDate = (value?: string) => {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString();
};

export default function MyLostFoundClient() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "en";
  const [myPosts, setMyPosts] = useState<LostFoundItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMyPosts = async () => {
    setIsLoadingPosts(true);
    const result = await getMyLostFoundPostsAction({ page: 1, limit: 50 });
    if (result.success) {
      setMyPosts(result.items);
      setErrorMessage("");
    } else {
      setErrorMessage(result.message || "Failed to load Lost & Found history");
    }

    setIsLoadingPosts(false);
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/${locale}/profile` },
          { label: "Lost & Found" },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">My Lost & Found History</h1>
          <Link
            href={`/${locale}/my-lost-found/new`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E30A13] text-white text-sm font-semibold hover:bg-[#c70810]"
          >
            <Plus className="w-4 h-4" /> Post New Lost/Found Report
          </Link>
        </div>

        {isLoadingPosts ? (
          <p className="text-sm text-gray-500">Loading posts...</p>
        ) : errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : myPosts.length === 0 ? (
          <p className="text-sm text-gray-500">No posts yet. Create your first Lost or Found report.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4 font-semibold">Title</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Created</th>
                  <th className="py-2 pr-1 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
            {myPosts.map((post) => (
              <tr key={post._id} className="border-b border-gray-100 hover:bg-gray-50/80">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-gray-900">{getItemTitle(post)}</p>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${post.type === "Lost" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {post.type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-gray-700">{post.status || "pending"}</span>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}
                  </span>
                </td>
                <td className="py-3 pr-1 text-right">
                  <Link
                    href={`/${locale}/my-lost-found/${post._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E30A13] hover:underline"
              >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
