import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { hero, math } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MathBars } from "@/components/home/MathBars";

/*
  The money section. The two-bar comparison itself lives in MathBars (shared with
  the employer page); this section wraps it with the heading, the lead-in, the
  takeaway line, the apply link, and the caption.
*/
export function TheMath() {
  return (
    // Cream band, the same bg-paper token "Who we're looking for" uses. It gives
    // the top of the page a white -> cream -> white -> cream rhythm rather than
    // one long white run.
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading
          kicker="The math"
          className="reveal max-w-[14ch] sm:max-w-none"
        >
          {math.h2}
        </SectionHeading>

        <p className="reveal mt-6 max-w-[62ch] text-lede text-muted">
          {math.leadIn}
        </p>

        <div className="mt-12">
          <MathBars comparison={math.comparison} />
        </div>

        {/*
          The takeaway. Weight 500, not the display face's default 300: at this
          size a 300-weight serif in navy reads washed out and pale. The weight
          has to come from .display-solid in globals.css rather than Tailwind's
          font-medium: `.display` is unlayered CSS and utilities live in @layer
          utilities, so a utility silently loses to it.
        */}
        <p className="reveal display display-step display-solid mt-6 max-w-[24ch] text-navy sm:max-w-none">
          {math.delta}
        </p>

        {/* A link, not a button: the section is an argument, not a form. Same
            label and destination as every other CTA on the site. */}
        <Link
          href="/apply"
          className="group mt-3 inline-flex items-center gap-1.5 text-caption font-medium text-navy"
        >
          {hero.cta}
          <ArrowRight
            size={14}
            weight="light"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>

        <p className="mt-2 text-caption text-subtle">
          {math.comparison.caption}
        </p>
      </Container>
    </section>
  );
}
