"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getLentBooksAction,
  respondToBorrowRequestAction,
  markBookReturnedAction,
  respondToExtensionAction,
  type BorrowRequest,
} from "@/app/[locale]/(protected)/(dashboard)/my-books/actions";
import { HandHeart, CheckCircle, XCircle, RotateCcw, Clock, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LentBooksTab() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getLentBooksAction();
    if (res.success) setRequests(res.data);
    setLoading(false);
  }

  function handleAction(id: string, action: "Approved" | "Rejected") {
    startTransition(async () => {
      await respondToBorrowRequestAction(id, action);
      await fetchData();
    });
  }

  function handleReturn(id: string) {
    if (!confirm("Are you sure you want to mark this book as physically returned?")) return;
    startTransition(async () => {
      await markBookReturnedAction(id);
      await fetchData();
    });
  }

  function handleExtensionAction(borrowId: string, extendId: string, action: "Approved" | "Rejected") {
    startTransition(async () => {
      await respondToExtensionAction(borrowId, extendId, action);
      await fetchData();
    });
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">Syncing lending channels...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white p-14 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex flex-col items-center justify-center mx-auto mb-5">
          <HandHeart className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-gray-900 font-bold text-xl mb-2">No Lending Activity Detected</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
          You haven't lent any books out yet, and there are no incoming requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {requests.map((req) => {
        // @ts-ignore
        const bookTitle = typeof req.bookId === "object" ? req.bookId.title : "Unknown Title";
        const borrowerDetails = typeof req.borrowerId === "object" ? req.borrowerId : null;
        const borrowerName = borrowerDetails?.name || "Unknown User";

        let statusCls = "bg-gray-100 text-gray-700 border-gray-200";
        if (req.status === "Approved") statusCls = "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (req.status === "Pending") statusCls = "bg-blue-100 text-blue-700 border-blue-200";
        if (req.status === "Rejected") statusCls = "bg-red-100 text-red-700 border-red-200";
        if (req.status === "Returned") statusCls = "bg-gray-100 text-gray-500 border-gray-200";

        const hasPendingExtension = req.extensionRequests?.some(ex => ex.status === "Pending");

        return (
          <div key={req._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <HandHeart className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{bookTitle}</h4>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                       Borrower: <span className="text-gray-900 font-bold uppercase tracking-wide">{borrowerName}</span>
                    </span>
                    {req.expectedReturnDate && (
                      <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Clock className="w-3 h-3 text-gray-400" /> 
                        Due: <span className="text-gray-900 font-bold uppercase tracking-wide">{new Date(req.expectedReturnDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${statusCls}`}>
                  {req.status}
                </span>
                {hasPendingExtension && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                    <AlertCircle className="w-3 h-3"/> Extension Requested
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex flex-wrap gap-2">
              {req.status === "Pending" && (
                <>
                  <Button disabled={isPending} onClick={() => handleAction(req._id, "Approved")} size="sm" uppercase={false} className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm font-bold tracking-wide">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve Borrow
                  </Button>
                  <Button disabled={isPending} onClick={() => handleAction(req._id, "Rejected")} variant="outline" size="sm" uppercase={false} className="text-red-600 border-red-200 hover:bg-red-50 bg-white font-bold tracking-wide">
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject Request
                  </Button>
                </>
              )}

              {req.status === "Approved" && (
                <Button disabled={isPending} onClick={() => handleReturn(req._id)} variant="outline" size="sm" uppercase={false} className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-bold tracking-wide">
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Mark as Returned
                </Button>
              )}

              {hasPendingExtension && req.extensionRequests?.filter(ex => ex.status === "Pending").map((ex) => (
                <div key={ex._id} className="flex gap-2 w-full mt-2 pt-2 border-t border-amber-100/50">
                  <Button disabled={isPending} onClick={() => handleExtensionAction(req._id, ex._id, "Approved")} size="sm" uppercase={false} className="bg-amber-500 hover:bg-amber-600 border-none shadow-sm text-white font-bold tracking-wide text-[11px]">
                    Approve Extension ({ex.duration} Days)
                  </Button>
                  <Button disabled={isPending} onClick={() => handleExtensionAction(req._id, ex._id, "Rejected")} variant="outline" size="sm" uppercase={false} className="text-red-600 border-red-200 bg-white font-bold tracking-wide text-[11px]">
                    Deny
                  </Button>
                </div>
              ))}
              
              {/* Fallback to show history action completed */}
              {req.status !== "Pending" && !hasPendingExtension && req.status !== "Approved" && (
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-widest inline-flex items-center h-8">Action Completed / Locked</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
