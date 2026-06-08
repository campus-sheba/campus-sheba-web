import React from "react";

export interface LegalSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
}

/**
 * Renders a long-form legal document (privacy policy, terms of service) from
 * structured content. Server component — content comes from the next-intl
 * `legal` namespace via the page.
 */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const intro = doc?.intro ?? [];
  const sections = doc?.sections ?? [];

  return (
    <article className="mx-auto max-w-3xl px-6 py-10 lg:py-16">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
          {doc?.title}
        </h1>
        <p className="mt-3 text-sm text-gray-500">{doc?.updated}</p>
      </header>

      {intro.map((paragraph, i) => (
        <p key={`intro-${i}`} className="mb-4 leading-relaxed text-gray-700">
          {paragraph}
        </p>
      ))}

      <div className="mt-6 space-y-10">
        {sections.map((section, i) => (
          <section key={`section-${i}`}>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>

            {section.body?.map((paragraph, j) => (
              <p
                key={`body-${i}-${j}`}
                className="mb-3 leading-relaxed text-gray-700"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-2 list-disc space-y-2 pl-6 text-gray-700">
                {section.bullets.map((bullet, j) => (
                  <li key={`bullet-${i}-${j}`} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
