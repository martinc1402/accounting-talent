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
  Worker-facing homepage. At employer launch this hero swaps to the /employers
  pitch and worker recruitment moves to /careers. Every section reads from
  content/home.ts, so that flip is a content change rather than a rewrite.

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
export default function HomePage() {
  return (
    <>
      <Nav />
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
