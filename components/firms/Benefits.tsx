import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";

/*
  The value proposition, four benefit cards under one heading. Cards in a 2x2
  grid (not a 3-across row): elevation here communicates four distinct, parallel
  reasons, and the fourth card breaks the templated three-card rhythm.
*/
export function Benefits() {
  const { benefits } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading className="max-w-[22ch]">
          {benefits.heading}
        </SectionHeading>
        <p className="mt-5 max-w-[64ch] text-body text-muted">
          {benefits.intro}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {benefits.items.map((item) => (
            <Card key={item.title}>
              <CardTitle className="text-navy">{item.title}</CardTitle>
              <CardBody>{item.body}</CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
