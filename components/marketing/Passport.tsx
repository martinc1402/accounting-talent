import { passportPillars, type PassportPillar } from "@/content/passport";
import { ICONS } from "@/components/marketing/icons";
import { StatusLabel } from "@/components/marketing/StatusLabel";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  The five Passport pillars, rendered for one audience at a time.

  ONE COMPONENT AND ONE CONTENT ARRAY FOR BOTH PAGES. A firm is told what each
  pillar proves; an accountant is told how to earn it. Those are two descriptions
  of the same thing, and held in two components they drift until the product is
  described differently to each side. `audience` picks which sentence to render;
  it does not pick a different set of pillars.

  Layout is a staggered ledger, not a five-card grid. Five equal cards would be
  the fourth card grid on the page and would give the same weight to a pillar that
  is live and a pillar that does not exist yet. Here the rank is legible: the
  pillar name is display type, the evidence items sit as a quiet inline list, and
  the `today` note is what an unbuilt pillar leads with.

  THE `today` NOTE IS THE POINT OF THIS SECTION. Three of the five pillars are not
  built. Each one says what exists today in its own words, immediately under the
  promise, in the same measure. It is not a footnote at the bottom of the section
  and it must not become one: a reader who scans only the pillar they care about
  has to hit the caveat for that pillar.
*/
export function Passport({
  heading,
  intro,
  audience,
  band = "white",
  pillars = passportPillars,
}: {
  heading: string;
  intro: string;
  audience: "employer" | "accountant";
  band?: "white" | "mist" | "paper";
  pillars?: readonly PassportPillar[];
}) {
  const bandClass =
    band === "mist" ? "bg-mist" : band === "paper" ? "bg-paper" : "";

  return (
    <section id="passport" className={`scroll-mt-24 py-16 lg:py-28 ${bandClass}`}>
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-lede text-ink">{intro}</p>
        </div>

        <div className="reveal-group mt-12">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="reveal grid gap-y-4 border-t border-line py-9 lg:grid-cols-12 lg:gap-x-10"
            >
              <div className="lg:col-span-4">
                <span className="text-navy" aria-hidden>
                  {ICONS[pillar.icon]}
                </span>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="display display-step text-navy">
                    {pillar.name}
                  </h3>
                  <StatusLabel status={pillar.status} />
                </div>
              </div>

              <div className="lg:col-span-8">
                <p className="max-w-[62ch] text-body text-ink">
                  {audience === "employer" ? pillar.employer : pillar.accountant}
                </p>

                <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
                  {pillar.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line px-3 py-1 text-caption text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {pillar.today && (
                  <p className="mt-5 max-w-[62ch] border-l-2 border-navy/20 pl-4 text-small text-subtle">
                    {pillar.today}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
