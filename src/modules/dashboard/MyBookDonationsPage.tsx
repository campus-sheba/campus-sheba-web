"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button, Pagination } from "@/components/ui";

const PAGE_SIZE = 10;
import {
  cancelDonationAction,
  fetchMyDonations,
  fulfillDonationAction,
} from "@/services/book-donations";
import type { BookDonation, BookListing, DonationQueueEntry } from "@/types/book";

function bookTitle(book: BookListing | string): string {
  if (typeof book === "object" && book?.title) return book.title;
  return "Book";
}

function requesterLabel(entry: DonationQueueEntry): string {
  const r = entry.requester;
  if (typeof r === "object" && r?.name) return r.name;
  return "Requester";
}

export default function MyBookDonationsPage() {
  const [items, setItems] = useState<BookDonation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async (nextPage: number = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetchMyDonations(nextPage, PAGE_SIZE);
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setPage(nextPage);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to load.");
      setItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fulfill = (donationId: string, queueEntryId: string) => {
    startTransition(async () => {
      const res = await fulfillDonationAction(donationId, queueEntryId);
      setMsg(res.success ? "Request fulfilled." : res.message);
      if (res.success) void load();
    });
  };

  const cancel = (donationId: string) => {
    if (!confirm("Remove this donation from the queue?")) return;
    startTransition(async () => {
      const res = await cancelDonationAction(donationId);
      setMsg(res.success ? "Donation cancelled." : res.message);
      if (res.success) void load();
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/my-books" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My books
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">My book donations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Register approved donation listings and fulfill queue requests.
        </p>
      </div>

      <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
        <p className="text-sm font-semibold text-gray-900">Register a donation in the queue</p>
        <p className="mt-1 text-xs text-gray-600">
          Once a Donation-type listing is approved, register it in the donation queue so other
          students can request it.
        </p>
        <Link
          href="/my-books?type=Donation&status=Approved"
          className="mt-3 inline-flex items-center rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
        >
          Go to my Donation listings →
        </Link>
        <p className="mt-2 text-xs text-gray-500">
          Approved Donation listings show a one-click <strong>Queue</strong> button on the My
          Books page.
        </p>
      </div>

      {msg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">{msg}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No donation queue entries yet.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((d) => (
            <article
              key={d._id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{bookTitle(d.book)}</h2>
                  <p className="text-sm text-gray-600">
                    Status: {d.status}
                    {d.donorMessage ? ` · ${d.donorMessage}` : ""}
                  </p>
                </div>
                {d.status !== "fulfilled" && d.status !== "cancelled" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 text-xs text-red-600"
                    disabled={isPending}
                    onClick={() => cancel(d._id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>

              {d.queue?.length ? (
                <ul className="mt-3 space-y-2">
                  {d.queue.map((q) => (
                    <li
                      key={q._id}
                      className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{requesterLabel(q)}</span>
                        <span className="text-gray-500"> · {q.status}</span>
                        {q.message ? (
                          <p className="mt-0.5 text-xs text-gray-600">{q.message}</p>
                        ) : null}
                      </div>
                      {q.status === "requested" && d.status !== "fulfilled" ? (
                        <Button
                          type="button"
                          className="h-8 shrink-0 text-xs"
                          disabled={isPending}
                          onClick={() => fulfill(d._id, q._id)}
                        >
                          Fulfill
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-gray-500">No requests in queue yet.</p>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && items.length > 0 && totalPages > 1 ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
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
    </div>
  );
}
