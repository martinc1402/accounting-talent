import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/home/Hero";
import { SoftwareStrip } from "@/components/home/SoftwareStrip";
import { TheMath } from "@/components/home/TheMath";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhoWeWant } from "@/components/home/WhoWeWant";
import { PhotoBand } from "@/components/home/PhotoBand";
import { TheHonestPart } from "@/components/home/TheHonestPart";
import { ShortFaq } from "@/components/home/ShortFaq";
import { FinalCta } from "@/components/home/FinalCta";

/*
  Worker-facing homepage. At employer launch this hero swaps to the /employers
  pitch and worker recruitment moves to /careers. Every section reads from
  content/home.ts, so that flip is a content change rather than a rewrite.

  SoftwareStrip sits inside the hero's white band and PhotoBand is a photograph
  rather than a colour, so neither spends a background band: the page still runs
  white / paper / white / mist / navy.
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
        <PhotoBand />
        <TheHonestPart />
        <ShortFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
