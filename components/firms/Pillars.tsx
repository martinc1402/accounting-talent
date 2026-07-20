import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MathBars } from "@/components/home/MathBars";

/*
  Section 4. Three benefit pillars, rule-divided in the same rhythm the old proof
  triad used. The middle pillar ("Keep the middleman's margin") carries the bar
  chart and the salary bands; the check for `comparison` moves the chart with the
  pillar, so reordering content needs no page change.
*/
export function Pillars() {
  const { pillars } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading>{pillars.heading}</SectionHeading>

        <div className="mt-4 max-w-[820px]">
          {pillars.items.map((pillar) => (
            <div key={pillar.title} className="border-t border-line py-8">
              <h3 className="display text-2xl text-ink">{pillar.title}</h3>
              <p className="mt-3 max-w-[64ch] text-body text-muted">
                {pillar.body}
              </p>

              {"comparison" in pillar && (
                <div className="mt-8">
                  <MathBars comparison={pillar.comparison} />
                  <p className="mt-2 text-caption text-subtle">
                    {pillar.comparison.caption}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-2">
                    {pillar.salaryChips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-line bg-white px-3 py-1 text-caption text-muted"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-caption text-subtle">
                    {pillar.salaryNote}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
