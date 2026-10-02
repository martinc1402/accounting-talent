import {
  ArrowSquareOut,
  Briefcase,
  CalendarBlank,
  Globe,
  IdentificationBadge,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import type { ExampleListing } from "@/content/jobs";
import { listings } from "@/content/jobs";

/*
  One example listing. EVERY card says "Example listing" on its face, not in a
  caption somewhere nearby: a card can be screenshotted on its own, and the label
  has to travel with it. The employer is a description, never a company name.

  The "apply" affordance is deliberately not a link. There is no listing behind
  an example, and a button that goes nowhere (or anywhere) would be a lie. The
  "External listing" tag shows what a real card will do instead.

  An <article> with an <h3>, so it sits correctly under the section's <h2>. The
  hero passes headingLevel="h2" because there it sits directly under the <h1>.
*/
export function ExampleListingCard({
  listing,
  headingLevel: H = "h3",
  stretch = false,
}: {
  listing: ExampleListing;
  headingLevel?: "h2" | "h3";
  /** Fill the parent's height (equal-height cards in a grid). Off in the hero,
   *  where the parent also holds the caption and h-full would open a gap. */
  stretch?: boolean;
}) {
  const rows = [
    { icon: MapPin, text: `${listing.location} · ${listing.workMode}` },
    { icon: Globe, text: listing.sponsorship },
    { icon: Briefcase, text: `${listing.roleType} · ${listing.experience}` },
    { icon: CalendarBlank, text: listing.posted },
  ];

  return (
    <article className={`flex flex-col ${stretch ? "h-full" : ""} rounded-card border border-line bg-white p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-navy px-2.5 py-1 text-fine font-medium tracking-wide text-white uppercase">
          {listings.exampleLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-fine font-medium text-subtle">
          <ArrowSquareOut size={12} weight="bold" aria-hidden />
          {listings.externalLabel}
        </span>
      </div>

      <H className="mt-4 text-body font-medium text-ink">{listing.title}</H>
      <p className="mt-1 text-small text-subtle">{listing.employer}</p>

      <ul className="mt-4 space-y-2">
        {rows.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-small text-muted">
            <Icon size={18} weight="light" aria-hidden className="mt-0.5 shrink-0 text-navy" />
            <span className="min-w-0">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <p className="flex items-start gap-2.5 border-t border-line pt-4 text-caption text-subtle">
          <IdentificationBadge size={16} weight="light" aria-hidden className="mt-0.5 shrink-0" />
          <span>Source: {listing.source}</span>
        </p>
      </div>
    </article>
  );
}
