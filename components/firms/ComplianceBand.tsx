import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";

/*
  Section 10. Compliance handled: the old proof block's copy, now a slim
  full-width band. One line of reassurance between the logistics sections and the
  founder note.
*/
export function ComplianceBand() {
  const { compliance } = firms;

  return (
    <section className="border-y border-line bg-paper py-12">
      <Container>
        <div className="max-w-[760px]">
          <h2 className="display text-2xl text-ink">{compliance.title}</h2>
          <p className="mt-3 max-w-[68ch] text-body text-muted">
            {compliance.body}
          </p>
        </div>
      </Container>
    </section>
  );
}
