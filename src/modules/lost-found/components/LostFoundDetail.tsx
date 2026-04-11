"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import {
  cancelLostFoundAction,
  fetchLostFoundById,
  fetchLostFoundResolveRequestsAction,
  markLostFoundResolvedAction,
  respondLostFoundResolveRequestAction,
  sendLostFoundResolveRequestAction,
} from "@/services/lost-and-found";
import type { LostFoundPost, ResolveRequestRow } from "@/types/lost-and-found";
import { lostFoundDisplayTitle, lostFoundLocationLabel } from "../lostFoundDisplay";

function ownerIdOf(post: LostFoundPost): string | undefined {
  const c = post.createdBy;
  if (!c) return undefined;
  if (typeof c === "string") return c;
  return c._id;
}

export default function LostFoundDetail() {
  const t = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { state, dispatch } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const [post, setPost] = useState<LostFoundPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolveMsg, setResolveMsg] = useState("");
  const [resolveNote, setResolveNote] = useState("");
  const [requests, setRequests] = useState<ResolveRequestRow[]>([]);
  const [isPending, startTransition] = useTransition();

  const profileId = state.user.profile?._id;
  const isAuth = state.auth.isAuthenticated;
  const ownerId = post ? ownerIdOf(post) : undefined;
  const isOwner = Boolean(profileId && ownerId && profileId === ownerId);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchLostFoundById(id);
        if (!cancelled) {
          setPost(data);
          setError(data ? null : tt("lostFoundDetail.notFound", "Post not found."));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, tt]);

  useEffect(() => {
    if (!post || !isOwner || !isAuth) return;
    void (async () => {
      const res = await fetchLostFoundResolveRequestsAction(post._id);
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data as ResolveRequestRow[]);
      }
    })();
  }, [post, isOwner, isAuth]);

  const images: string[] = [];
  if (post) {
    for (const it of post.items ?? []) {
      for (const im of it.images ?? []) {
        if (im.url) images.push(im.url);
      }
    }
    for (const im of post.image ?? []) {
      if (im.url) images.push(im.url);
    }
  }
  const gallery = images.length ? images : ["/placeholder.jpg"];

  const onSendResolve = () => {
    if (!post || !resolveNote.trim()) {
      setResolveMsg(tt("lostFoundDetail.resolveNoteRequired", "Please add a message."));
      return;
    }
    if (!isAuth) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    setResolveMsg("");
    startTransition(async () => {
      const res = await sendLostFoundResolveRequestAction(post._id, { message: resolveNote.trim() });
      setResolveMsg(
        res.success
          ? tt("lostFoundDetail.resolveSent", "Request sent.")
          : res.message ?? tt("lostFoundDetail.resolveFailed", "Could not send."),
      );
      if (res.success) setResolveNote("");
    });
  };

  const onCancel = () => {
    if (!post) return;
    startTransition(async () => {
      const res = await cancelLostFoundAction(post._id);
      if (res.success) router.push("/my-lost-found");
      else setResolveMsg(res.message ?? "");
    });
  };

  const onResolved = () => {
    if (!post) return;
    startTransition(async () => {
      const res = await markLostFoundResolvedAction(post._id);
      setResolveMsg(
        res.success
          ? tt("lostFoundDetail.markedResolved", "Marked as resolved.")
          : res.message ?? "",
      );
      if (res.success) void fetchLostFoundById(post._id).then(setPost);
    });
  };

  const onRespondRequest = (requestId: string, status: "accepted" | "rejected") => {
    startTransition(async () => {
      const res = await respondLostFoundResolveRequestAction(requestId, status);
      if (res.success && post) {
        const r = await fetchLostFoundResolveRequestsAction(post._id);
        if (r.success && Array.isArray(r.data)) setRequests(r.data as ResolveRequestRow[]);
      } else setResolveMsg(res.message ?? "");
    });
  };

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
        <p className="text-sm text-gray-600">{tt("lostFoundDetail.invalid", "Invalid post.")}</p>
      </ContentWrapper>
    );
  }

  if (error || !post) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
        <p className="text-sm text-red-600">{error ?? tt("lostFoundDetail.loading", "Loading…")}</p>
        <Link href="/lost-found" className="mt-4 inline-block text-sm font-semibold text-[#00A651] hover:underline">
          ← {tt("lostFoundDetail.back", "Back")}
        </Link>
      </ContentWrapper>
    );
  }

  const title = lostFoundDisplayTitle(post);
  const loc = lostFoundLocationLabel(post);
  const desc =
    post.description ||
    post.items?.map((i) => i.description).filter(Boolean).join("\n\n") ||
    "—";

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: tt("lostFoundDetail.home", "Home"), href: "/" },
          { label: tt("lostFoundDetail.lf", "Lost & Found"), href: "/lost-found" },
          { label: title },
        ]}
      />

      <Link
        href="/lost-found/all"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {tt("lostFoundDetail.allPosts", "All posts")}
      </Link>

      <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageGallery title={title} images={gallery} />
          <div className="flex flex-col gap-4">
            <span
              className={`w-fit rounded-md px-2 py-1 text-xs font-bold ${
                post.type === "Lost" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
              }`}
            >
              {post.type}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h1>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{tt("lostFoundDetail.location", "Location")}:</span> {loc}
            </p>
            {(post.lastSeenDate || post.lastSeenTime) && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{tt("lostFoundDetail.lastSeen", "Last seen")}:</span>{" "}
                {post.lastSeenDate ? new Date(post.lastSeenDate).toLocaleDateString() : "—"}{" "}
                {post.lastSeenTime ?? ""}
              </p>
            )}
            {post.rewardAmount != null && post.rewardAmount > 0 && post.type === "Lost" && (
              <p className="text-lg font-semibold text-[#00A651]">
                {tt("lostFoundDetail.reward", "Reward")}: ৳{post.rewardAmount.toLocaleString()}
              </p>
            )}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {tt("lostFoundDetail.description", "Description")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{desc}</p>
            </div>
            {post.items && post.items.length > 1 && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  {tt("lostFoundDetail.items", "Items in this post")}
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-700">
                  {post.items.map((it) => (
                    <li key={it._id ?? it.name}>{it.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">{tt("lostFoundDetail.contact", "Contact")}</h2>
        <p className="mt-2 text-sm text-gray-700">{post.contactName}</p>
        {post.contactPhone && <p className="text-sm text-gray-700">{post.contactPhone}</p>}
        {post.contactEmail && <p className="text-sm text-gray-700">{post.contactEmail}</p>}
      </SectionWrapper>

      {resolveMsg ? (
        <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">{resolveMsg}</p>
      ) : null}

      {isOwner && isAuth ? (
        <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900">{tt("lostFoundDetail.ownerActions", "Your post")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={isPending} onClick={onResolved}>
              {tt("lostFoundDetail.btnResolved", "Mark resolved")}
            </Button>
            <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
              {tt("lostFoundDetail.btnCancel", "Cancel post")}
            </Button>
            <Link
              href={`/my-lost-found/${post._id}/edit`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-[11px] font-semibold text-gray-600 hover:border-black hover:text-black"
            >
              {tt("lostFoundDetail.btnEdit", "Edit")}
            </Link>
          </div>
          {requests.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {tt("lostFoundDetail.incomingRequests", "Incoming claims")}
              </h3>
              <ul className="mt-3 space-y-3">
                {requests.map((r) => {
                  const rid = r.id ?? r._id ?? "";
                  const name = r.requestedBy?.name ?? "—";
                  return (
                    <li key={rid} className="rounded-lg border border-gray-100 p-3 text-sm">
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="mt-1 text-gray-600">{r.message}</p>
                      <p className="mt-1 text-xs text-gray-400">{r.status}</p>
                      {r.status === "pending" && rid ? (
                        <div className="mt-2 flex gap-2">
                          <Button type="button" size="sm" disabled={isPending} onClick={() => onRespondRequest(rid, "accepted")}>
                            {tt("lostFoundDetail.accept", "Accept")}
                          </Button>
                          <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => onRespondRequest(rid, "rejected")}>
                            {tt("lostFoundDetail.reject", "Reject")}
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </SectionWrapper>
      ) : null}

      {!isOwner && isAuth ? (
        <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {tt("lostFoundDetail.claimTitle", "Think this is yours?")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {tt("lostFoundDetail.claimHint", "Send a message to the poster with details only you would know.")}
          </p>
          <textarea
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            rows={4}
            className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]"
            placeholder={tt("lostFoundDetail.claimPlaceholder", "Describe identifying details…")}
          />
          <Button type="button" className="mt-3" disabled={isPending} onClick={onSendResolve}>
            {tt("lostFoundDetail.sendClaim", "Send claim request")}
          </Button>
        </SectionWrapper>
      ) : null}
    </ContentWrapper>
  );
}
