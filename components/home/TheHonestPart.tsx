import { honest } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  The emotional core of the page, so it gets no decoration at all. Single
  column, measured type, a real reading measure. Every other section on this
  page is trying to persuade. This one is only trying to be believed.

  The column keeps its ~65ch measure but is left-aligned to the shared content
  grid like every other section, so the page has one alignment spine. It sits on
  its own calm band instead.

  "There is no job waiting for you today." is set in display type. It is the
  bravest line on the site and it was previously buried at body size in the
  middle of a paragraph stack. Every competitor this audience has been burned by
  would have hidden that sentence. Saying it loudly is the entire pitch.
*/
export function TheHonestPart() {
  return (
    <section className="py-16 lg:py-28">
      <Container>
        <div className="max-w-[65ch]">
          <SectionHeading className="reveal">{honest.h2}</SectionHeading>

          <p className="reveal mt-8 text-lede text-ink">
            {honest.lede}
          </p>

          {honest.body.map((para) => (
            <p
              key={para}
              className="reveal mt-5 text-body text-muted"
            >
              {para}
            </p>
          ))}

          <p className="reveal display display-step mt-10 text-navy">
            {honest.admission}
          </p>

          <p className="reveal mt-12 text-body font-medium text-ink">
            {honest.promiseIntro}
          </p>

          <dl className="reveal-group mt-2">
            {honest.promises.map((p) => (
              <div key={p.title} className="reveal border-b border-line py-6">
                <dt className="text-body font-medium text-navy">{p.title}</dt>
                <dd className="mt-2 text-body text-muted">
                  {p.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
