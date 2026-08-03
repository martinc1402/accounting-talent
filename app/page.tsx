import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Risk } from "@/components/firms/Risk";
import { NetworkLoop } from "@/components/firms/NetworkLoop";
import { BuiltAroundWork } from "@/components/firms/BuiltAroundWork";
import { HowHiringWorks } from "@/components/firms/HowHiringWorks";
import { SampleProfiles } from "@/components/firms/SampleProfiles";
import { Pricing } from "@/components/firms/Pricing";
import { FoundingProgramme } from "@/components/firms/FoundingProgramme";
import { HonestStatus } from "@/components/firms/HonestStatus";
import { EmployerBrief } from "@/components/firms/EmployerBrief";
import { HeroCtas } from "@/components/firms/HeroCtas";
import { Cta } from "@/components/firms/Cta";
import { TrustLine } from "@/components/marketing/TrustLine";
import { StickyCtaBar } from "@/components/firms/StickyCtaBar";
import { Passport } from "@/components/marketing/Passport";
import { FaqSection } from "@/components/marketing/FaqSection";
import { ProfileCard } from "@/components/home/ProfileCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

/*
  Firm-facing homepage. Every section reads from content/firms.ts (and, for the
  parts both audiences see, content/passport.ts), so a copy change stays a data
  change.

  The argument, in order, and the order is the argument: what is actually hard
  about this (the reframe), what we are building to fix it (the Passport), why it
  compounds (the loop), what kind of product it is and is not (principles), how
  you would actually hire (steps, with each step's real status), here is what a
  profile looks like (the network), what it costs, the founding offer, the form,
  where we honestly are, questions, close.

  Price sits eighth rather than first because a firm that does not believe the
  evidence is real does not care what access to it costs.

  Bands from the top: white (hero) / mist (reframe) / white (passport) / white
  (loop) / paper (principles) / white (how hiring works) / paper (the network) /
  white (pricing) / white (founding) / mist (the form) / white (honest) / white
  (faq) / navy (final cta + footer). Padding, never margins, so the bands sit
  flush. One theme throughout: no section inverts to dark mid-page except the
  closing band.

  NO `revalidate` AND NO ISR. This route is fully static and that is
  load-bearing: it has no request-time dependency at all, which is why UTM capture
  in the form and plan preselection from the pricing CTAs are both done
  client-side rather than through searchParams. Reinstating anything that reads
  Supabase, or any searchParams access, means putting a revalidate back and losing
  that. A live applicant count was removed for this reason once already.
*/

export const metadata: Metadata = pageMetadata({
  title: "Hire Indian Accountants | AccountingTalent",
  description:
    "Discover Indian accounting professionals through verified profiles, practical work evidence and trusted professional vouches. Browse free and post your first role free.",
  path: "/",
  ogTitle: "Hire Indian accountants based on proof, not promises.",
  ogDescription:
    "A professional network for Indian accounting talent. Verified profiles, practical work evidence and vouches from people who have seen the work. Browse free.",
  locale: "en_US",
});

export default function HomePage() {
  const { hero } = firms;

  return (
    <>
      <Nav active="/" />
      <main className="flex-1">
        {/*
          Hero. 7/5 split. pt-14/lg:pt-20 keeps the headline near the top of the
          viewport; anything more and the hero floats halfway down and reads as a
          bug.

          The right column is the product rather than a picture of it. ProfileCard
          requires its `example` prop, so the card cannot render here without
          saying what it is.

          Five text elements, one more than the four this hero was cut to. The
          fifth is `microcopy`, and it is a different kind of line from the one
          that was removed: that one argued the product ("no monthly markup, no
          exclusivity") and belonged further down; this one answers the only
          question a firm has before it clicks anything, which is what looking
          costs. If it ever goes back to arguing rather than answering, cut it.
        */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          {/*
            self-start, NOT self-center. The profile card is around 800px tall
            and the copy column is around 385px, so centering the copy against it
            pushed the eyebrow to y=380 on a 900px viewport: the headline sat
            below the vertical midpoint with a screen-height band of nothing above
            it, which reads as a layout bug rather than as whitespace. Aligning to
            the top puts the headline near the top of the viewport and lets the
            card run past the fold, which is also a better invitation to scroll.
          */}
          <div className="lg:col-span-7 lg:self-start">
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="display display-hero-home mt-3 text-ink">
              {hero.h1}
            </h1>
            <p className="mt-6 max-w-[52ch] text-body text-muted">{hero.sub}</p>

            <HeroCtas />

            <p className="mt-5 max-w-[52ch] text-caption text-subtle">
              {hero.microcopy}
            </p>
          </div>

          <div className="lg:col-span-5 lg:self-start">
            <ProfileCard
              profile={hero.profile}
              example={{ chip: hero.exampleChip }}
            />
            <p className="mt-3 text-caption text-subtle">
              {hero.sampleCaption}
            </p>
          </div>
        </section>

        <Risk />

        <Passport
          heading={firms.passport.heading}
          intro={firms.passport.intro}
          audience="employer"
        />

        <NetworkLoop />
        <BuiltAroundWork />
        <HowHiringWorks />
        <SampleProfiles />
        <Pricing />
        <FoundingProgramme />
        <EmployerBrief />
        <HonestStatus />

        <FaqSection
          id="faq"
          heading={firms.faqHeading}
          items={employerFaq}
          trackOpens
        />

        {/*
          Final CTA band. ONE door.

          It briefly carried two, mirroring the hero, with "Explore talent"
          alongside. That was wrong for the closing band specifically: a reader who
          has scrolled the whole page has already done the exploring, and offering
          to send them back up it is the one thing the last section on the page
          should not do. Same label as the hero primary, the nav and the sticky
          bar, so a firm never sees two differently-worded doors to one form.
        */}
        <section className="bg-navy pt-20 pb-16 lg:pt-28 lg:pb-20">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading tone="white">
                {firms.finalCta.heading}
              </SectionHeading>
              <p className="mt-6 max-w-[56ch] text-body text-white/75">
                {firms.finalCta.sub}
              </p>
              <div className="mt-8 flex flex-col items-start gap-4">
                <Cta position="final" tone="inverse" />
                <TrustLine text={firms.trustRow} tone="inverse" />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
      <StickyCtaBar />
    </>
  );
}
