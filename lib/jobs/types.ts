/*
  The shape of one job listing as the card renders it.

  Written for the scraper to fill later: every field is something a scraper (or
  a person reviewing its output) can actually produce from an employer's career
  page plus a few lookups (sponsor registers, salary thresholds, an FX rate).
  Nothing here is presentation-only. Today the only producer is content/jobs.ts,
  where every listing is a fictional example.

  Free-text display strings (salary, INR line) stay strings on purpose: the
  scraper will format them once, with the currency and period it found, rather
  than this type pretending to model every pay structure in five countries.
*/

/** How a check came out. Never shown by colour alone: each tone has its own
 *  icon shape and a screen-reader label (see components/jobs/JobCard.tsx). */
export type Tone = "good" | "warn" | "bad" | "neutral";

export type StatusCheck = {
  tone: Tone;
  /** The pill: short, e.g. "Open to India", "May sponsor", "Not eligible". */
  value: string;
  /** One line saying why, e.g. "Listing says UAE residents only". */
  reason: string;
};

/*
  The second status row depends on the role. On-site abroad, the question is
  visa sponsorship; remote from India, there is no visa, and the question is the
  hours you would have to keep.
*/
export type SecondCheck =
  | { kind: "visa-sponsorship"; check: StatusCheck }
  | { kind: "working-hours"; check: StatusCheck };

export type Requirement = {
  label: string;
  /** Qualification chips always sort first; see orderRequirements(). */
  kind: "qualification" | "experience" | "skill";
};

export type Salary = {
  /** e.g. "AED 16,000–19,000 a month". Null when not disclosed. */
  display: string | null;
  source: "employer-stated" | "not-disclosed";
  /** e.g. "Basic AED 10,500 + housing and transport". */
  basic?: string;
  /** A check against a visa salary rule, e.g. the UK going rate for the SOC code. */
  visaThreshold?: { tone: Tone; text: string };
  /** The converted line, e.g. "≈ ₹3.7–4.4 lakh a month". Smaller, secondary. */
  inr?: string;
};

/*
  What the viewer is allowed to see and do:
  - "full": everything, CTA goes to the employer's site.
  - "locked": free-preview view. Employer name and the evidence are hidden and
    the CTA sells membership.
  - "ineligible": the listing excludes applicants like the viewer (e.g. UAE
    residents only). Dimmed, with a quieter "View listing anyway".
*/
export type ListingAccess = "full" | "locked" | "ineligible";

export type JobListing = {
  id: string;
  title: string;
  employer: {
    name: string;
    /** Two letters for the tile. Derived from the name when absent. */
    monogram?: string;
    /** Posted by the employer itself, not an agency. */
    direct: boolean;
  };
  destination: {
    /** The pill, e.g. "Dubai, UAE" or "Remote · USA". */
    label: string;
    /** A short code set large in the band, e.g. "DXB", "LON", "US". */
    code: string;
  };
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  applyFromIndia: StatusCheck;
  second: SecondCheck;
  /** ISO 8601. When we last confirmed the listing is still up. */
  checkedAt: string;
  /** ISO 8601. When we first found it. */
  firstSeenAt: string;
  evidence: {
    quote: string;
    /** Where the quote came from, e.g. "Careers page (Workday), 2 Oct". */
    source: string;
  };
  package?: string[];
  requirements: Requirement[];
  salary: Salary;
  /** The employer's own listing. Absent on examples, which link nowhere. */
  applyUrl?: string;
  access: ListingAccess;
  /** Fictional listing written to show the format. Labelled on the card. */
  example?: boolean;
};
