import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProfileCard } from "@/components/home/ProfileCard";
import { Cta } from "@/components/firms/Cta";

/*
  Section 6 (#pool). The momentum line and the process line, then a grid of the
  actual product: verified-profile cards (clearly-labelled samples with stock
  portraits; the caption says "sample"), then an inline CTA. When real consented
  profiles replace `firms.pool.samples`, drop the `sample` flag on the cards and
  swap `sampleCaption` for `realCaption`.
*/
export function PoolGrid() {
  const { pool } = firms;

  return (
    <section id="pool" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <SectionHeading>{pool.heading}</SectionHeading>

        <p className="mt-6 max-w-[62ch] text-lede text-muted">{pool.momentum}</p>
        <p className="mt-4 max-w-[62ch] text-body text-muted">{pool.process}</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pool.samples.map((sampleProfile) => (
            <ProfileCard
              key={sampleProfile.name}
              profile={sampleProfile}
              sample
            />
          ))}
        </div>

        <p className="mt-6 text-caption text-subtle">{pool.sampleCaption}</p>

        <p className="mt-8 text-body text-muted">
          {pool.ctaLead}{" "}
          <Cta position="pool" variant="link" />
        </p>
      </Container>
    </section>
  );
}
