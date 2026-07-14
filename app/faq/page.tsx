import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { faq } from "@/content/faq";
import { CONTACT_EMAIL } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Everything Indian accounting professionals ask about applying: is it free, do I need US experience, how would a US firm pay me, and what happens to my data.",
};

export default function FaqPage() {
  return (
    <>
      <Nav active="/faq" />

      <main className="flex-1">
        <section className="mx-auto max-w-[820px] px-5 pt-14 pb-20 lg:px-8 lg:pt-20 lg:pb-28">
          <h1 className="display display-page text-ink">
            Questions and answers
          </h1>
          <p className="mt-6 max-w-[54ch] text-lede text-muted">
            If something here is not clear, email us and a person will answer.
          </p>

          <div className="mt-12">
            <Accordion items={faq} />
          </div>

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
