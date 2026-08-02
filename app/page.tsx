import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Risk } from "@/components/firms/Risk";
import { Vetting } from "@/components/firms/Vetting";
import { SampleProfiles } from "@/components/firms/SampleProfiles";
import { Pricing } from "@/components/firms/Pricing";
import { Edges } from "@/components/firms/Edges";
import { HonestStatus } from "@/components/firms/HonestStatus";
import { EmployerBrief } from "@/components/firms/EmployerBrief";
import { Cta } from "@/components/firms/Cta";
import { TrustRow } from "@/components/firms/TrustRow";
import { StickyCtaBar } from "@/components/firms/StickyCtaBar";
import { ProfileCard } from "@/components/home/ProfileCard";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

/*
  Firm-facing homepage. This route used to carry the accountant pitch; that page
  now lives at /accountants, unchanged. Every section reads from content/firms.ts,
  so a copy change stays a data change.

  The argument, in order, and the order is the argument: who this person is
  (risk), how we know (vetting), here they are (the pool), what it costs
  (pricing), the paperwork, what is actually true today, then the form. Price sits
  fifth rather than first because a firm that does not believe the pool is real
  does not care what access to it costs.

  Bands from the top: white (hero) / mist (risk) / white (vetting) / paper (sample
  profiles) / white (pricing) / paper (edges) / white (honest status) / mist (the
  form) / white (faq) / navy (final cta + footer). Padding, never margins, so the
  bands sit flush. One theme throughout: no section inverts to dark mid-page.

  No `revalidate` and no ISR. A live applicant count (TalentSnapshot) and a
  founder note (BuilderNote) used to sit between the samples and pricing; both
  were cut for not earning their place. The count was this page's only database
  read, so removing it drops the last request-time dependency and the route is
  now fully static. Reinstating anything that reads Supabase means putting a
  revalidate back.
*/

const PAGE_TITLE =
  "Hire Vetted Indian Accountants for Your US Firm | AccountingTalent";
const DESCRIPTION =
  "Search a verified database of Indian bookkeepers, tax preparers and accountants, request an introduction, and hire directly. No staffing agency and no monthly per-seat markup. Opens to US firms in late 2026.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hire Vetted Indian Accountants for Your US Firm",
    description:
      "A verified database of Indian accounting professionals. Search, request an introduction, and hire directly. No agency markup, no exclusivity.",
    url: "https://accountingtalent.in",
    siteName: "AccountingTalent.in",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function HomePage() {
  const { hero } = firms;

  return (
    <>
      <Nav active="/" />
      <main className="flex-1">
        {/*
          Hero. 7/5 split, four text elements at most: eyebrow, headline, subhead,
          CTAs. pt-14/lg:pt-20 keeps the headline near the top of the viewport;
          anything more and the hero floats halfway down and reads as a bug.

          The right column is the product rather than a picture of it. The card
          carries no photo, so ProfileCard renders its silhouette, and the caption
          underneath says "sample" in plain words. A firm must not scroll away
          believing Arjun is someone it can email this afternoon.
        */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7 lg:self-center">
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {hero.eyebrow}
            </p>
            {/* display-hero-home, not display-hero. The larger scale belonged to
                /employers, which was a page you arrived at already interested;
                this is the front door and it has a tall card beside it. At
                display-hero (up to 4.7rem) the headline ran three lines and
                pushed the CTA off a 900px viewport. */}
            <h1 className="display display-hero-home mt-3 text-ink">
              {hero.h1}
            </h1>
            <p className="mt-6 max-w-[52ch] text-body text-muted">{hero.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Cta position="hero" />
              <Button href={firms.seeVetting.href} variant="outline">
                {firms.seeVetting.label}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 lg:self-center">
            <ProfileCard profile={hero.profile} sample />
            <p className="mt-3 text-caption text-subtle">
              {hero.sampleCaption}
            </p>
          </div>
        </section>

        <Risk />
        <Vetting />
        <SampleProfiles />
        <Pricing />
        <Edges />
        <HonestStatus />
        <EmployerBrief />

        <section id="faq" className="scroll-mt-24 py-16 lg:py-28">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading>{firms.faqHeading}</SectionHeading>
              <div className="mt-10">
                <Accordion items={employerFaq} />
              </div>
            </div>
          </Container>
        </section>

        {/* Final CTA band. Same label as the hero and the nav: one intent, one
            label, everywhere on the page. */}
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
                <TrustRow tone="inverse" />
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
