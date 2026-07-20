import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 7. "What your hire actually does": two quiet lists, what moves to the
  hire and what stays with the firm, then the one-line model. No icons: the split
  itself carries the meaning. Each item sits on a hairline so the two columns read
  as parallel ledgers.
*/
function ScopeList({
  label,
  items,
}: {
  label: string;
  items: readonly string[];
}) {
  return (
    <div>
      <h3 className="text-body font-medium text-navy">{label}</h3>
      <ul className="mt-4">
        {items.map((item) => (
          <li
            key={item}
            className="border-t border-line py-3 text-body text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HireScope() {
  const { scope } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading>{scope.heading}</SectionHeading>

        <div className="mt-10 grid max-w-[860px] gap-10 sm:grid-cols-2 lg:gap-16">
          <ScopeList label={scope.movesLabel} items={scope.moves} />
          <ScopeList label={scope.staysLabel} items={scope.stays} />
        </div>

        <p className="mt-10 max-w-[68ch] text-body text-ink">{scope.closing}</p>
      </Container>
    </section>
  );
}
