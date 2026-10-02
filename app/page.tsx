import type { Metadata } from "next";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusLabel } from "@/components/marketing/StatusLabel";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";
import { JobCard } from "@/components/jobs/JobCard";
import { FilterPreview } from "@/components/jobs/FilterPreview";
import { HomePricing } from "@/components/jobs/HomePricing";
import { pageMetadata } from "@/lib/seo";
import {
  hero,
  problem,
  howItWorks,
  listings,
  exampleJobs,
  EXAMPLE_NOW,
  trust,
  finalCta,
} from "@/content/jobs";

/*
  The job-seeker homepage: a paid job-search membership for Indian accountants,
  sold as a founding membership because the database does not exist yet. Copy is
  all in content/jobs.ts, which also records the honesty rules this page is held
  to (no counts, no testimonials, every listing an "Example listing").

  This is the site's one product. The firm pitch (/employers), the profile
  funnel (/apply) and the FAQs were removed in 2026-10; see next.config.ts.

  Bands from the top: white (hero) / mist (problem) / white (how it works) /
  paper (filters) / white (example listings) / paper (pricing) / white (trust) /
  navy (final cta + footer). Padding, never margins, so bands sit
  flush.

  FULLY STATIC, same as the page it replaced, and for the same reason: no
  request-time dependency. The currency switch detects locale on the client
  (components/jobs/currency.ts) and the pricing CTAs pass the plan to
  /get-access in the URL, read there on the client. Do not add searchParams or a
  Supabase read here.
*/

export const metadata: Metadata = pageMetadata({
  title: "Remote & Overseas Accounting Jobs for Indian Accountants | AccountingTalent",
  description:
    "Accounting jobs from employers' own career pages: remote roles open to India and overseas roles that mention visa sponsorship in the US, Canada, UK, Australia and the Gulf. Founding membership now open.",
  path: "/",
  ogTitle: "Remote and overseas accounting jobs, straight from employers' career pages.",
  ogDescription:
    "For Indian CAs, CMAs, ACCAs and accountants. Remote roles open to India and roles abroad that mention visa sponsorship. No recruiters, no salary cut. Reserve a founding membership.",
  locale: "en_IN",
});

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero. 7/5 split, columns top-aligned rather than centred: centring
            the copy against a tall card pushes the headline below the fold.
            The right column is the first example listing (Dubai, sponsorship
            stated), labelled as one. */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-16 gap-y-10 px-5 pt-12 pb-16 lg:grid-cols-12 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7 lg:self-start">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-caption font-medium tracking-wide text-subtle uppercase">
                {hero.eyebrow}
              </p>
            </div>
            <h1 className="display display-hero mt-3 text-ink">{hero.h1}</h1>
            <p className="mt-6 max-w-[52ch] text-body text-muted">{hero.sub}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={hero.primary.href}>{hero.primary.label}</Button>
              <Button href={hero.secondary.href} variant="outline">
                {hero.secondary.label}
              </Button>
            </div>

            <p className="mt-5 max-w-[52ch] text-caption text-subtle">{hero.microcopy}</p>
          </div>

          <div className="lg:col-span-5 lg:self-start">
            <JobCard listing={exampleJobs[0]!} now={EXAMPLE_NOW} headingLevel="h2" />
          </div>
        </section>

        {/* Problem. */}
        <section className="bg-mist py-16 lg:py-28">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading>{problem.heading}</SectionHeading>
            </div>
            <ul className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:mt-14">
              {problem.items.map((item) => (
                <li key={item.title} className="border-t border-navy/15 pt-5">
                  <h3 className="text-body font-medium text-navy">{item.title}</h3>
                  <p className="mt-2 max-w-[48ch] text-body text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* How it works. One "Launching soon" on the heading rather than four on
            the steps: StatusLabel's own rule is that a label on everything
            stops being read. */}
        <section id="how-it-works" className="scroll-mt-24 py-16 lg:py-28">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <SectionHeading>{howItWorks.heading}</SectionHeading>
                  <StatusLabel status="planned" />
                </div>
                <p className="mt-5 max-w-[40ch] text-body text-muted">{howItWorks.sub}</p>
              </div>
              <div className="lg:col-span-7">
                <ProcessSteps steps={howItWorks.steps} />
              </div>
            </div>
          </Container>
        </section>

        <FilterPreview />

        {/* Example listings. */}
        <section id="listings" className="scroll-mt-24 py-16 lg:py-28">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading>{listings.heading}</SectionHeading>
              <p className="mt-5 max-w-[56ch] text-body text-muted">{listings.sub}</p>
            </div>
            {/* All five examples, one per state the scraper will produce (see
                exampleJobs in content/jobs.ts). The hero repeats the first so
                this section stands on its own when reached from the nav. */}
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 xl:grid-cols-3">
              {exampleJobs.map((job) => (
                <li key={job.id} className="min-w-0">
                  <JobCard listing={job} now={EXAMPLE_NOW} stretch />
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[60ch] text-small text-subtle">{listings.freeNote}</p>
          </Container>
        </section>

        <HomePricing />

        {/* Trust. */}
        <section id="trust" className="scroll-mt-24 py-16 lg:py-28">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading>{trust.heading}</SectionHeading>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-14">
              <div className="rounded-card border border-line bg-white p-6 lg:p-8">
                <h3 className="text-body font-medium text-navy">{trust.do.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {trust.do.items.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <Check size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-navy" />
                      <span className="text-small text-muted">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border border-line bg-white p-6 lg:p-8">
                <h3 className="text-body font-medium text-navy">{trust.dont.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {trust.dont.items.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <X size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-navy" />
                      <span className="text-small text-muted">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 max-w-[70ch] text-small text-subtle">{trust.footnote}</p>
            <p className="mt-4 max-w-[70ch] text-small text-ink">{trust.scam}</p>

            {/*
              TODO(social-proof): this is where member quotes or outcomes would
              go once real ones exist. Nothing is rendered until then. Do not
              add testimonials, member counts, job counts or ratings that we
              cannot point to a source for.
            */}
          </Container>
        </section>

        {/* Final CTA band. */}
        <section className="bg-navy pt-20 pb-16 lg:pt-28 lg:pb-20">
          <Container>
            <div className="max-w-[820px]">
              <SectionHeading tone="white">{finalCta.heading}</SectionHeading>
              <p className="mt-6 max-w-[56ch] text-body text-white/75">{finalCta.sub}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={finalCta.primary.href} variant="inverse">
                  {finalCta.primary.label}
                </Button>
                <Button href={finalCta.secondary.href} variant="outlineInverse">
                  {finalCta.secondary.label}
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
