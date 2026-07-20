import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { FoundingForm } from "@/components/firms/FoundingForm";
import { WhyNowTimeline } from "@/components/firms/WhyNowTimeline";
import { PoolGrid } from "@/components/firms/PoolGrid";
import { HiringSteps } from "@/components/firms/HiringSteps";
import { HireScope } from "@/components/firms/HireScope";
import { BuilderNote } from "@/components/firms/BuilderNote";
import { MathBars } from "@/components/home/MathBars";
import { FinalCta } from "@/components/home/FinalCta";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

/*
  Its own OpenGraph, not the root's. The root OG sells the worker ("Work Directly
  for US Accounting Firms"), so without this a firm owner sharing /employers in a
  Slack or Facebook group previewed the accountant pitch. Title and description
  match the ones below; the dash in the supplied title tag is a comma here, per
  the site's no-em-dash convention.
*/
const OG_TITLE = "Hire Verified Indian Accountants Directly, No Agency Markup";
const OG_DESCRIPTION =
  "A verified database of Indian bookkeepers, staff accountants, and US tax preparers. You search, interview, hire, and pay them directly. Flat subscription, no per-hire fees. Founding firms get first access.";

export const metadata: Metadata = {
  title: { absolute: `${OG_TITLE} | AccountingTalent.in` },
  description: OG_DESCRIPTION,
  openGraph: {
    // A page openGraph (and twitter) replaces the root's (Next does not
    // deep-merge them), so siteName/locale are repeated to match the rest of the
    // site, and twitter is set here rather than inherited from the homepage.
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: "https://accountingtalent.in/employers",
    siteName: "AccountingTalent.in",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

/*
  The employer page, top to bottom (Section 1 -> 10). Section 1 keeps the
  two-column hero (copy left, founding-firm card right); everything below stacks
  full width, alternating white and cream bands for rhythm. The founding card,
  the proof triad (Section 5), and the FAQ (Section 9) are assembled here; the
  rest are section components in components/firms. All copy resolves from
  content/firms.ts.
*/
export default function ForFirmsPage() {
  const { proof } = firms;

  return (
    <>
      <Nav active="/employers" />

      <main className="flex-1">
        {/* Section 1 + 2: hero copy left, founding-firm card right. */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7 lg:self-center">
            <h1 className="display display-hero text-ink">{firms.hero.h1}</h1>

            <p className="mt-7 max-w-[56ch] text-body text-muted">
              {firms.hero.sub}
            </p>

            {/* The pull-line: serif italic navy, its own air. It states the whole
                model in one breath. leading-[1.2] + pb-1 clears the descenders in
                the italic ("pay", "you"). */}
            <p className="mt-8 display text-[1.75rem] leading-[1.2] text-navy italic pb-1">
              {firms.hero.pullLine}
            </p>
            <p className="mt-2 text-small text-subtle">{firms.hero.subNote}</p>
          </div>

          <div className="lg:col-span-5 lg:self-start">
            {/* scroll-mt-24 clears the sticky header when the nav CTA jumps here. */}
            <div
              id="founding"
              className="scroll-mt-24 rounded-card bg-mist p-7"
            >
              <FoundingForm />
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <WhyNowTimeline />

        {/* Section 4 */}
        <PoolGrid />

        {/* Section 5: the proof triad. Three blocks with rule dividers; block 2
            carries the bar chart and the salary bands. */}
        <section className="bg-paper py-16 lg:py-28">
          <Container>
            <div className="max-w-[820px]">
              {proof.blocks.map((block) => (
                <div
                  key={block.title}
                  className="border-t border-line py-8 first:border-t-0 first:pt-0"
                >
                  <h2 className="display text-2xl text-ink">{block.title}</h2>

                  {Array.isArray(block.body) ? (
                    block.body.map((para) => (
                      <p
                        key={para.slice(0, 24)}
                        className="mt-3 max-w-[64ch] text-body text-muted"
                      >
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="mt-3 max-w-[64ch] text-body text-muted">
                      {block.body}
                    </p>
                  )}

                  {"comparison" in block && (
                    <div className="mt-8">
                      <MathBars comparison={block.comparison} />
                      <p className="mt-2 text-caption text-subtle">
                        {block.comparison.caption}
                      </p>

                      <ul className="mt-7 flex flex-wrap gap-2">
                        {block.salaryChips.map((chip) => (
                          <li
                            key={chip}
                            className="rounded-full border border-line bg-white px-3 py-1 text-caption text-muted"
                          >
                            {chip}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-caption text-subtle">
                        {block.salaryNote}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Section 6 */}
        <HiringSteps />

        {/* Section 7 */}
        <HireScope />

        {/* Section 8 */}
        <BuilderNote />

        {/* Section 9: FAQ. */}
        <section id="faq" className="scroll-mt-24 bg-paper py-16 lg:py-28">
          <Container>
            <SectionHeading>{firms.faqHeading}</SectionHeading>
            <div className="mt-8 max-w-[760px]">
              <Accordion items={employerFaq} />
            </div>
          </Container>
        </section>

        {/* Section 10 */}
        <FinalCta
          content={{
            heading: firms.finalCta.heading,
            sub: firms.finalCta.sub,
            button: firms.finalCta.button,
          }}
        />
      </main>

      <Footer />
    </>
  );
}
