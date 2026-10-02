import Link from "next/link";
import {
  ArrowSquareOut,
  CheckCircle,
  Lock,
  MapPin,
  MinusCircle,
  Quotes,
  SealCheck,
  Warning,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { JobListing, StatusCheck, Tone } from "@/lib/jobs/types";
import { monogramOf, orderRequirements, shortDate, timeAgo } from "@/lib/jobs/format";

/*
  One job listing, on a navy card. Typed against lib/jobs/types.ts so the scraper
  can feed it directly; today every listing it renders is a fictional example.

  Top to bottom: destination band, employer + title, the two status checks,
  where and how fresh, why we tagged it, package and requirements, salary, CTA.
  The checks sit high because they are the reason this product exists: "can I
  apply from India" and "will they sponsor me" are answered before the salary.

  TONES NEVER RELY ON COLOUR. Each has its own icon shape (check / triangle /
  cross / dash) and screen-reader text, and the pill always carries words. Good
  is white rather than green: green is reserved for Verified (globals.css).

  Three access states (ListingAccess):
  - full: CTA "Apply on employer's site", opening the employer's own listing.
  - locked: the free preview. Employer name and evidence are replaced, not
    blurred (blurred text is still in the DOM and still readable), and the CTA
    sells membership.
  - ineligible: dimmed, with a quieter "View listing anyway".

  Examples (listing.example) never link out: there is no listing behind them, so
  the employer CTAs render as inert, labelled placeholders. The membership CTA is
  real and does link.

  A server component with no hooks. `now` is a prop because this renders on
  static pages, where a clock read at build time would freeze "checked 3h ago".
*/

const toneMeta: Record<Tone, { icon: Icon; sr: string; pill: string; text: string }> = {
  good: {
    icon: CheckCircle,
    sr: "Good",
    pill: "bg-white text-navy",
    text: "text-white",
  },
  warn: {
    icon: Warning,
    sr: "Caution",
    pill: "bg-tone-warn/15 text-tone-warn ring-1 ring-tone-warn/50",
    text: "text-tone-warn",
  },
  bad: {
    icon: XCircle,
    sr: "Problem",
    pill: "bg-tone-bad/15 text-tone-bad ring-1 ring-tone-bad/50",
    text: "text-tone-bad",
  },
  neutral: {
    icon: MinusCircle,
    sr: "Note",
    pill: "bg-white/10 text-white/85 ring-1 ring-white/25",
    text: "text-white/80",
  },
};

function TonePill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = toneMeta[tone];
  const Icon = t.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium whitespace-nowrap ${t.pill}`}
    >
      <Icon size={15} weight="bold" aria-hidden />
      <span className="sr-only">{t.sr}: </span>
      {children}
    </span>
  );
}

function StatusRow({ label, check }: { label: string; check: StatusCheck }) {
  return (
    // dt and both dd's are direct children of the group div, as a <dl> requires.
    // Wrapping flex rather than a two-column grid: at 360px "Visa sponsorship"
    // plus a "Sponsorship stated" pill do not fit on one line, and the pill has
    // to drop under the label rather than push the card wider than the screen.
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-3 first:pt-0 last:pb-0">
      <dt className="text-caption text-white/70">{label}</dt>
      <dd>
        <TonePill tone={check.tone}>{check.value}</TonePill>
      </dd>
      <dd className="basis-full text-caption text-white/70">{check.reason}</dd>
    </div>
  );
}

function ToneLine({ tone, text }: { tone: Tone; text: string }) {
  const t = toneMeta[tone];
  const Icon = t.icon;
  return (
    <p className={`mt-2 flex items-start gap-1.5 text-caption ${t.text}`}>
      <Icon size={15} weight="bold" aria-hidden className="mt-0.5 shrink-0" />
      <span>
        <span className="sr-only">{t.sr}: </span>
        {text}
      </span>
    </p>
  );
}

const ctaBase =
  "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[17px] font-medium";

export function JobCard({
  listing,
  now,
  headingLevel: H = "h3",
  stretch = false,
  unlockHref = "/get-access",
}: {
  listing: JobListing;
  /** Reference time for "checked Xh ago". Pass EXAMPLE_NOW for examples. */
  now: Date | string;
  headingLevel?: "h2" | "h3";
  /** Fill the parent's height (equal-height cards in a grid). */
  stretch?: boolean;
  unlockHref?: string;
}) {
  const {
    access,
    example,
    employer,
    destination,
    applyFromIndia,
    second,
    evidence,
    salary,
  } = listing;
  const locked = access === "locked";
  const ineligible = access === "ineligible";
  const nowDate = typeof now === "string" ? new Date(now) : now;
  const requirements = orderRequirements(listing.requirements);
  /*
    Dims an ineligible listing, CTA excepted. The band's big code fades
    (codeTone); the body only goes to 80%, because opacity compounds with the white/65 used
    for small text, and 80% keeps the faintest line about 5:1 on navy. 60% put
    it near 3.3:1, below AA.
  */
  // In the band only the decorative code fades: the pills (destination and
  // "Example listing") must stay fully legible.
  const codeTone = ineligible ? "text-white/[0.04]" : "text-white/10";
  const dim = ineligible ? "opacity-80" : "";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-card bg-navy text-white ${
        stretch ? "h-full" : ""
      }`}
      aria-label={`${example ? "Example listing: " : ""}${listing.title}${
        ineligible ? " (not eligible from India)" : ""
      }`}
    >
      {/* Destination band. The big code is decoration; the pill says it in words. */}
      <div
        className={`relative h-[168px] shrink-0 overflow-hidden bg-gradient-to-br from-navy-deep via-navy-deep to-navy`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-2 -bottom-8 font-display text-[132px] leading-none font-light tracking-[-0.04em] select-none ${codeTone}`}
        >
          {destination.code}
        </span>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
        <div className="relative flex flex-wrap items-start gap-2 p-5 sm:p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-caption font-medium text-navy">
            <MapPin size={15} weight="bold" aria-hidden />
            {destination.label}
          </span>
          {example && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-fine font-medium tracking-wide text-white uppercase ring-1 ring-white/30">
              Example listing
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${dim}`}>
        {/* Employer + title. */}
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden
            className={`flex size-12 shrink-0 items-center justify-center rounded-card font-display text-[22px] ${
              locked ? "bg-white/10 text-white/70" : "bg-white text-navy"
            }`}
          >
            {locked ? <Lock size={20} weight="bold" /> : (employer.monogram ?? monogramOf(employer.name))}
          </span>
          <div className="min-w-0">
            <H className="font-display text-[1.55rem] leading-[1.1] font-normal tracking-[-0.01em] text-white">
              {listing.title}
            </H>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-small text-white/80">
              <span>{locked ? "Employer hidden on free preview" : employer.name}</span>
              {employer.direct && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-fine font-medium text-white/90 ring-1 ring-white/20">
                  <SealCheck size={13} weight="bold" aria-hidden />
                  Direct employer
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status panel. */}
        <dl className="mt-5 divide-y divide-white/10 rounded-card bg-white/[0.06] p-4 ring-1 ring-white/10">
          <StatusRow label="Apply from India" check={applyFromIndia} />
          <StatusRow
            label={second.kind === "working-hours" ? "Working hours" : "Visa sponsorship"}
            check={second.check}
          />
        </dl>

        {/* Where, and how fresh. */}
        <p className="mt-4 text-small text-white/85">
          {listing.location} · {listing.workMode}
        </p>
        <p className="mt-1 text-caption text-white/65">
          Still live · checked {timeAgo(listing.checkedAt, nowDate)} · first seen{" "}
          {shortDate(listing.firstSeenAt)}
        </p>

        {/* Why we tagged it. Replaced, not blurred, when locked. */}
        <div className="mt-4 rounded-card border border-white/15 p-4">
          <p className="text-fine font-medium tracking-wide text-white/65 uppercase">
            Why we tagged it
          </p>
          {locked ? (
            <p className="mt-2 flex items-start gap-2 text-small text-white/75">
              <Lock size={16} weight="bold" aria-hidden className="mt-0.5 shrink-0" />
              The quote and source are visible to members.
            </p>
          ) : (
            <figure className="mt-2">
              <blockquote className="flex items-start gap-2 text-small text-white/90">
                <Quotes size={16} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-white/50" />
                <span>{evidence.quote}</span>
              </blockquote>
              <figcaption className="mt-2 text-caption text-white/65">
                Source: {evidence.source}
              </figcaption>
            </figure>
          )}
        </div>

        {/* Package, then requirements (max 3, qualification first). */}
        {listing.package && listing.package.length > 0 && (
          <div className="mt-4">
            <p className="text-caption text-white/65">Package includes</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {listing.package.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-caption text-white/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {requirements.length > 0 && (
          <div className="mt-3">
            <p className="text-caption text-white/65">Requirements</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {requirements.map((r) => (
                <li
                  key={r.label}
                  className="rounded-full px-2.5 py-1 text-caption text-white/90 ring-1 ring-white/25"
                >
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Salary. */}
        <div className="mt-5 border-t border-white/15 pt-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <p className="text-body font-medium text-white">
              {salary.display ?? "Salary not disclosed"}
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-fine font-medium text-white/80">
              {salary.source === "employer-stated" ? "Employer-stated" : "Not disclosed"}
            </span>
          </div>
          {salary.basic && <p className="mt-1 text-caption text-white/75">{salary.basic}</p>}
          {salary.visaThreshold && (
            <ToneLine tone={salary.visaThreshold.tone} text={salary.visaThreshold.text} />
          )}
          {salary.inr && <p className="mt-1.5 text-fine text-white/65">{salary.inr}</p>}
        </div>

        {/* CTA. mt-auto pins it to the bottom in an equal-height grid. */}
        <div className="mt-auto pt-6">
          <Cta listing={listing} unlockHref={unlockHref} />
        </div>
      </div>
    </article>
  );
}

function Cta({ listing, unlockHref }: { listing: JobListing; unlockHref: string }) {
  const { access, example, applyUrl } = listing;

  if (access === "locked") {
    return (
      <Link href={unlockHref} className={`${ctaBase} bg-white text-navy transition-colors hover:bg-mist`}>
        <Lock size={18} weight="bold" aria-hidden />
        Unlock with membership
      </Link>
    );
  }

  const ineligible = access === "ineligible";
  const label = ineligible ? "View listing anyway" : "Apply on employer's site";
  const style = ineligible
    ? "text-white/85 ring-1 ring-white/35"
    : "bg-white text-navy";

  // Examples have no listing behind them: an inert, labelled placeholder.
  if (example || !applyUrl) {
    return (
      <div>
        <span aria-disabled="true" className={`${ctaBase} ${style} cursor-not-allowed opacity-70`}>
          {label}
          <ArrowSquareOut size={18} weight="bold" aria-hidden />
        </span>
        <p className="mt-2 text-center text-fine text-white/75">
          Example only. This card doesn&apos;t link to a real job.
        </p>
      </div>
    );
  }

  return (
    <div>
      <a
        href={applyUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={`${ctaBase} ${style} transition-colors ${ineligible ? "hover:bg-white/10" : "hover:bg-mist"}`}
      >
        {label}
        <ArrowSquareOut size={18} weight="bold" aria-hidden />
        <span className="sr-only"> (opens the employer&apos;s site in a new tab)</span>
      </a>
      {!ineligible && (
        <p className="mt-2 text-center text-fine text-white/75">
          External listing. You apply on the employer&apos;s own site.
        </p>
      )}
    </div>
  );
}
