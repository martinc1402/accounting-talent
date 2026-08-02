import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/home/Hero";
import { TheMath } from "@/components/home/TheMath";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhoWeWant } from "@/components/home/WhoWeWant";
import { ProfileDetail } from "@/components/home/ProfileDetail";
import { TheHonestPart } from "@/components/home/TheHonestPart";
import { ShortFaq } from "@/components/home/ShortFaq";
import { FinalCta } from "@/components/home/FinalCta";

/*
  Worker-facing homepage. This page WAS "/" until the homepage was repointed at
  US firms; the composition below is unchanged from that version, and every
  section still reads from content/home.ts.

  It carries its own metadata because the root layout's defaults moved to the
  employer pitch with the homepage. Without this, an accountant sharing this URL
  previewed the firm-side copy, which is the exact mistake /employers used to
  document about the root OG. Locale stays en_IN: this audience is in India, and
  the page says "late 2026" rather than "Q4 2026" because the Indian financial
  year runs April to March, so "Q4" reads as Jan-Mar 2027 to many applicants.

  Bands from the top: white (hero, with the software strip folded into its foot)
  / paper (the money section) / white (how it works) / paper (who we're looking
  for) / white (the profile record + the honest part) / mist (faq) / navy (final
  cta + footer). The alternation is deliberate rhythm; ProfileDetail takes no
  background of its own, so it does not cost a band.

  ProfileDetail replaced a full-bleed photograph in this slot. The photo broke the
  scroll but made no argument; the card breaks the scroll AND makes the argument,
  because it is the product rather than atmosphere.

  Two sample people, deliberately. Arjun carries the hero card and the search
  results in HowItWorks (one profile, summarised, then found). Priya carries the
  detail card: the record a firm actually opens. A page recruiting men and women
  should show both, and the detail heading asks what a firm sees when it opens
  YOUR profile, so it was never his to begin with.
*/

const PAGE_TITLE = "Work Directly for US Accounting Firms | AccountingTalent.in";
const DESCRIPTION =
  "US CPA firms hire India-based accounting professionals directly through AccountingTalent.in. Free for accountants, permanently. No agency, no commission, no cut of your salary.";

export const metadata: Metadata = {
  // `absolute` so the root template does not append the site name twice.
  title: { absolute: PAGE_TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/accountants" },
  openGraph: {
    title: "Work Directly for US Accounting Firms",
    description:
      "US CPA firms hire you directly. No agency takes a cut. Free for accounting professionals, permanently.",
    url: "https://accountingtalent.in/accountants",
    siteName: "AccountingTalent.in",
    locale: "en_IN",
    type: "website",
  },
};

export default function AccountantsPage() {
  return (
    <>
      <Nav active="/accountants" audience="worker" />
      <main className="flex-1">
        <Hero />
        <TheMath />
        <HowItWorks />
        <WhoWeWant />
        <ProfileDetail variant="teaser" />
        <TheHonestPart />
        <ShortFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
