import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section: security and compliance. Acknowledges the real concerns a firm has
  about a remote hire, lists the controls the firm should put in place, and
  carries the disclaimer. Deliberately makes no claim that AccountingTalent
  handles legal, tax, or compliance obligations.
*/
export function SecuritySection() {
  const { security } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading>{security.heading}</SectionHeading>
          <p className="mt-5 max-w-[64ch] text-body text-muted">
            {security.intro}
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {security.items.map((item) => (
              <li
                key={item}
                className="border-t border-line py-3.5 text-body text-ink"
              >
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[72ch] rounded-card border border-line bg-white p-5 text-small text-subtle">
            {security.disclaimer}
          </p>
        </div>
      </Container>
    </section>
  );
}
