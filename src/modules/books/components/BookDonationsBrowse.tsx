"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Gift } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button, Pagination } from "@/components/ui";
import { fetchAvailableDonations, requestDonationAction } from "@/services/book-donations";

const PAGE_SIZE = 12;
import type { BookDonation, BookListing } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import Image from "next/image";

function bookOf(d: BookDonation): BookListing | null {
  return typeof d.book === "object" ? d.book : null;
}

export default function BookDonationsBrowse() {
  const { state, dispatch } = useAppState();
  const isLoggedIn = state.auth.isAuthenticated;
  const [items, setItems] = useState<BookDonation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async (nextPage: number = page) => {
    if (!isLoggedIn) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAvailableDonations(nextPage, PAGE_SIZE);
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load donations.");
      setItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openRequest = (donationId: string) => {
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    setRequestingId(donationId);
    setRequestMessage("");
    setMsg(null);
  };

  const submitRequest = (donationId: string) => {
    startTransition(async () => {
      const res = await requestDonationAction(
        donationId,
        requestMessage.trim() || undefined,
      );
      setMsg(res.success ? "Request sent to the donor." : res.message);
      if (res.success) {
        setRequestingId(null);
        void load();
      }
    });
  };

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: "Donations", href: "/books/donations" },
          ]}
        />

        <div className="mt-4">
          <h1 className="text-xl font-bold text-gray-900">Free book donations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Request books from the campus donation queue. Donors fulfill in order.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Gift className="mx-auto h-10 w-10 text-violet-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">Sign in to browse donations</p>
            <Button
              type="button"
              className="mt-4"
              uppercase={false}
              onClick={() =>
                dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })
              }
            >
              Log in
            </Button>
          </div>
        ) : loading ? (
          <p className="mt-8 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
            No donations available right now.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {msg ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                {msg}
              </p>
            ) : null}
            {items.map((d) => {
              const book = bookOf(d);
              const photo = book?.photos?.[0]?.url;
              const donor =
                typeof d.donor === "object" && d.donor?.name ? d.donor.name : "Donor";
              return (
                <article
                  key={d._id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={book?.title ?? "Book"}
                        fill
                        className="object-cover"
                        unoptimized={shouldUnoptimizeRemoteImage(photo)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <Gift className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900">
                      {book?.title ?? "Donated book"}
                    </h2>
                    {book?.author ? (
                      <p className="text-sm text-gray-600">{book.author}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-gray-500">
                      {donor} · {d.status}
                      {d.queue?.length ? ` · ${d.queue.length} in queue` : ""}
                    </p>
                    {d.donorMessage ? (
                      <p className="mt-2 text-sm text-gray-700">{d.donorMessage}</p>
                    ) : null}
                    {book?._id ? (
                      <Link
                        href={`/books/${book._id}`}
                        className="mt-2 inline-block text-xs font-semibold text-[#E30B12] hover:underline"
                      >
                        View listing →
                      </Link>
                    ) : null}

                    {requestingId === d._id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          rows={2}
                          placeholder="Why do you need this book?"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            uppercase={false}
                            className="h-9 text-xs"
                            disabled={isPending}
                            onClick={() => submitRequest(d._id)}
                          >
                            Submit request
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            uppercase={false}
                            className="h-9 text-xs"
                            onClick={() => setRequestingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : d.status === "available" || d.status === "requested" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        uppercase={false}
                        className="mt-3 h-9 text-xs"
                        onClick={() => openRequest(d._id)}
                      >
                        Request this book
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {isLoggedIn && !loading && items.length > 0 && totalPages > 1 ? (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              disabled={loading}
              onPageChange={(p) => void load(p)}
            />
          </div>
        ) : null}
      </ContentWrapper>
    </SectionWrapper>
  );
}
