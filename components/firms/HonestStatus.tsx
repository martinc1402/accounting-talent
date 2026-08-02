import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 7: where we actually are. The firm-side twin of TheHonestPart on
  /accountants, and it copies that component's structure on purpose: single
  column, real reading measure, no decoration of any kind. Every other section on
  this page is trying to persuade. This one is only trying to be believed.

  "You cannot hire anyone through us today." is set in display type for the same
  reason its worker-side counterpart is. It is the sentence every competitor this
  audience has been burned by would bury, and a firm owner evaluating us will read
  /accountants within about two clicks. Saying something softer here than we say
  there is the one move that would discredit both pages at once.

  No countdown, no seat counter, no "reservations closing" line. The launch date
  is a date, and the only urgency on offer is a rate that stops being available.
*/
export function HonestStatus() {
  const { honest } = firms;

  return (
    <section className="py-16 lg:py-28">
      <Container>
        <div className="max-w-[65ch]">
          <SectionHeading className="reveal">{honest.h2}</SectionHeading>

          <p className="reveal mt-8 text-lede text-ink">{honest.lede}</p>

          {honest.body.map((para) => (
            <p key={para} className="reveal mt-5 text-body text-muted">
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
                <dd className="mt-2 text-body text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
