import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/home/Hero";
import { WhyReputation } from "@/components/home/WhyReputation";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WorkNotPopularity } from "@/components/home/WorkNotPopularity";
import { TheMath } from "@/components/home/TheMath";
import { WhoWeWant } from "@/components/home/WhoWeWant";
import { AccountantPricing } from "@/components/home/AccountantPricing";
import { Verification } from "@/components/home/Verification";
import { ProfileDetail } from "@/components/home/ProfileDetail";
import { TheHonestPart } from "@/components/home/TheHonestPart";
import { FinalCta } from "@/components/home/FinalCta";
import { Passport } from "@/components/marketing/Passport";
import { FaqSection } from "@/components/marketing/FaqSection";
import { pageMetadata } from "@/lib/seo";
import { passport, faqHeading } from "@/content/home";
import { faq } from "@/content/faq";

/*
  Worker-facing page. Every section reads from content/home.ts, and the parts both
  audiences see (the Passport pillars) read from content/passport.ts so the two
  pages cannot describe the same thing differently.

  THE PROMISE CHANGED. This page used to lead on pay: "Work directly for US
  accounting firms. Keep 100% of your salary." That argument is still here and it
  is still good, but it is section six now rather than the headline. The lead is
  professional reputation, because "keep 100%" is only worth anything to someone a
  firm has already decided to talk to, and the thing this audience actually lacks
  is a way to be found and believed.

  The pay argument was also softened where it overstated. TheMath used to close on
  "Twice the pay for you", which is exactly true of the illustrative bars and not
  true of every accountant. See content/home.ts for what replaced it.

  It carries its own metadata because the root layout's defaults are the employer
  pitch. Without this, an accountant sharing this URL previews firm-side copy.
  Locale stays en_IN: this audience is in India.

  Bands from the top: white (hero, with the software strip folded into its foot) /
  paper (why reputation) / white (passport) / white (how it works) / white (work
  not popularity) / paper (the money section) / paper (who it is for) / white
  (profile detail) / paper (pricing) / white (verification) / mist (honest) /
  white (faq) / navy (final cta + footer). Padding, never margins, so the bands
  sit flush. ProfileDetail takes no background of its own, so it does not cost a
  band.

  Two sample people, deliberately. Arjun carries the hero card and the search
  results in HowItWorks (one profile, summarised, then found). Priya carries the
  detail card: the record a firm actually opens. A page recruiting men and women
  should show both, and the detail heading asks what a firm sees when it opens
  YOUR profile, so it was never his to begin with.

  THE APPLICATION FORM IS NOT ON THIS PAGE and should not be moved onto it. It
  lives at /apply as a 19-question wizard on a deliberately stripped, nav-less,
  noindex landing page. Embedding it here would fork the funnel, create a second
  submitApplication entry point, and (because ApplyForm takes utm as a server prop
  from searchParams) make this route dynamic, which it is not today.
*/

export const metadata: Metadata = pageMetadata({
  title: "Build Your Accounting Profile | AccountingTalent",
  description:
    "Create a free professional profile, demonstrate your accounting skills and get discovered by US firms. No application fees, salary commission or pay-to-rank.",
  path: "/accountants",
  ogTitle: "Prove what you can do. Get discovered by US accounting firms.",
  ogDescription:
    "A free professional profile built around your skills, software experience, work evidence and vouches. No application fees, no salary commission, no pay-to-rank.",
  locale: "en_IN",
});

export default function AccountantsPage() {
  return (
    <>
      <Nav active="/accountants" audience="worker" />
      <main className="flex-1">
        <Hero />
        <WhyReputation />

        <Passport
          heading={passport.heading}
          intro={passport.intro}
          audience="accountant"
        />

        <ProfileDetail variant="teaser" />
        <HowItWorks />
        <WorkNotPopularity />
        <TheMath />
        <WhoWeWant />
        <AccountantPricing />
        <Verification />
        <TheHonestPart />

        <FaqSection heading={faqHeading} items={faq} trackOpens />

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
