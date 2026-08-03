import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DefinitionLedger } from "@/components/marketing/DefinitionLedger";

/*
  Section 9: the Founding Employer programme, sitting directly above the form it
  feeds.

  EVERY LINE OF THE OFFER IS A COMMITMENT, NOT A FEATURE. "60 days of full hiring
  access" describes a tier with no implementation. "Up to 10 introductions" is us
  doing them by hand, because the matching tools are not built. Written in the
  future tense as things we will do for the first 25 firms, that is honest.
  Written in the present tense as product capability, it is not. The content file
  keeps the tense; do not "tighten" it into the present.

  The two lists are deliberately asymmetric in treatment. The offer is a ledger,
  because each item needs a sentence explaining what it actually means. The ask is
  a plain list, because each item is one sentence already and dressing it up as a
  ledger would make our side of the bargain look as considered as theirs, which is
  the wrong impression when we are asking for their time.

  THE TESTIMONIAL LINE. We ask for permission to ask later. We do not ask for a
  testimonial, and a founding place does not depend on giving one. That
  distinction is the whole difference between a founding programme and a
  reference-in-exchange-for-discount arrangement, and it is stated in the content
  rather than left implicit.

  No section id: the CTAs all target #reserve on the form below, and giving this
  its own anchor would create two competing destinations for one intent.
*/
export function FoundingProgramme() {
  const { foundingProgramme: fp } = firms;

  return (
    <section className="py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{fp.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[62ch] text-lede text-ink">
            {fp.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="reveal text-body font-medium text-ink">
              {fp.offerIntro}
            </p>
            <div className="mt-2">
              <DefinitionLedger
                rows={fp.offer.map((o) => ({ term: o.title, body: o.body }))}
                rule="bottom"
                stacked
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="reveal text-body font-medium text-ink">
              {fp.askIntro}
            </p>
            <ul className="reveal-group mt-4">
              {fp.ask.map((item) => (
                <li
                  key={item}
                  className="reveal border-t border-line py-4 text-body text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
