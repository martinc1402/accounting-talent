import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

/*
  Section 2. The objection, stated before the offer: full-width, directly under
  the hero, in its own pale (mist) band, distinct from the white hero above.

  The argument has moved twice now, and both moves were narrowing. It was
  PainMirror, opening on the staffing shortage and the agency margin. It became
  risk ("who is this person"), because a firm owner's first question about an
  overseas hire is not what they cost. It is now evidence: a US firm is not short
  of offshore accountants approaching it, so the scarce thing is not access, it is
  knowing which of them can do the work. Same job, sharper target.

  WHAT MUST NOT COME BACK: price is not argued here. Cost is the accountant's
  argument and it is the pitch on /accountants. A firm page that opens on cost
  reads as though it misheard the question.

  The three frustrations are a plain FeatureGrid with no icons. Icons here would
  be decorating a list of problems, and the Passport and principles sections below
  use them for the things we actually do, which is where the variation belongs.
  This also keeps the section from being the first of four consecutive icon grids.

  The three display-serif beats and the navy italic pivot are gone with the old
  argument. The pivot line survives as `problem.close`, still display type,
  because it is the sentence the next four sections exist to support. It is set
  roman rather than italic now: there is no descender-clipping reserve to
  remember, and the italic was carrying the old copy's rhetorical turn rather than
  this one's plain statement.
*/
export function Risk() {
  const { problem } = firms;

  return (
    <section className="bg-mist py-16 lg:py-28">
      <Container>
        <div className="max-w-[900px]">
          <SectionHeading className="reveal">{problem.heading}</SectionHeading>
          <p className="reveal mt-6 max-w-[64ch] text-lede text-ink">
            {problem.body}
          </p>
        </div>

        <div className="mt-12">
          <FeatureGrid items={problem.frustrations} columns={3} />
        </div>

        <p className="reveal display display-step mt-14 max-w-[28ch] text-navy">
          {problem.close}
        </p>
      </Container>
    </section>
  );
}
