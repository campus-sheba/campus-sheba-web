"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Siren,
  Tag,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchEmergencyContactByIdAction } from "@/services/emergency-contacts";
import ReportIssueModal from "./ReportIssueModal";
import type { EmergencyContact, ContactVerificationStatus } from "@/types/emergency-contact";
import type { AppState } from "@/types/global";

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

function VerificationBanner({ status }: { status: ContactVerificationStatus }) {
  if (status === "pending-reverification") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Information may be outdated</p>
          <p className="mt-0.5 text-xs text-amber-700">This contact hasn&apos;t been verified in over 90 days. Please confirm before use.</p>
        </div>
      </div>
    );
  }
  if (status === "verify-before-calling") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">Verify before calling</p>
          <p className="mt-0.5 text-xs text-red-700">This contact hasn&apos;t been verified in over 120 days. Call at your own discretion.</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function EmergencyContactDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { state } = useAppState();
  const universityId = resolveUniversityId(state);

  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!id || !universityId) {
        if (!cancelled) {
          setLoading(false);
          setContact(null);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      const res = await fetchEmergencyContactByIdAction(id, universityId);
      if (cancelled) return;
      if (res.success && res.data) {
        setContact(res.data);
        setError(null);
      } else {
        setContact(null);
        setError(res.message ?? "Not found.");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, universityId]);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <div className="mx-auto max-w-2xl">
          <AppBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Emergency", href: "/emergency-contacts" },
              { label: contact?.name ?? "Contact" },
            ]}
          />

          <Link
            href="/emergency-contacts"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00A651] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All contacts
          </Link>

          {!universityId ? (
            <p className="mt-8 text-sm text-gray-600">Select a university to view this contact.</p>
          ) : loading ? (
            <div className="mt-8 space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          ) : error || !contact ? (
            <p className="mt-8 text-sm text-red-600">{error ?? "Contact not found."}</p>
          ) : (
            <div className="mt-8 space-y-5">
              {contact.verificationStatus && contact.verificationStatus !== "active" ? (
                <VerificationBanner status={contact.verificationStatus} />
              ) : null}

              <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <Siren className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wide">{contact.category}</span>
                  </div>
                  {contact.isSponsored ? (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      Sponsored
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-2 text-2xl font-black text-gray-900">{contact.name}</h1>
                {contact.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">{contact.description}</p>
                ) : null}
                {contact.location ? (
                  <p className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {contact.location}
                  </p>
                ) : null}
                {contact.is24h ? (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Available 24 hours
                  </span>
                ) : contact.availabilityNote ? (
                  <p className="mt-3 flex items-start gap-2 text-sm text-amber-700">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                    {contact.availabilityNote}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                {(contact.phones ?? []).map((ph) => (
                  <div key={ph.number} className="flex items-center gap-2">
                    <a
                      href={`tel:${ph.number.replace(/\s/g, "")}`}
                      className="flex-1 inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-3 text-sm font-bold text-white shadow-md hover:brightness-105"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="flex-1">
                        {ph.label ? <span className="mr-1 opacity-80">{ph.label} ·</span> : null}
                        {ph.number}
                      </span>
                    </a>
                    {ph.smsCapable ? (
                      <a
                        href={`sms:${ph.number.replace(/\s/g, "")}?body=${encodeURIComponent("Emergency — Campus Sheba")}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                      >
                        <MessageCircle className="h-4 w-4 text-teal-600" />
                        SMS
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>

              {contact.location ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4 text-[#00A651]" />
                  Open in Maps
                </a>
              ) : null}

              {(contact.tags ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contact.tags!.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Something wrong with this contact?{" "}
                  <button
                    onClick={() => setShowReport(true)}
                    className="font-semibold text-amber-600 hover:underline"
                  >
                    Report an issue
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </ContentWrapper>

      {showReport && contact ? (
        <ReportIssueModal
          contactId={contact._id}
          contactName={contact.name}
          onClose={() => setShowReport(false)}
        />
      ) : null}
    </SectionWrapper>
  );
}
