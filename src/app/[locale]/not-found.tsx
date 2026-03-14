import { ContentWrapper } from "@/components/wrappers";
import { Heading, Paragraph, Title } from "@/components/ui/typography";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <ContentWrapper maxWidth="container" padding="lg">
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        role="status"
        aria-live="polite"
      >
        <Title
          as="h1"
          size="4xl"
          weight="extrabold"
          className="text-gray-900 mb-4 text-6xl sm:text-7xl md:text-8xl"
          tabIndex={-1}
        >
          404
        </Title>

        <Heading
          as="h2"
          size="2xl"
          weight="bold"
          className="mb-4 text-gray-800"
        >
          We can’t find that page
        </Heading>

        <Paragraph size="lg" color="muted" className="max-w-md mb-8">
          The page you’re trying to reach may have been moved, renamed, or is no
          longer available.
        </Paragraph>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="md">
              Back to Home
            </Button>
          </Link>

          <Link href="/news">
            <Button variant="outline" size="md">
              View Latest News
            </Button>
          </Link>
        </div>
      </div>
    </ContentWrapper>
  );
}
