import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/home/Hero";
import { SoftwareStrip } from "@/components/home/SoftwareStrip";
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

  The page runs white / paper / white / mist / navy, and that budget is spent
  deliberately. SoftwareStrip sits inside the hero's white band, and ProfileDetail
  takes no background of its own, so neither costs a band.

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
        <SoftwareStrip />
        <TheMath />
        <HowItWorks />
        <WhoWeWant />
        <ProfileDetail />
        <TheHonestPart />
        <ShortFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
