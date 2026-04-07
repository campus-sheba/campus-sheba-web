import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Button, Heading, Paragraph, Subtitle, Title } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { usePathname } from "@/i18n/navigation";
import { getShopCreateMessages } from "./messages";

interface ShopCreateIntroProps {
  onStart: () => void;
}

export default function ShopCreateIntro({ onStart }: ShopCreateIntroProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const messages = getShopCreateMessages(locale);
  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#A3080F] via-[#C30A12] to-[#E30A13] text-white">
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-16 bottom-2 h-60 w-60 rounded-full bg-black/10 blur-2xl" />

        <ContentWrapper maxWidth="container" padding="lg" className="relative z-10 py-16 md:py-20">
          <Subtitle color="default" className="!text-red-100 tracking-widest">
            {messages.intro.badge}
          </Subtitle>
          <Title as="h1" size="3xl" className="mt-3 !text-white md:!text-5xl">
            {messages.intro.title}
          </Title>
          <Paragraph size="sm" className="mt-4 max-w-2xl !text-red-50">
            {messages.intro.description}
          </Paragraph>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              uppercase={false}
              onClick={onStart}
              className="!border-0 !bg-white !px-7 !py-3 !text-sm !font-semibold !text-[#B20910]"
            >
              <Store className="mr-2 h-4 w-4" />
              {messages.intro.createButton}
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-red-50">
              <ShieldCheck className="h-3.5 w-3.5" />
              {messages.intro.moderationNote}
            </span>
          </div>
        </ContentWrapper>
      </section>

      <ContentWrapper maxWidth="container" padding="md">
        <SectionWrapper className="rounded-3xl border border-gray-100 p-6 md:p-8" background="white" spacing="none">
          <div className="grid gap-5 md:grid-cols-3">
            {messages.intro.facilitiesTitle.map((title, index) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E30A13]/10 text-[#D30A12]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <Heading as="h3" size="base" className="mb-2">
                  {title}
                </Heading>
                <Paragraph size="sm" color="muted">
                  {messages.intro.facilitiesDescription[index]}
                </Paragraph>
              </article>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper className="mt-6 rounded-3xl border border-gray-100 p-6 md:p-8" background="white" spacing="none">
          <Heading as="h2" size="xl" className="mb-4">
            {messages.intro.beforeTitle}
          </Heading>
          <div className="grid gap-3 md:grid-cols-2">
            {messages.intro.guidelines.map((rule) => (
              <div key={rule} className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D30A12]" />
                <Paragraph size="sm" color="muted" className="!leading-6">
                  {rule}
                </Paragraph>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              uppercase={false}
              onClick={onStart}
              className="!border-0 !bg-[#E30A13] !px-6 !py-3 !text-sm !font-semibold !text-white"
            >
              {messages.intro.continueButton}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SectionWrapper>
      </ContentWrapper>
    </div>
  );
}