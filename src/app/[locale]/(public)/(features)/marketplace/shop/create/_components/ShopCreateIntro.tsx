import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock3,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Button, Heading, Paragraph, Subtitle, Title } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { ShopCreateCategoryOption } from "./types";

interface ShopCreateIntroProps {
  categories: ShopCreateCategoryOption[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  onStart: (category: ShopCreateCategoryOption) => void;
}

const categoryIconMap = {
  Food: UtensilsCrossed,
  Product: Package,
  Service: Briefcase,
} as const;

export default function ShopCreateIntro({
  categories,
  categoriesLoading,
  categoriesError,
  onStart,
}: ShopCreateIntroProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const highlights = [
    {
      title: "Category-first flow",
      description: "Pick what you sell, then only see the fields your shop actually needs.",
      icon: Sparkles,
    },
    {
      title: "Student Shop only",
      description: "The backend payload always stays on the Student Shop path for this flow.",
      icon: Store,
    },
    {
      title: "My Shop handoff",
      description: "After creation, you land in My Shop to manage verification, edits, items, and orders.",
      icon: BadgeCheck,
    },
  ];

  const steps = [
    "Read the intro and expectations.",
    "Choose Food, Product, or Skill / Service.",
    "Complete the focused shop form.",
    "Continue to My Shop for the rest of the workflow.",
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-14">
      

      <ContentWrapper maxWidth="container" padding="md" className="space-y-6">
        

        <SectionWrapper className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8" background="white" spacing="none">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
            <div>
              <Heading as="h2" size="xl" className="text-slate-900">
                Before you start
              </Heading>
              <Paragraph size="sm" color="muted" className="mt-2 max-w-2xl">
                A good launch is simple: clear branding, accurate contact information, and a category
                setup that matches how you really operate.
              </Paragraph>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#A80A12] shadow-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A80A12]">
                    Flow Summary
                  </p>
                  <Heading as="h3" size="base" className="mt-1 text-slate-900">
                    What happens next
                  </Heading>
                </div>
                <Clock3 className="h-5 w-5 text-slate-400" />
              </div>

              <div className="space-y-3">
                {[
                  "Select a shop category from the modal.",
                  "Fill only the fields that apply to that category.",
                  "Submit once, then continue in My Shop.",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 rounded-xl bg-white px-3 py-3 shadow-sm">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#E30A13]" />
                    <Paragraph size="sm" color="muted" className="!leading-6">
                      {line}
                    </Paragraph>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#E30A13]/10 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Supported categories
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category.kind}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        category.available
                          ? "bg-[#E30A13]/10 text-[#A80A12]"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {category.label}
                    </span>
                  ))}
                </div>
                {categoriesError ? (
                  <p className="mt-3 text-xs leading-5 text-amber-700">
                    {categoriesError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <Button
              size="lg"
              uppercase={false}
              onClick={() => setShowCategoryModal(true)}
              className="!border-0 !bg-[#E30A13] !px-6 !py-3 !text-sm !font-semibold !text-white"
            >
              Start Create Type
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SectionWrapper>
      </ContentWrapper>

      {showCategoryModal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A80A12]">
                  Shop Category
                </p>
                <Heading as="h2" size="xl" className="mt-1 text-slate-900">
                  What are you planning to sell?
                </Heading>
                <Paragraph size="sm" color="muted" className="mt-2 max-w-2xl">
                  Pick the category that matches your shop. The next page will only show the fields that
                  apply to that flow.
                </Paragraph>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            {categoriesLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Loading available shop categories...
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              {categories.map((category) => {
                const Icon = categoryIconMap[category.kind];

                return (
                  <button
                    key={category.kind}
                    type="button"
                    disabled={!category.available}
                    onClick={() => category.available && onStart(category)}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      category.available
                        ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#E30A13]/35 hover:shadow-lg"
                        : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${category.available ? "bg-[#E30A13]/10 text-[#A80A12]" : "bg-slate-100 text-slate-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${
                          category.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {category.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <Heading as="h3" size="base" className="text-slate-900">
                      {category.label}
                    </Heading>
                    <Paragraph size="sm" color="muted" className="mt-2 !leading-6">
                      {category.description}
                    </Paragraph>

                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#A80A12]">
                      Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {categoriesError ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {categoriesError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}