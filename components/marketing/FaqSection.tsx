import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { FaqItem } from "@/content/faq";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqDeepLinks } from "@/components/faq/FaqDeepLinks";

/*
  The FAQ band, extracted from the two hand-rolled copies (the inline block in
  app/page.tsx and ShortFaq on /accountants).

  Accordion itself stays exactly as it is: a server component rendering native
  <details>, no JavaScript, working before hydration, with keyboard and
  screen-reader semantics handled by the browser. Nothing here changes that, and
  nothing should. In particular do not add aria-expanded to a <summary>: the
  element already exposes its expanded state natively, and the attribute is
  redundant at best and contradictory at worst.

  `trackOpens` mounts the existing FaqDeepLinks leaf in its analytics-only mode.
  That attaches listeners to already-rendered DOM rather than making the accordion
  a client component, so the cost is about a kilobyte of JavaScript and the
  accordion keeps working with it blocked.
*/
export function FaqSection({
  id,
  heading,
  items,
  moreLink,
  band = "white",
  trackOpens = false,
}: {
  id?: string;
  heading: string;
  items: readonly FaqItem[];
  moreLink?: { label: string; href: string };
  band?: "white" | "mist" | "paper";
  trackOpens?: boolean;
}) {
  const bandClass =
    band === "mist" ? "bg-mist" : band === "paper" ? "bg-paper" : "";

  return (
    <section id={id} className={`scroll-mt-24 py-16 lg:py-28 ${bandClass}`}>
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading>{heading}</SectionHeading>
          <div className="mt-10">
            <Accordion items={items} />
          </div>

          {moreLink && (
            <Link
              href={moreLink.href}
              className="group mt-8 inline-flex items-center gap-1.5 text-body font-medium text-navy transition-colors hover:text-navy-deep"
            >
              {moreLink.label}
              <ArrowRight
                size={16}
                weight="light"
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </Container>

      {trackOpens && <FaqDeepLinks syncHash={false} trackOpens />}
    </section>
  );
}
