import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/*
  Section: economics. A balanced two-column comparison, traditional staffing
  versus the direct-hire model, no published fee (introductory success-fee
  wording only). The direct-hire column is the navy card so the preferred model
  reads as the answer. CTA is a mailto (no scheduling tool wired up yet).
*/
export function Economics() {
  const { economics, discuss, contactEmail } = firms;
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Hiring with AccountingTalent",
  )}`;

  return (
    <section className="py-16 lg:py-28">
      <Container>
        <SectionHeading className="max-w-[24ch]">
          {economics.heading}
        </SectionHeading>
        <p className="mt-5 max-w-[64ch] text-body text-muted">
          {economics.intro}
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* Traditional: plain white card, muted list with X markers. */}
          <div className="rounded-card border border-line bg-white p-7 lg:p-8">
            <h3 className="text-body font-medium text-ink">
              {economics.traditional.label}
            </h3>
            <ul className="mt-5 space-y-3.5">
              {economics.traditional.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <X
                    size={18}
                    weight="bold"
                    className="mt-0.5 shrink-0 text-subtle"
                    aria-hidden
                  />
                  <span className="text-small text-muted">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct hire: navy card, the answer. */}
          <div className="rounded-card border border-navy bg-navy p-7 text-white lg:p-8">
            <h3 className="text-body font-medium text-white">
              {economics.direct.label}
            </h3>
            <ul className="mt-5 space-y-3.5">
              {economics.direct.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <Check
                    size={18}
                    weight="bold"
                    className="mt-0.5 shrink-0 text-verified"
                    aria-hidden
                  />
                  <span className="text-small text-white/85">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href={mailto} variant="outline">
            {discuss.label}
          </Button>
          <p className="max-w-[46ch] text-small text-subtle">
            {economics.pricingNote}
          </p>
        </div>
      </Container>
    </section>
  );
}
