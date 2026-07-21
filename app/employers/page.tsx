import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { PainMirror } from "@/components/firms/PainMirror";
import { Benefits } from "@/components/firms/Benefits";
import { HiringSteps } from "@/components/firms/HiringSteps";
import { EmployerBrief } from "@/components/firms/EmployerBrief";
import { RolesAvailable } from "@/components/firms/RolesAvailable";
import { HireScope } from "@/components/firms/HireScope";
import { Assessment } from "@/components/firms/Assessment";
import { TalentSnapshot } from "@/components/firms/TalentSnapshot";
import { Economics } from "@/components/firms/Economics";
import { SecuritySection } from "@/components/firms/SecuritySection";
import { BuilderNote } from "@/components/firms/BuilderNote";
import { Cta } from "@/components/firms/Cta";
import { TrustRow } from "@/components/firms/TrustRow";
import { StickyCtaBar } from "@/components/firms/StickyCtaBar";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

/*
  Its own OpenGraph + Twitter, not the root's. The root OG sells the worker side,
  so without this a firm owner sharing /employers previewed the accountant pitch.
  American English and en_US locale here, since the audience is US firms.
*/
const PAGE_TITLE = "Hire Indian Accountants for Your US Firm | AccountingTalent";
const OG_TITLE = "Hire Indian Accountants for Your US Firm";
const OG_DESCRIPTION =
  "Hire assessed Indian bookkeepers, tax preparers and accountants for your US firm. Receive matched candidates, interview directly and pay only when you hire.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: OG_DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: "https://accountingtalent.in/employers",
    siteName: "AccountingTalent.in",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

/*
  ISR window governing how fresh the live talent-snapshot count (read from the
  applications table in TalentSnapshot) is. The page stays static: ISR
  regenerates it in the background on the first visit after the window expires,
  so the cost is ~one cheap count query per interval, independent of traffic.
  One tunable number: 3600 for hourly, 60 for near-instant.
*/
export const revalidate = 300;

/*
  The employer page, concierge-matching model. Order: hero -> pain mirror ->
  benefit cards -> how it works -> the role brief (#get-matched, the one
  conversion) -> roles -> what the hire does -> candidate quality -> live
  snapshot -> economics -> security -> founder note -> FAQ -> final CTA. Every
  "Get matched candidates" CTA (nav, final band, mobile sticky bar) targets
  #get-matched. All copy resolves from content/firms.ts.
*/
export default function ForFirmsPage() {
  const { hero } = firms;
  const bookCallMailto = `mailto:${firms.contactEmail}?subject=${encodeURIComponent(
    "Book a hiring call with AccountingTalent",
  )}`;

  return (
    <>
      <Nav active="/employers" />

      <main className="flex-1">
        {/* Hero: pitch (left) + the offer stated plainly (right). */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7 lg:self-center">
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 display display-hero text-ink">{hero.h1}</h1>

            <p className="mt-6 max-w-[52ch] text-body text-muted">{hero.sub}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={firms.getMatched.href}>
                {firms.getMatched.label}
              </Button>
              <Button href={firms.seeHow.href} variant="outline">
                {firms.seeHow.label}
              </Button>
            </div>

            <p className="mt-5 text-small text-subtle">{hero.trustLine}</p>
          </div>

          <div className="lg:col-span-5 lg:self-center">
            <div className="rounded-card border border-line bg-mist p-7 lg:p-8">
              <p className="text-caption font-medium tracking-wide text-subtle uppercase">
                {hero.promise.title}
              </p>
              <ul className="mt-4 space-y-3.5">
                {hero.promise.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <Check
                      size={18}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-verified-deep"
                    />
                    <span className="text-body text-ink">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <PainMirror />

        <Benefits />

        <HiringSteps />

        <EmployerBrief />

        <RolesAvailable />

        <HireScope />

        <Assessment />

        <TalentSnapshot />

        <Economics />

        <SecuritySection />

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

        {/* Final CTA band (navy). Primary jumps to the brief; secondary opens an
            email (no scheduling tool wired up yet). */}
        <section className="bg-navy pt-20 pb-16 text-white lg:pt-28 lg:pb-20">
          <Container className="text-center">
            <h2 className="display display-hero mx-auto max-w-[20ch]">
              {firms.finalCta.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-small text-white/70">
              {firms.finalCta.sub}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Cta position="final" tone="inverse" />
                <Button href={bookCallMailto} variant="outlineInverse">
                  {firms.bookCall.label}
                </Button>
              </div>
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
