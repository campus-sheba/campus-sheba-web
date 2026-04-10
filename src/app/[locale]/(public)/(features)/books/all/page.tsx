import BookFeed from "@/modules/book/components/BookFeed";
import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";

export default function BookAllPage() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <BookFeed />
      </SectionWrapper>
    </PageContentWrapper>
  );
}

