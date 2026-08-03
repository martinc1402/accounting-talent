import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DefinitionLedger, type LedgerRow } from "@/components/marketing/DefinitionLedger";

/*
  "Where we are right now", shared by both pages.

  HonestStatus and TheHonestPart were structural twins carrying a byte-identical
  promise <dl>, which is exactly the setup where one gets softened and the other
  does not. HonestStatus's own comment names that risk: a firm owner evaluating us
  reads /accountants within about two clicks, and "saying something softer here
  than we say there is the one move that would discredit both pages at once."
  Sharing the component does not by itself keep the two admissions honest, but it
  does mean a change to the shape of this section cannot land on one page only.

  Single column at a real reading measure, no decoration of any kind. Every other
  section on both pages is trying to persuade. This one is only trying to be
  believed, and it earns that by looking like the least designed thing on the page.

  `admission` is set in display type deliberately. It is the sentence a competitor
  would bury, so it gets the largest type in the section rather than a footnote.

  No countdown, no seat counter, no "closing soon". If a number appears here it
  has to be one the business can substantiate.
*/
export function HonestStage({
  heading,
  lede,
  body,
  admission,
  expectIntro,
  expect,
  notIntro,
  not,
  band = "white",
}: {
  heading: string;
  lede: string;
  body: readonly string[];
  admission: string;
  expectIntro: string;
  expect: readonly LedgerRow[];
  /** The counterpart list: what NOT to expect. Optional because the firm page
   *  makes that argument in its FAQ instead. */
  notIntro?: string;
  not?: readonly string[];
  band?: "white" | "mist" | "paper";
}) {
  const bandClass =
    band === "mist" ? "bg-mist" : band === "paper" ? "bg-paper" : "";

  return (
    <section className={`py-16 lg:py-28 ${bandClass}`}>
      <Container>
        <div className="max-w-[65ch]">
          <SectionHeading className="reveal">{heading}</SectionHeading>

          <p className="reveal mt-8 text-lede text-ink">{lede}</p>

          {body.map((para) => (
            <p key={para} className="reveal mt-5 text-body text-muted">
              {para}
            </p>
          ))}

          <p className="reveal display display-step mt-10 text-navy">
            {admission}
          </p>

          <p className="reveal mt-12 text-body font-medium text-ink">
            {expectIntro}
          </p>
          <div className="mt-2">
            <DefinitionLedger rows={expect} rule="bottom" stacked />
          </div>

          {notIntro && not && (
            <div className="reveal mt-12">
              <p className="text-body font-medium text-ink">{notIntro}</p>
              <ul className="mt-4">
                {not.map((line) => (
                  <li
                    key={line}
                    className="border-t border-line py-4 text-body text-muted"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
