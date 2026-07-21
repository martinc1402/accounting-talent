import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section: roles we place (#roles). Talent categories as a plain two-column list
  (no fabricated profile cards), then the software candidates commonly work in as
  chips, with an honest note that experience varies. Replaces the old sample-
  profile grid.
*/
export function RolesAvailable() {
  const { roles } = firms;

  return (
    <section id="roles" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <SectionHeading>{roles.heading}</SectionHeading>
        <p className="mt-5 max-w-[60ch] text-body text-muted">{roles.intro}</p>

        <ul className="mt-10 grid max-w-[820px] gap-x-10 gap-y-0 sm:grid-cols-2">
          {roles.categories.map((category) => (
            <li
              key={category}
              className="border-t border-line py-4 text-body text-ink"
            >
              {category}
            </li>
          ))}
        </ul>

        <div className="mt-12 max-w-[820px]">
          <h3 className="text-body font-medium text-navy">
            {roles.softwareLabel}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {roles.software.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-small text-muted"
              >
                {tool}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[64ch] text-small text-subtle">
            {roles.softwareNote}
          </p>
        </div>
      </Container>
    </section>
  );
}
