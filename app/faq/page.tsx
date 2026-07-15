import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Accordion } from "@/components/ui/Accordion";
import { FaqDeepLinks } from "@/components/faq/FaqDeepLinks";
import { Button } from "@/components/ui/Button";
import { faq } from "@/content/faq";
import { CONTACT_EMAIL } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: "FAQ — AccountingTalent.in" },
  description:
    "Answers for Indian accounting professionals: salary ranges, how US firms pay you, verification, GST and legality, and when hiring starts.",
};

/*
  FAQPage structured data, built from the same `faq` array the accordions render,
  so the two cannot drift. Each answer is its paragraphs joined into one plain
  string. Emitted as JSON-LD in the page head-of-body.
*/
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a.join(" "),
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav active="/faq" />

      <main className="flex-1">
        <section className="mx-auto max-w-[820px] px-5 pt-14 pb-20 lg:px-8 lg:pt-20 lg:pb-28">
          <h1 className="display display-page text-ink">
            Questions and answers
          </h1>
          <p className="mt-6 max-w-[54ch] text-lede text-subtle">
            If something here is not clear,{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-navy underline decoration-navy/30 decoration-1 underline-offset-4 transition-colors hover:decoration-navy/70"
            >
              email us
            </a>{" "}
            and a person will answer.
          </p>

          <div className="mt-12">
            <Accordion items={faq} />
          </div>

          {/* Enhances the accordions above with deep-link open/scroll + hash sync.
              Renders nothing; the page works without it. */}
          <FaqDeepLinks />

          {/* One quiet cross-link to the employer FAQ, for the wrong-audience
              reader. Points at /employers (there is no /for-firms route). */}
          <p className="mt-10 text-small text-subtle">
            <a
              href="/employers#faq"
              className="text-navy underline underline-offset-4"
            >
              Hiring for a US firm? See the questions firms ask us →
            </a>
          </p>

          <div className="mt-14 rounded-card bg-mist p-8 lg:p-10">
            <h2 className="display display-figure text-ink">
              Still deciding?
            </h2>
            <p className="mt-3 max-w-[46ch] text-body text-muted">
              The application is free, takes three minutes, and you can delete
              your profile at any time.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button href="/apply" className="w-full sm:w-auto">
                Apply free, takes 3 minutes
              </Button>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-small text-navy underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
