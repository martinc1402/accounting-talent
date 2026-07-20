import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MembershipChart } from "@/components/firms/MembershipChart";
import { Cta } from "@/components/firms/Cta";
import { TrustRow } from "@/components/firms/TrustRow";

/*
  Section 5. The membership story, the page's centrepiece: the offer that gets
  cheaper when it works. Three blocks (while you search / when you hire / always)
  on the left, the "what the middleman takes over time" chart on the right, an
  italic kicker, then the second CTA. Cream band.
*/
export function MembershipStory() {
  const { membership } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <SectionHeading className="max-w-[20ch]">
          {membership.heading}
        </SectionHeading>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <dl className="space-y-6 lg:col-span-6">
            {membership.blocks.map((block) => (
              <div key={block.label} className="border-t border-line pt-5">
                <dt className="text-body font-medium text-navy">
                  {block.label}
                </dt>
                <dd className="mt-1.5 max-w-[52ch] text-body text-muted">
                  {block.body}
                </dd>
              </div>
            ))}
          </dl>

          <div className="lg:col-span-6 lg:self-start">
            <MembershipChart />
          </div>
        </div>

        <p className="mt-12 max-w-[54ch] display text-[1.5rem] leading-snug text-navy italic pb-1">
          {membership.kicker}
        </p>

        <div className="mt-8">
          <Cta position="membership" />
          <div className="mt-4">
            <TrustRow />
          </div>
        </div>
      </Container>
    </section>
  );
}
