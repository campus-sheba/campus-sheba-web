"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button, Pagination } from "@/components/ui";
import {
  fetchBorrowedBooks,
  requestBorrowExtensionAction,
} from "@/services/book-borrowing";
import type { BookBorrowRecord, BookListing } from "@/types/book";

const PAGE_SIZE = 10;

function bookTitle(book: BookListing | string): string {
  if (typeof book === "object" && book?.title) return book.title;
  return "Book";
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

export default function MyBookBorrowedPage() {
  const [items, setItems] = useState<BookBorrowRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [extendId, setExtendId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async (nextPage: number = page) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetchBorrowedBooks({
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

  const submitExtension = (borrowRequestId: string) => {
    if (!extendDate) {
      setMsg("Choose a new return date.");
      return;
    }
    startTransition(async () => {
      const res = await requestBorrowExtensionAction(borrowRequestId, {
        requestedDueDate: new Date(extendDate).toISOString(),
        reason: extendReason.trim() || undefined,
      });
      setMsg(res.success ? "Extension request sent." : res.message);
      if (res.success) {
        setExtendId(null);
        setExtendDate("");
        setExtendReason("");
        void load();
      }
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/books" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            ← Books
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">Books I borrowed</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track active loans, extensions, and returns.
          </p>
        </div>
        <Link
          href="/books/all?type=Lending"
          className="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-[#E30B12]"
        >
          Find books to borrow
        </Link>
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
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {msg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">{msg}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No borrow records yet.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const canExtend =
              r.status === "Active" || r.status === "Approved" || r.status === "Overdue";
            const pendingExt = r.extendRequests?.find((e) => e.status === "Pending");
            return (
              <article
                key={r._id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{bookTitle(r.book)}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Status: <span className="font-medium">{r.status}</span>
                      {r.dueDate ? ` · Due ${formatDate(r.dueDate)}` : null}
                      {r.securityDeposit > 0
                        ? ` · Deposit ৳${r.securityDeposit} (${r.depositStatus})`
                        : null}
                      {r.lateFee != null && r.lateFee > 0 ? ` · Late fee ৳${r.lateFee}` : null}
                    </p>
                    {r.responseMessage ? (
                      <p className="mt-2 text-sm text-gray-500">Owner: {r.responseMessage}</p>
                    ) : null}
                    {pendingExt ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Extension pending until {formatDate(pendingExt.requestedReturnDate)}
                      </p>
                    ) : null}
                  </div>
                  {canExtend && !pendingExt ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 shrink-0 text-xs"
                      onClick={() => setExtendId(extendId === r._id ? null : r._id)}
                    >
                      Request extension
                    </Button>
                  ) : null}
                </div>

                {extendId === r._id ? (
                  <div className="mt-4 space-y-2 rounded-lg border border-sky-100 bg-sky-50/40 p-3">
                    <label className="block text-xs font-medium text-gray-600">
                      New return date
                      <input
                        type="datetime-local"
                        value={extendDate}
                        onChange={(e) => setExtendDate(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-medium text-gray-600">
                      Reason (optional)
                      <textarea
                        value={extendReason}
                        onChange={(e) => setExtendReason(e.target.value)}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        uppercase={false}
                        className="h-9 text-xs"
                        disabled={isPending}
                        onClick={() => submitExtension(r._id)}
                      >
                        Send request
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        uppercase={false}
                        className="h-9 text-xs"
                        onClick={() => setExtendId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
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
