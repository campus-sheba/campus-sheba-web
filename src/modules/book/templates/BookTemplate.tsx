"use client";

import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";
import BookLanding from "../components/BookLanding";

export default function BookTemplate() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <BookLanding />
      </SectionWrapper>
    </PageContentWrapper>
  );
}
