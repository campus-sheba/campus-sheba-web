"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button, Pagination } from "@/components/ui";
import {
  fetchLentBooks,
  markBookReturnedAction,
  respondToBorrowRequestAction,
  respondToExtensionAction,
} from "@/services/book-borrowing";
import type { BookBorrowRecord, BookListing } from "@/types/book";

const PAGE_SIZE = 10;

function bookTitle(book: BookListing | string): string {
  if (typeof book === "object" && book?.title) return book.title;
  return "Book";
}

function borrowerName(b: BookBorrowRecord["borrower"]): string {
  if (typeof b === "object" && b?.name) return b.name;
  return "Borrower";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MyBookLentPage() {
  const [items, setItems] = useState<BookBorrowRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [returnId, setReturnId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [damageCharge, setDamageCharge] = useState(0);
  const [damageDescription, setDamageDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async (nextPage: number = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetchLentBooks({
        page: nextPage,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
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
  }, [statusFilter]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const respond = (id: string, status: "Approved" | "Rejected", message?: string) => {
    startTransition(async () => {
      const res = await respondToBorrowRequestAction(id, {
        status,
        responseMessage: message?.trim() || undefined,
      });
      setMsg(res.success ? `Request ${status.toLowerCase()}.` : res.message);
      if (res.success) {
        setRejectId(null);
        setResponseMessage("");
        void load();
      }
    });
  };

  const markReturned = (id: string, condition: "Good" | "Damaged" | "Lost") => {
    startTransition(async () => {
      const res = await markBookReturnedAction(id, {
        returnCondition: condition,
        damageCharge: condition === "Damaged" ? damageCharge : 0,
        damageDescription:
          condition === "Damaged" ? damageDescription.trim() || undefined : undefined,
      });
      if (res.success) {
        const refund = res.refundInfo;
        setMsg(
          refund
            ? `Returned. Refunded ৳${refund.refundedAmount} (${refund.depositStatus}).`
            : "Marked as returned.",
        );
        setReturnId(null);
        setDamageCharge(0);
        setDamageDescription("");
        void load();
      } else {
        setMsg(res.message);
      }
    });
  };

  const respondExt = (
    borrowId: string,
    extendId: string,
    status: "Approved" | "Rejected",
  ) => {
    startTransition(async () => {
      const res = await respondToExtensionAction(borrowId, extendId, { status });
      setMsg(res.success ? `Extension ${status.toLowerCase()}.` : res.message);
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
        <h1 className="mt-2 text-xl font-bold text-gray-900">Books I lent out</h1>
        <p className="mt-1 text-sm text-gray-500">
          Approve borrow requests, extensions, and mark returns.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Active">Active</option>
          <option value="Overdue">Overdue</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {msg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">{msg}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No lend records in this filter.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const pendingExt = r.extendRequests?.find((e) => e.status === "Pending");
            const canReturn =
              r.status === "Active" || r.status === "Approved" || r.status === "Overdue";

            return (
              <article
                key={r._id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <h2 className="font-semibold text-gray-900">{bookTitle(r.book)}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {borrowerName(r.borrower)} · {r.status}
                  {r.dueDate ? ` · Due ${formatDate(r.dueDate)}` : null}
                </p>
                {r.requestMessage ? (
                  <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {r.requestMessage}
                  </p>
                ) : null}

                {r.status === "Pending" ? (
                  <div className="mt-3 space-y-2">
                    {rejectId === r._id ? (
                      <>
                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={2}
                          placeholder="Optional message to borrower"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 text-xs"
                            disabled={isPending}
                            onClick={() =>
                              respond(r._id, "Rejected", responseMessage)
                            }
                          >
                            Confirm reject
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 text-xs"
                            onClick={() => {
                              setRejectId(null);
                              setResponseMessage("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className="h-9 text-xs"
                          disabled={isPending}
                          onClick={() =>
                            respond(
                              r._id,
                              "Approved",
                              "Approved — contact me to arrange pickup.",
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 text-xs"
                          disabled={isPending}
                          onClick={() => setRejectId(r._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}

                {pendingExt ? (
                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                    <p className="text-sm text-gray-800">
                      Extension to {formatDate(pendingExt.requestedReturnDate)}
                      {pendingExt.reason ? ` — ${pendingExt.reason}` : ""}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        className="h-8 text-xs"
                        disabled={isPending}
                        onClick={() => respondExt(r._id, pendingExt._id, "Approved")}
                      >
                        Approve extension
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={isPending}
                        onClick={() => respondExt(r._id, pendingExt._id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}

                {canReturn ? (
                  <div className="mt-3">
                    {returnId !== r._id ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 text-xs"
                        onClick={() => setReturnId(r._id)}
                      >
                        Mark returned
                      </Button>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <label className="block text-xs font-medium text-gray-600">
                          Damage charge (৳, if damaged)
                          <input
                            type="number"
                            min={0}
                            value={damageCharge}
                            onChange={(e) => setDamageCharge(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block text-xs font-medium text-gray-600">
                          Damage notes (optional)
                          <textarea
                            value={damageDescription}
                            onChange={(e) => setDamageDescription(e.target.value)}
                            rows={2}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            className="h-8 text-xs"
                            disabled={isPending}
                            onClick={() => markReturned(r._id, "Good")}
                          >
                            Good condition
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={isPending}
                            onClick={() => markReturned(r._id, "Damaged")}
                          >
                            Damaged
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 text-xs text-red-700"
                            disabled={isPending}
                            onClick={() => markReturned(r._id, "Lost")}
                          >
                            Lost
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 text-xs"
                            onClick={() => setReturnId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
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
