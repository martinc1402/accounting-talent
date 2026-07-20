import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { FoundingForm } from "@/components/firms/FoundingForm";
import { PainMirror } from "@/components/firms/PainMirror";
import { Pillars } from "@/components/firms/Pillars";
import { MembershipStory } from "@/components/firms/MembershipStory";
import { PoolGrid } from "@/components/firms/PoolGrid";
import { WhyNowTimeline } from "@/components/firms/WhyNowTimeline";
import { HiringSteps } from "@/components/firms/HiringSteps";
import { HireScope } from "@/components/firms/HireScope";
import { ComplianceBand } from "@/components/firms/ComplianceBand";
import { BuilderNote } from "@/components/firms/BuilderNote";
import { Cta } from "@/components/firms/Cta";
import { TrustRow } from "@/components/firms/TrustRow";
import { StickyCtaBar } from "@/components/firms/StickyCtaBar";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

/*
  Its own OpenGraph + Twitter, not the root's. The root OG sells the worker
  ("Work Directly for US Accounting Firms"), so without this a firm owner sharing
  /employers previewed the accountant pitch.
*/
const OG_TITLE = "Hire Verified Indian Accountants Directly, No Agency Markup";
const OG_DESCRIPTION =
  "A verified database of Indian bookkeepers, staff accountants, and US tax preparers. You search, interview, hire, and pay them directly. Flat subscription, no per-hire fees. Founding firms get first access.";

export const metadata: Metadata = {
  title: { absolute: `${OG_TITLE} | AccountingTalent.in` },
  description: OG_DESCRIPTION,
  openGraph: {
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
  Regenerate daily so the "Tax season starts in N weeks" line (computed from the
  server date in WhyNowTimeline) stays current without the page going dynamic.
*/
export const revalidate = 86400;

/*
  The employer page, persuasion-first order: pain-led hero (+ founding card) ->
  pain mirror -> three pillars -> membership story -> pool -> tax-season urgency
  -> how it works -> what your hire does -> compliance -> founder note -> FAQ ->
  final CTA. Four "Become a founding firm" CTAs down the page (hero form,
  membership, pool, final) plus a mobile sticky bar. All copy resolves from
  content/firms.ts.
*/
export default function ForFirmsPage() {
  const { hero } = firms;

  return (
    <>
      <Nav active="/employers" />

      <main className="flex-1">
        {/* Section 1 + 2: pain-led hero (left) + founding-firm card (right). */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7 lg:self-center">
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 display display-hero text-ink">{hero.h1}</h1>

            <p className="mt-6 max-w-[56ch] text-body text-muted">{hero.sub}</p>

            {/* The pull-line: serif italic navy, its own air. leading-[1.2] + pb-1
                clears the descenders in the italic. */}
            <p className="mt-8 display text-[1.75rem] leading-[1.2] text-navy italic pb-1">
              {hero.pullLine}
            </p>

            <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {hero.microProof.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-small text-muted"
                >
                  <Check
                    size={15}
                    weight="bold"
                    className="shrink-0 text-verified-deep"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:self-start">
            {/* scroll-mt-24 clears the sticky header when a CTA jumps here. */}
            <div id="founding" className="scroll-mt-24 rounded-card bg-mist p-7">
              <FoundingForm />
            </div>
          </div>
        </section>

        <PainMirror />

        <Pillars />

        <MembershipStory />

        <PoolGrid />

        <WhyNowTimeline />

        <HiringSteps />

        <HireScope />

        <ComplianceBand />

        <BuilderNote />

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 bg-paper py-16 lg:py-28">
          <Container>
            <SectionHeading>{firms.faqHeading}</SectionHeading>
            <div className="mt-8 max-w-[760px]">
              <Accordion items={employerFaq} />
            </div>
          </Container>
        </section>

        {/* Final CTA band (navy). Its own tracked CTA + trust row, so it does not
            reuse the homepage-shared FinalCta. */}
        <section className="bg-navy pt-20 pb-16 text-white lg:pt-28 lg:pb-20">
          <Container className="text-center">
            <h2 className="display display-hero mx-auto max-w-[20ch]">
              {firms.finalCta.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-small text-white/70">
              {firms.finalCta.sub}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Cta position="final" tone="inverse" />
              <TrustRow tone="inverse" />
            </div>
          </Container>
        </section>
      </main>

      <Footer />

      <StickyCtaBar />
    </>
  );
}
