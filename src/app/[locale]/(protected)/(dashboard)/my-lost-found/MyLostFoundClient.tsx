/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Clock3, Eye, Plus } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  StandardDataTable,
  type StandardDataTableColumn,
} from "@/components/ui";
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
  // No locale prop drilling; next-intl handles locale in Link
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

  const tableColumns: StandardDataTableColumn<LostFoundItem>[] = [
    {
      key: "title",
      header: "Title",
      render: (post) => (
        <div>
          <p className="font-semibold text-gray-900">{getItemTitle(post)}</p>
          <p className="text-xs text-gray-500 mt-0.5">ID: {post._id.slice(-8).toUpperCase()}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (post) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${post.type === "Lost" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {post.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (post) => (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
          {post.status || "pending"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (post) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <Clock3 className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (post) => (
        <Link
          href={`/my-lost-found/${post._id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E30A13]/20 px-2.5 py-1.5 text-xs font-semibold text-[#E30A13] hover:bg-[#E30A13]/5"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Lost & Found" },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">My Lost & Found History</h1>
          <Link
            href="/my-lost-found/new"
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
          <StandardDataTable
            columns={tableColumns}
            rows={myPosts}
            getRowKey={(row) => row._id}
          />
        )}
      </div>
    </div>
  );
}
