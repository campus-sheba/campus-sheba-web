"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getBorrowedBooksAction,
  requestBorrowExtensionAction,
  type BorrowRequest,
} from "@/app/[locale]/(protected)/(dashboard)/my-books/actions";
import { Repeat, Clock, AlertCircle, PlusCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function BorrowedBooksTab() {
  const [borrowed, setBorrowed] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getBorrowedBooksAction();
    if (res.success) setBorrowed(res.data);
    setLoading(false);
  }

  function handleExtensionRequest(borrowId: string) {
    if (!confirm("Are you sure you want to request an extension for this book?")) return;
    startTransition(async () => {
      await requestBorrowExtensionAction(borrowId);
      await fetchData();
    });
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">Loading borrowed stack...</span>
      </div>
    );
  }

  if (borrowed.length === 0) {
    return (
      <div className="bg-white p-14 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm animate-in zoom-in-95">
        <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex flex-col items-center justify-center mx-auto mb-5">
          <Repeat className="w-8 h-8 text-indigo-500" />
        </div>
        <p className="text-gray-900 font-bold text-xl mb-2">No Active Borrows</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
          You haven't requested or actively borrowed any books yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {borrowed.map((req) => {
        // @ts-ignore
        const bookObj = req.bookId as any;
        const bookTitle = bookObj?.title || "Unknown Book";
        
        let statusCls = "bg-gray-100 text-gray-700 border-gray-200";
        if (req.status === "Approved") statusCls = "bg-indigo-100 text-indigo-700 border-indigo-200";
        if (req.status === "Pending") statusCls = "bg-amber-100 text-amber-700 border-amber-200";
        if (req.status === "Rejected") statusCls = "bg-red-100 text-red-700 border-red-200";
        if (req.status === "Returned") statusCls = "bg-gray-100 text-gray-500 border-gray-200";

        const hasPendingExtension = req.extensionRequests?.some(ex => ex.status === "Pending");
        const allowsExtension = bookObj?.allowsExtension;

        return (
          <div key={req._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Repeat className="w-6 h-6 text-indigo-500" />
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{bookTitle}</h4>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      Request ID: <span className="font-mono text-gray-900 ml-1">{req._id.slice(-6).toUpperCase()}</span>
                    </span>
                    {req.expectedReturnDate && (
                      <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Clock className="w-3 h-3 text-gray-400" /> 
                        Return Due: <span className="text-gray-900 font-bold tracking-wide">{new Date(req.expectedReturnDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-3 border-l md:border-gray-100 md:pl-5 md:w-48 text-right">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${statusCls}`}>
                  {req.status}
                </span>

                {req.status === "Approved" && !hasPendingExtension && allowsExtension && (
                  <Button 
                    disabled={isPending} 
                    onClick={() => handleExtensionRequest(req._id)} 
                    variant="outline" 
                    size="sm" 
                    uppercase={false} 
                    className="w-full justify-center bg-white hover:bg-indigo-50 border-gray-200 text-indigo-600 font-bold tracking-wide shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Request Extension
                  </Button>
                )}

                {hasPendingExtension && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5"/> Extension Pending Approval
                  </span>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
