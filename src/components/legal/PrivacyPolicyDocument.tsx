import { Link } from "@/i18n/navigation";

const EMAIL = "shahinbashar2@gmail.com";
const SUPPORT = "support@campussheba.com";

/* ── Building blocks ─────────────────────────────────────── */

function Section({
  num,
  label,
  children,
}: {
  num: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-x-12 gap-y-5 border-t border-gray-200 pt-12 lg:grid-cols-[200px_1fr]">
      <div className="lg:sticky lg:top-10 self-start">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
          {num}
        </span>
        <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-gray-900">
          {label}
        </h2>
      </div>
      <div className="max-w-2xl text-[15px] leading-relaxed text-gray-600">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 last:mb-0">{children}</p>;
}

function Term({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-gray-900">{children}</span>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-4 space-y-3 last:mb-0">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5">
          <span className="absolute left-0 top-[0.6em] h-1 w-1 -translate-y-1/2 rounded-full bg-[#E30B12]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 first:mt-0">
      {children}
    </h3>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-[#E30B12]"
    >
      {children}
    </a>
  );
}

function MailLink({ to }: { to: string }) {
  return (
    <a
      href={`mailto:${to}`}
      className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-[#E30B12]"
    >
      {to}
    </a>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function PrivacyPolicyDocument() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6">
        {/* Masthead */}
        <div className="border-b border-gray-200 py-16 sm:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
            Legal · Privacy
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            How we collect, use, and protect your information when you use the
            Campus Sheba mobile application.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-400">
            <code className="font-mono text-gray-500">com.campussheba.user</code>
            <span className="text-gray-300">·</span>
            <span>Effective June 10, 2026</span>
            <span className="text-gray-300">·</span>
            <span>Last updated June 10, 2026</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Live Bus Tracking", "Transport Fare", "AI Assistant", "Campus Services"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[12px] font-medium text-gray-600"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Intro */}
        <div className="border-b border-gray-200 py-12">
          <p className="max-w-3xl text-[15px] leading-relaxed text-gray-600">
            This Privacy Policy describes how Campus Sheba (<Term>"we"</Term>,{" "}
            <Term>"us"</Term>, or <Term>"our"</Term>) collects, uses, and
            protects your information when you use the Campus Sheba mobile
            application (the <Term>"App"</Term>), available on the Google Play
            Store and Apple App Store. By using the App, you agree to the
            practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12 py-12">
          <Section num="01" label="Information We Collect">
            <Sub>1.1 — Information you provide</Sub>
            <List
              items={[
                <>
                  <Term>Account information:</Term> name, phone number, email
                  address, student/staff identifier, and profile details you
                  provide during registration and one-time-password (OTP)
                  verification.
                </>,
                <>
                  <Term>Profile photo:</Term> images you choose to upload from
                  your device camera or photo gallery.
                </>,
                <>
                  <Term>AI chat messages:</Term> questions and messages you send
                  to the in-app AI assistant.
                </>,
                <>
                  <Term>Support communications:</Term> information you send when
                  contacting us for help or feedback.
                </>,
              ]}
            />
            <Sub>1.2 — Information collected automatically</Sub>
            <List
              items={[
                <>
                  <Term>Location data:</Term> precise (GPS) and approximate
                  location, used for campus transport features such as live bus
                  tracking, fare lookup, and route information. If you opt in as
                  a bus location sharer, location may also be collected in the
                  background while sharing is active, including via a visible
                  foreground service notification.
                </>,
                <>
                  <Term>Device and usage data:</Term> device model, operating
                  system version, app version, language, and anonymized usage
                  analytics (only when analytics is enabled).
                </>,
                <>
                  <Term>Push notification token:</Term> a device token used to
                  deliver notifications about campus services, schedules, and
                  announcements.
                </>,
              ]}
            />
            <Sub>1.3 — Information processed only on your device</Sub>
            <List
              items={[
                <>
                  <Term>Biometric data:</Term> if you enable biometric login
                  (fingerprint or face unlock), authentication is performed
                  entirely by your device's operating system. We never collect,
                  store, or transmit your biometric data.
                </>,
                <>
                  <Term>Sensor data:</Term> motion sensor readings used locally
                  to improve location-sharing accuracy are not stored or
                  transmitted as raw sensor data.
                </>,
              ]}
            />
          </Section>

          <Section num="02" label="How We Use Your Information">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Data
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    [
                      "Account & contact details",
                      "Create and manage your account, verify identity via OTP, personalize the App",
                    ],
                    [
                      "Location data",
                      "Show nearby campus buses in real time, calculate transport fares, display routes on the map",
                    ],
                    [
                      "AI chat messages",
                      "Generate AI assistant responses; manage your AI credit usage",
                    ],
                    [
                      "Device & usage data",
                      "Maintain, secure, and improve the App; diagnose crashes and errors",
                    ],
                    [
                      "Notification token",
                      "Send service updates, schedules, and announcements you have opted in to receive",
                    ],
                  ].map(([data, purpose]) => (
                    <tr key={data} className="align-top">
                      <td className="w-2/5 px-4 py-3 font-semibold text-gray-900">
                        {data}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section num="03" label="Third-Party Services">
            <P>
              The App uses the following third-party services, which may process
              data as described in their own privacy policies:
            </P>
            <List
              items={[
                <>
                  <Term>Firebase Cloud Messaging</Term> (Google) — push
                  notifications.{" "}
                  <ExtLink href="https://firebase.google.com/support/privacy">
                    Privacy
                  </ExtLink>
                </>,
                <>
                  <Term>Firebase Analytics</Term> (Google) — anonymized usage
                  analytics, disabled by default and enabled only with consent
                  where required.{" "}
                  <ExtLink href="https://firebase.google.com/support/privacy">
                    Privacy
                  </ExtLink>
                </>,
                <>
                  <Term>Google Maps Platform</Term> — map display and geocoding.{" "}
                  <ExtLink href="https://policies.google.com/privacy">
                    Privacy
                  </ExtLink>
                </>,
                <>
                  <Term>Google AI (Gemini)</Term> — processing of AI assistant
                  conversations.{" "}
                  <ExtLink href="https://policies.google.com/privacy">
                    Privacy
                  </ExtLink>
                </>,
              ]}
            />
            <P>
              <Term>We do not sell your personal information to any third party.</Term>
            </P>
          </Section>

          <Section num="04" label="Background Location Disclosure">
            <div className="border-l-2 border-[#E30B12] bg-gray-50 px-5 py-4 text-gray-700">
              Campus Sheba collects location data to enable{" "}
              <Term>live bus location sharing</Term> even when the App is closed
              or not in use, <Term>only if</Term> you explicitly opt in as a
              location sharer. A persistent notification is shown the entire time
              sharing is active, and you can stop sharing at any moment from the
              App or the notification. Background location is never collected for
              passengers who only view bus positions.
            </div>
          </Section>

          <Section num="05" label="Data Retention">
            <List
              items={[
                "Account data is retained while your account remains active.",
                "Live location data is used in real time and is not retained as a long-term location history.",
                "AI chat history is retained to provide conversation continuity and may be deleted by you in the App or upon request.",
                "When your account is deleted, associated personal data is removed from our systems within 30 days, except where retention is required by law.",
              ]}
            />
          </Section>

          <Section num="06" label="Account & Data Deletion">
            <P>You may delete your account and associated data at any time:</P>
            <List
              items={[
                <>
                  <Term>In the App:</Term> Profile → Settings → Delete Account.
                </>,
                <>
                  <Term>By email:</Term> send a deletion request to{" "}
                  <MailLink to={EMAIL} /> from your registered email or phone
                  number.
                </>,
              ]}
            />
          </Section>

          <Section num="07" label="Your Rights & Choices">
            <List
              items={[
                "Access, correct, or delete your personal data.",
                "Revoke location, camera, photo, or notification permissions at any time via your device settings; related features will stop working but the rest of the App remains usable.",
                "Disable biometric login at any time in the App settings.",
                "Opt out of analytics where the option is provided.",
              ]}
            />
          </Section>

          <Section num="08" label="Data Security">
            <P>
              We use industry-standard safeguards including encrypted network
              connections (HTTPS/TLS), authenticated API access, and access
              controls on our servers. No method of transmission or storage is
              100% secure, but we work to protect your data using commercially
              reasonable measures.
            </P>
          </Section>

          <Section num="09" label="Children's Privacy">
            <P>
              The App is intended for university students, staff, and members of
              the campus community. It is not directed to children under 13, and
              we do not knowingly collect personal information from children
              under 13. If you believe a child has provided us personal
              information, contact us and we will delete it.
            </P>
          </Section>

          <Section num="10" label="International Users">
            <P>
              Your information may be processed on servers located outside your
              country of residence. We take steps to ensure your data receives an
              adequate level of protection wherever it is processed.
            </P>
          </Section>

          <Section num="11" label="Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. Material
              changes will be announced in the App or on this page, and the "Last
              updated" date above will be revised. Continued use of the App after
              changes take effect constitutes acceptance of the updated policy.
            </P>
          </Section>

          <Section num="12" label="Contact Us">
            <P>
              For questions, concerns, or requests regarding this Privacy Policy
              or your personal data, reach us at <MailLink to={EMAIL} />.
            </P>
          </Section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Link href="/privacy-policy" className="transition-colors hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/account-deletion" className="transition-colors hover:text-gray-900">
              Account Deletion
            </Link>
            <a href={`mailto:${SUPPORT}`} className="transition-colors hover:text-gray-900">
              Support
            </a>
          </nav>
          <p className="text-[13px] text-gray-400">© 2026 Campus Sheba. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
