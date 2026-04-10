import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchUniversities } from "@/services/universities";
import { Building2, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function UniversitiesSection() {
  const t = useTranslations("common.home");
  const [universities, setUniversities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setIsLoading(true);
        const response = await fetchUniversities(1, 10);
        setUniversities(
          response.map((university) => university.name).filter(Boolean),
        );
      } catch {
        setUniversities([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUniversities();
  }, []);

  return (
    <SectionWrapper
      spacing="none"
      background="transparent"
      className="my-0 border-y border-neutral-100 bg-white py-14"
    >
      <ContentWrapper maxWidth="container" padding="none">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
          {t("servingStudentsAt")}
        </p>
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`university-skeleton-${index}`}
                className="h-9 w-40 animate-pulse rounded-full border border-neutral-200 bg-neutral-100"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {universities.map((university) => (
              <div
                key={university}
                className="group flex cursor-default items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2 transition-all duration-200 hover:border-brand-green-DEFAULT hover:bg-brand-green-50 md:py-2.5"
              >
                <Building2 className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-brand-green-DEFAULT" />
                <span className="text-xs font-medium text-neutral-600 transition-colors group-hover:text-brand-green-700 md:text-sm">
                  {university}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-brand-green-DEFAULT/30 bg-brand-green-50 px-5 py-2 md:py-2.5">
              <Globe className="h-3.5 w-3.5 text-brand-green-DEFAULT" />
              <span className="text-xs font-semibold text-brand-green-700 md:text-sm">
                {t("moreComing")}
              </span>
            </div>
          </div>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}