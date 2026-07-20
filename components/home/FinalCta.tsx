import { finalCta } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/*
  The one deliberate color block on the page. It runs straight into the navy
  footer below it, so the bottom of the site reads as a single region rather
  than two stacked bands.

  Content-driven so /employers can reuse the exact band with its own closer. The
  homepage default keeps its heading, apply button, and referral line; the
  employer page passes a sub-line and a #founding button instead. `sub` renders
  between the heading and the button; `referral` renders after it, so each page
  fills only the slots it uses.
*/

export type FinalCtaContent = {
  heading: string;
  sub?: string;
  referral?: string;
  button: { label: string; href: string };
};

const homeContent: FinalCtaContent = {
  heading: finalCta.h2,
  referral: finalCta.referral,
  // Same label as the hero. One intent, one label, everywhere on the page.
  button: { label: finalCta.cta, href: "/apply" },
};

export function FinalCta({
  content = homeContent,
}: {
  content?: FinalCtaContent;
}) {
  return (
    <section className="bg-navy pt-20 pb-16 text-white lg:pt-28 lg:pb-20">
      <Container className="text-center">
        <h2 className="reveal display display-hero mx-auto max-w-[18ch]">
          {content.heading}
        </h2>

        {content.sub && (
          <p className="reveal mx-auto mt-6 max-w-[60ch] text-small text-white/70">
            {content.sub}
          </p>
        )}

        <div className="reveal mt-10 flex justify-center">
          <Button
            href={content.button.href}
            variant="inverse"
            className="w-full sm:w-auto"
          >
            {content.button.label}
          </Button>
        </div>

        {content.referral && (
          <p className="reveal mx-auto mt-10 max-w-[52ch] text-small text-white/65">
            {content.referral}
          </p>
        )}
      </Container>
    </section>
  );
}
