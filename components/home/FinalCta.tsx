import { finalCta } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/*
  The one deliberate color block on the page. It runs straight into the navy
  footer below it, so the bottom of the site reads as a single region rather
  than two stacked bands.
*/
export function FinalCta() {
  return (
    <section className="bg-navy pt-20 pb-16 text-white lg:pt-28 lg:pb-20">
      <Container className="text-center">
        <h2 className="reveal display display-hero mx-auto max-w-[18ch]">
          {finalCta.h2}
        </h2>

        <div className="reveal mt-10 flex justify-center">
          <Button href="/apply" variant="inverse" className="w-full sm:w-auto">
            {finalCta.cta}
          </Button>
        </div>

        <p className="reveal mx-auto mt-10 max-w-[52ch] text-small text-white/65">
          {finalCta.referral}
        </p>
      </Container>
    </section>
  );
}
