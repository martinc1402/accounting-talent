import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { privacy, terms, updated, type LegalSection } from "@/content/legal";
import { CONTACT_EMAIL } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "How AccountingTalent.in handles your data, and the terms of using the talent database.",
};

/*
  ⚠️ The text rendered here is an unreviewed draft. See the warning at the top
  of content/legal.ts before this goes anywhere near production.
*/
export default function LegalPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[820px] px-5 pt-14 pb-20 lg:px-8 lg:pt-20 lg:pb-28">
          <h1 className="display display-page text-ink">
            Privacy and terms
          </h1>
          <p className="mt-5 text-caption text-subtle">
            Last updated {updated}
          </p>

          <p className="mt-8 max-w-[62ch] text-lede text-muted">
            Plain English, because you should be able to read this without a
            lawyer. If anything here is unclear, email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-navy underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <Part title="Privacy policy" sections={privacy} />
          <Part title="Terms of use" sections={terms} />
        </section>
      </main>

      <Footer />
    </>
  );
}

function Part({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mt-16">
      <h2 className="display display-figure border-b border-line pb-5 text-navy">
        {title}
      </h2>

      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h3 className="text-body font-medium text-ink">
            {section.heading}
          </h3>
          {section.body.map((para) => (
            <p
              key={para}
              className="mt-3 max-w-[68ch] text-body text-muted"
            >
              {para}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
