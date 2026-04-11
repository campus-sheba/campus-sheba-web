"use client";

import { ArrowLeft, ExternalLink, MapPin, MessageCircle, Phone, Siren } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchEmergencyContactByIdAction } from "@/services/emergency-contacts";
import type { EmergencyContact } from "@/types/emergency-contact";
import type { AppState } from "@/types/global";

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

export default function EmergencyContactDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { state } = useAppState();
  const universityId = resolveUniversityId(state);

  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !universityId) {
      setLoading(false);
      setContact(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
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
    return () => {
      cancelled = true;
    };
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
          <div className="mt-8 h-48 animate-pulse rounded-2xl bg-gray-100" />
        ) : error || !contact ? (
          <p className="mt-8 text-sm text-red-600">{error ?? "Contact not found."}</p>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-red-700">
                <Siren className="h-6 w-6" />
                <span className="text-xs font-bold uppercase tracking-wide">{contact.category}</span>
              </div>
              <h1 className="mt-2 text-2xl font-black text-gray-900">{contact.name}</h1>
              {contact.description ? <p className="mt-3 text-sm leading-relaxed text-gray-700">{contact.description}</p> : null}
              {contact.location ? (
                <p className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {contact.location}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {(contact.phoneNumbers ?? []).map((num) => (
                <a
                  key={num}
                  href={`tel:${num.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-3 text-sm font-bold text-white shadow-md hover:brightness-105"
                >
                  <Phone className="h-4 w-4" />
                  Call {num}
                </a>
              ))}
              {contact.hasSMS && contact.phoneNumbers?.[0] ? (
                <a
                  href={`sms:${contact.phoneNumbers[0].replace(/\s/g, "")}?body=${encodeURIComponent("Emergency — Campus Sheba")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <MessageCircle className="h-4 w-4 text-teal-600" />
                  SMS
                </a>
              ) : null}
            </div>

            {contact.location ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 text-[#00A651]" />
                Open location in Maps
              </a>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {(contact.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
