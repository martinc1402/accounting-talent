import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { homepageFaq } from "@/content/faq";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ShortFaq() {
  return (
    <section className="bg-mist py-16 lg:py-24">
      <Container>
        <SectionHeading className="reveal max-w-[16ch]">
          Questions you&rsquo;re probably asking
        </SectionHeading>

        <div className="reveal mt-10 max-w-[820px]">
          <Accordion items={homepageFaq} />

          <Link
            href="/faq"
            className="group mt-8 inline-flex items-center gap-2 text-body font-medium text-navy"
          >
            Read the full FAQ
            <ArrowRight
              size={17}
              weight="light"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
