import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { WaitlistForm } from "@/components/firms/WaitlistForm";
import { ProfileCard } from "@/components/home/ProfileCard";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { firms } from "@/content/firms";
import { employerFaq } from "@/content/faq";

export const metadata: Metadata = {
  title: {
    absolute:
      "Hire Indian Accountants Directly, No Agency Markup | AccountingTalent.in",
  },
  description:
    "A vetted database of Indian bookkeepers, staff accountants and US tax preparers. Direct hire, flat subscription, no per-hire fees. Launching Q4 2026.",
};

/*
  Emphasises one phrase inside a proof body without splitting the string in the
  content file: the page finds `emphasis` in `body` and lifts it to navy medium.
  Falls back to the plain string when a proof block has no emphasis.
*/
function renderBody(body: string, emphasis?: string): ReactNode {
  if (!emphasis) return body;
  const i = body.indexOf(emphasis);
  if (i < 0) return body;
  return (
    <>
      {body.slice(0, i)}
      <strong className="font-medium text-navy">{emphasis}</strong>
      {body.slice(i + emphasis.length)}
    </>
  );
}

/*
  The employer page. A single grid carries four blocks, and the DOM order is
  hero-copy, cards, proof, FAQ so that on a phone (one column) the waitlist and
  the sample profile sit directly under the pitch, before the longer proof
  reading. On desktop the cards are pinned to the right column across all three
  left-hand rows (row-span-3), which lets the proof and FAQ flow up under the
  hero copy on the left instead of the tall cards forcing a gap beneath it.
*/
export default function ForFirmsPage() {
  return (
    <>
      <Nav active="/employers" />

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-14 px-5 pt-14 pb-20 lg:grid-cols-12 lg:pt-20 lg:pb-28 lg:px-8">
          {/* Hero copy */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <h1 className="display display-hero text-ink">{firms.h1}</h1>

            <p className="mt-7 max-w-[56ch] text-body text-muted">{firms.sub}</p>

            {/* The pull-line. Serif, navy, its own air: this is the sentence that
                states the whole model in one breath. ~28px flat rather than a
                clamp step, which would grow to 40px and read as a headline. */}
            <p className="mt-8 display text-[1.75rem] leading-tight text-navy">
              {firms.pullLine}
            </p>
            <p className="mt-3 text-small text-subtle">{firms.subNote}</p>
          </div>

          {/* Right column: waitlist card, then the sample profile card */}
          <div className="space-y-6 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-3 lg:self-start">
            {/* scroll-mt-24 clears the 72px sticky header when the nav CTA jumps
                here. */}
            <div id="waitlist" className="scroll-mt-24 rounded-card bg-mist p-7">
              <h2 className="display display-step text-ink">
                {firms.waitlist.heading}
              </h2>
              <p className="mt-3 max-w-[38ch] text-small text-muted">
                {firms.waitlist.body}
              </p>
              <p className="mt-4 text-body text-navy">
                {firms.waitlist.priceAnchor}
              </p>

              <div className="mt-6">
                <WaitlistForm />
              </div>
            </div>

            <div>
              <p className="text-caption font-medium tracking-wide text-subtle uppercase">
                {firms.profileLabel}
              </p>
              {/* The homepage hero card, reused verbatim. A firm sees the exact
                  artifact a worker sees. */}
              <div className="mt-3">
                <ProfileCard />
              </div>
              <p className="mt-3 text-caption text-subtle">
                {firms.profileCaption}
              </p>
            </div>
          </div>

          {/* Proof */}
          <dl className="lg:col-span-7 lg:col-start-1 lg:row-start-2">
            {firms.proof.map((point) => (
              <div key={point.title} className="border-t border-line py-7">
                <dt className="display text-2xl text-ink">{point.title}</dt>
                <dd className="mt-2 max-w-[62ch] text-body text-muted">
                  {renderBody(
                    point.body,
                    "emphasis" in point ? point.emphasis : undefined,
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {/* FAQ. id + scroll-mt so /faq's "questions firms ask us" cross-link
              lands here clear of the sticky header. */}
          <div
            id="faq"
            className="scroll-mt-24 lg:col-span-7 lg:col-start-1 lg:row-start-3"
          >
            <SectionHeading>{firms.faqHeading}</SectionHeading>
            <div className="mt-8 max-w-[760px]">
              <Accordion items={employerFaq} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
