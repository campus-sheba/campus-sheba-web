"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { submitShopKycAction } from "@/services/shop";
import type { SubmitShopKycPayload } from "@/types/owner-shop";
import { MediaFeatureName } from "@/types/media";
import { ArrowLeft, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

type DocSlot = "studentId" | "nationalId" | "businessLicense" | "bankStatement";

export default function MyShopKycPage({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [docs, setDocs] = useState<Partial<Record<DocSlot, UploadedMediaMeta>>>({});
  const [uploading, setUploading] = useState<DocSlot | null>(null);

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  async function onPickDoc(slot: DocSlot, files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setUploading(slot);
    setError(null);
    const res = await uploadMediaFiles([f], MediaFeatureName.SHOP);
    setUploading(null);
    if (!res.success || !res.files?.[0]) {
      setError(res.message ?? "Upload failed.");
      return;
    }
    setDocs((d) => ({ ...d, [slot]: res.files![0] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docs.studentId || !docs.nationalId || !docs.bankStatement) {
      setError("Please upload student ID, national ID, and bank statement.");
      return;
    }
    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim() || !branchName.trim() || !routingNumber.trim()) {
      setError("Fill in all bank fields.");
      return;
    }

    const toDoc = (m: UploadedMediaMeta) => ({ url: m.url, key: m.key });

    const payload: SubmitShopKycPayload = {
      kycDocuments: {
        studentId: toDoc(docs.studentId),
        nationalId: toDoc(docs.nationalId),
        bankStatement: toDoc(docs.bankStatement),
        ...(docs.businessLicense ? { businessLicense: toDoc(docs.businessLicense) } : {}),
      },
      bankDetails: {
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        branchName: branchName.trim(),
        routingNumber: routingNumber.trim(),
      },
    };

    setSubmitting(true);
    setError(null);
    const res = await submitShopKycAction(shopId, payload);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    router.push(`/my-shop/${shopId}`);
  }

  function DocRow({ slot, label, required }: { slot: DocSlot; label: string; required?: boolean }) {
    const meta = docs[slot];
    return (
      <div>
        <p className={labelClass}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {meta ? (
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 ring-1 ring-emerald-100">
              Uploaded
            </span>
          ) : null}
          <label className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50">
            {uploading === slot ? <Loader2 className="h-4 w-4 animate-spin" /> : meta ? "Replace" : "Upload"}
            <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => void onPickDoc(slot, e.target.files)} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push(`/my-shop/${shopId}`)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Shop profile
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Shop KYC</h1>
      <p className="mt-1 text-sm text-gray-500">Submit documents and payout bank details for verification.</p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 max-w-lg space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h2 className="text-sm font-bold text-gray-900">Documents</h2>
          <DocRow slot="studentId" label="Student ID" required />
          <DocRow slot="nationalId" label="National ID (NID)" required />
          <DocRow slot="bankStatement" label="Bank statement" required />
          <DocRow slot="businessLicense" label="Business license (optional)" />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900">Bank details</h2>
          <div>
            <label className={labelClass}>Account name</label>
            <input className={inputClass} value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Account number</label>
            <input className={inputClass} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Bank name</label>
            <input className={inputClass} value={bankName} onChange={(e) => setBankName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Branch name</label>
            <input className={inputClass} value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Routing number</label>
            <input className={inputClass} value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} required />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Submit KYC"}
        </button>
      </form>
    </div>
  );
}
