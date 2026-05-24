"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronDown, X, Paperclip } from "lucide-react";
import { createSupportTicketAction } from "@/services/support-tickets";
import type {
  SupportAttachment,
  SupportTicketCategory,
  SupportTicketPriority,
} from "@/types/support-ticket";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment" },
  { value: "order", label: "Order" },
  { value: "delivery", label: "Delivery" },
  { value: "wallet", label: "Wallet" },
  { value: "coins_referral", label: "Coins & Referral" },
  { value: "bus_share_appeal", label: "Bus Share Appeal" },
  { value: "shop", label: "Shop" },
  { value: "book", label: "Book" },
  { value: "buy_sell", label: "Buy & Sell" },
  { value: "parcel", label: "Parcel" },
  { value: "other", label: "Other" },
];

const PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

type FormState = {
  subject: string;
  category: SupportTicketCategory | "";
  priority: SupportTicketPriority;
  message: string;
};

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({
    subject: "",
    category: "",
    priority: "normal",
    message: "",
  });
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingFiles(true);
    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadMediaFiles([file], MediaFeatureName.MEDIA)),
      );
      const newAttachments: SupportAttachment[] = uploaded.flatMap((u, index) => {
        if (!u.success) return [];
        const meta = u.files?.[0];
        const url = meta?.url ?? u.urls[0];
        if (!url) return [];
        const file = files[index];
        return [
          {
            url,
            key: meta?.key,
            name: file?.name,
            size: meta?.size ?? file?.size,
            mime: file?.type,
          },
        ];
      });
      if (newAttachments.length < files.length) {
        setError("Some files failed to upload. Please try again.");
      }
      if (newAttachments.length) {
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (!form.subject.trim()) return setError("Subject is required.");
    if (!form.category) return setError("Category is required.");
    if (!form.message.trim()) return setError("Message is required.");
    setError(null);

    startTransition(async () => {
      const res = await createSupportTicketAction({
        subject: form.subject.trim(),
        category: form.category as SupportTicketCategory,
        priority: form.priority,
        message: form.message.trim(),
        attachments: attachments.length ? attachments : undefined,
      });

      if (res.success && res.data?._id) {
        router.push(`/support-tickets/${res.data._id}`);
      } else {
        setError(res.message ?? "Failed to create ticket. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/profile" },
          { label: "Support Tickets", href: "/support-tickets" },
          { label: "New Ticket" },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-lg font-bold text-gray-900">New Support Ticket</h1>

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              placeholder="Brief description of your issue"
              maxLength={200}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E30A13]/40 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/10"
            />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value as SupportTicketCategory)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm text-gray-900 focus:border-[#E30A13]/40 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/10"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Priority
              </label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => setField("priority", e.target.value as SupportTicketPriority)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm text-gray-900 focus:border-[#E30A13]/40 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/10"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              placeholder="Describe your issue in detail. Include order IDs, transaction IDs, or any relevant information."
              rows={6}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E30A13]/40 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/10"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Attachments
            </label>
            {attachments.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {attachments.map((att, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate text-xs text-gray-600">
                        {att.name ?? att.url.split("/").pop()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="ml-2 shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700">
              <Paperclip className="h-4 w-4" />
              {uploadingFiles ? "Uploading…" : "Attach files"}
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={uploadingFiles}
                className="sr-only"
              />
            </label>
            <p className="mt-1 text-xs text-gray-400">Images and PDF files accepted</p>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isPending || uploadingFiles}
            >
              {isPending ? "Submitting…" : "Submit Ticket"}
            </Button>
            <Link
              href="/support-tickets"
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
