import { Check } from "@phosphor-icons/react/dist/ssr";
import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section: candidate quality and assessment. "More than a résumé database." The
  review dimensions as a checked two-column grid, then a note making clear not
  every check applies to every candidate (careful "may include" framing lives in
  the copy, content/firms.ts).
*/
export function Assessment() {
  const { assessment } = firms;

  return (
    <section className="py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading>{assessment.heading}</SectionHeading>
          <p className="mt-5 max-w-[64ch] text-body text-muted">
            {assessment.intro}
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {assessment.dimensions.map((dimension) => (
              <li key={dimension} className="flex items-start gap-2.5">
                <Check
                  size={18}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-verified-deep"
                />
                <span className="text-body text-ink">{dimension}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[68ch] text-small text-subtle">
            {assessment.note}
          </p>
        </div>
      </Container>
    </section>
  );
}
