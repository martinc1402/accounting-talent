import type { IconName } from "@/components/marketing/icons";

/*
  The AccountingTalent Passport: the five-part claim both marketing pages make,
  stated once and rendered twice.

  Why this file exists at all. content/firms.ts records that the revenue model is
  stated in five files and "all have to move together". The Passport is the same
  class of problem: a firm is told what the evidence proves, an accountant is told
  how to earn it, and those are two descriptions of ONE thing. Held in two files
  they drift, and the drift is invisible until a firm and an accountant compare
  notes and find the product described differently to each. So each pillar carries
  both audiences' copy on one object.

  Type-only import from a component into content. `IconName` is erased at build
  time, so this adds no runtime coupling and nothing to the client bundle. Content
  still must not hold a ReactNode; it holds the NAME of an icon and the component
  owns the map. That also fixes the positional ICONS[i] lookup that Edges.tsx used,
  where reordering the content array silently reassigned every icon.

  HONESTY IS THE POINT OF THIS FILE. Most of what the Passport describes is not
  built. `status` is not decoration: `ActionSlot` cannot render a link for a
  "planned" capability because the type gives it no href to render, so a fake
  button is a build error rather than something a reviewer has to catch. Read the
  Action union below before adding anything here.

  Dash convention inherited from content/firms.ts: no em dashes, no en-dash
  separators. A pause becomes a period, comma, colon or parentheses.
*/

export type CapabilityStatus = "live" | "early-access" | "planned";

/*
  What the reader is told. "live" gets NO label: a working feature does not
  announce that it works, and labelling everything makes the labels invisible
  exactly where they matter.
*/
export const statusLabels: Record<CapabilityStatus, string> = {
  live: "",
  "early-access": "In early access",
  planned: "Launching soon",
} as const;

/*
  An action a reader can take.

  The "planned" branch carries no label and no href. It is structurally incapable
  of becoming a button: there is nowhere to put the destination, so the mistake
  cannot be made. This is the whole enforcement mechanism, and it is why Action is
  a discriminated union rather than an object with optional fields.

  components/home/ProfileDetail.tsx already argues the rendering rule for the
  inert case, and ActionSlot follows it exactly: not a <button>, not an <a>, no
  tabIndex. "A press animation on something that cannot be pressed is a small
  lie." Do NOT reach for <button disabled> here. A disabled button is still in the
  accessibility tree, a keyboard user still finds it, and it is precisely the lie
  that comment rules out.
*/
export type Action =
  | { status: "live"; label: string; href: string }
  | { status: "early-access"; label: string; href: string; note: string }
  | { status: "planned"; note: string };

/* -------------------------------------------------------------------------- */
/* The five pillars                                                            */
/* -------------------------------------------------------------------------- */

export type PassportPillarId =
  | "foundations"
  | "work-proof"
  | "vouches"
  | "capability"
  | "reputation";

export type PassportPillar = {
  id: PassportPillarId;
  name: string;
  icon: IconName;
  status: CapabilityStatus;
  /** What a firm can conclude from it. */
  employer: string;
  /** What an accountant does to earn it. */
  accountant: string;
  /** The concrete parts. Kept short: this is a pillar, not a spec sheet. */
  items: readonly string[];
  /*
    Rendered whenever status is not "live". This is the sentence that keeps the
    section honest, so it says what exists TODAY rather than restating the
    promise in the past tense. If you cannot write a true one, the pillar is not
    ready to appear on the page.
  */
  today?: string;
};

export const passportPillars: readonly PassportPillar[] = [
  {
    id: "foundations",
    name: "Verified foundations",
    icon: "seal",
    status: "live",
    employer:
      "The checks a person has actually passed, each shown with the date it was last confirmed rather than as a permanent badge.",
    accountant:
      "Confirm who you are and what you qualified in, once, and carry it with you.",
    items: [
      "Identity",
      "Qualification",
      "English writing assessment",
      "Work history you confirm and date",
    ],
  },
  {
    id: "work-proof",
    name: "Work Proof",
    icon: "file",
    status: "early-access",
    employer:
      "Evidence of how someone approaches real accounting work, rather than a list of responsibilities held.",
    accountant:
      "Show how you work through a problem instead of describing it on a résumé.",
    items: [
      "A written account of a problem you solved",
      "A structured exam on US tax and accounting",
      "Reconciliation and month-end-close exercises",
      "Reporting and spreadsheet exercises",
    ],
    today:
      "What runs today is the written assessment and a ten-question exam on US tax and accounting, both marked by a person. Anonymised work samples and timed exercises are still being built, and no assessment result is shown on a profile yet.",
  },
  {
    id: "vouches",
    name: "Professional vouches",
    icon: "users",
    status: "planned",
    employer:
      "A specific claim from someone who worked with this person, tied to one capability rather than a general endorsement.",
    accountant:
      "Ask the people who saw your work to verify a particular thing you can do.",
    items: [
      "Worked together on month-end close",
      "Can verify QuickBooks proficiency",
      "Managed this accountant for two years",
      "Can verify client-communication ability",
    ],
    today:
      "None of this is built. No vouch has been requested, given or displayed, and no profile carries one.",
  },
  {
    id: "capability",
    name: "Practical capability",
    icon: "briefcase",
    status: "live",
    employer:
      "The working facts that decide whether someone fits the role: which tools, which clients, which hours.",
    accountant:
      "Say what you actually work in and when you are actually available.",
    items: [
      "Software, recorded by depth rather than by logo",
      "Industry and client-type experience",
      "US accounting exposure",
      "Availability and hours of overlap",
    ],
  },
  {
    id: "reputation",
    name: "Hiring reputation",
    icon: "chart",
    status: "planned",
    employer:
      "What happened after the hire. The signal that is worth the most and takes the longest to earn.",
    accountant:
      "Work that went well becomes something you can show the next employer.",
    items: [
      "Verified engagements",
      "Employer feedback",
      "Repeat-hire signals",
      "Placement history",
    ],
    today:
      "Nothing here exists yet. No engagement has been recorded and no employer feedback has been collected, because no one has been hired through the network.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Product principles, shared by both pages                                     */
/* -------------------------------------------------------------------------- */

export type NetworkPrinciple = {
  title: string;
  body: string;
  icon: IconName;
  status: CapabilityStatus;
};

export const networkPrinciples: readonly NetworkPrinciple[] = [
  {
    title: "Work challenges",
    body: "Accountants work through realistic tasks on synthetic or anonymised data, so capability is demonstrated rather than asserted.",
    icon: "file",
    status: "planned",
  },
  {
    title: "Evidence-based profiles",
    body: "Verified credentials, work samples and assessment results become a professional record that is reusable across opportunities.",
    icon: "seal",
    status: "early-access",
  },
  {
    title: "Skill-specific vouches",
    body: "A colleague verifies one particular capability they saw. There is no button that means nothing.",
    icon: "users",
    status: "planned",
  },
  {
    title: "Employer discovery",
    body: "Firms follow relevant talent, save searches, and come back when someone suitable becomes available.",
    icon: "search",
    status: "planned",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Plans                                                                        */
/* -------------------------------------------------------------------------- */

/*
  PlanId is the shared vocabulary across three places: the pricing cards here, the
  preferred_service column on employer_leads (migration 0021), and the `service`
  prop on the lead_submit analytics event. One list, so the funnel, the table and
  the page cannot disagree about what a firm asked for.

  These are NOT lib/authz/plans.ts PlanName ("free" | "paid"). A marketing tier is
  a price point; an entitlement is an authorization fact. Do not unify them:
  entitlementsFor() falls back to `free` for anything it does not recognise, so a
  mistake there fails silently AND permissively.
*/
export type PlanId =
  | "free-exploration"
  | "hiring-pass"
  | "curated-shortlist"
  | "ongoing";

/*
  The four services in the order the intake form offers them, and the ONLY place
  the id-to-label pairing is written down.

  The form stores the label as free text in employer_leads.preferred_service (a
  free-text categorical, matching the convention migration 0006 set for that
  table), while the analytics event carries the id. Deriving both from one array
  is what stops the dashboard and the column describing the same lead differently.
*/
export const serviceOptions: readonly { id: PlanId; label: string }[] = [
  { id: "free-exploration", label: "Free exploration" },
  { id: "hiring-pass", label: "Hiring Pass" },
  { id: "curated-shortlist", label: "Curated Shortlist" },
  { id: "ongoing", label: "Ongoing hiring" },
] as const;

export function serviceLabelFor(id: PlanId): string {
  return serviceOptions.find((o) => o.id === id)?.label ?? "";
}

export function serviceIdFor(label: string): PlanId | undefined {
  return serviceOptions.find((o) => o.label === label)?.id;
}

export type PlanFeature = { text: string; status: CapabilityStatus };

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  unit: string;
  body: string;
  /** "Most popular" and the like. Rendered as a pill on the card. */
  flag?: string;
  includes: readonly PlanFeature[];
  excludes?: readonly string[];
  guarantee?: string;
  action: Action;
};

/*
  No checkout exists. There is no Stripe dependency, no payment route and no
  webhook, so every paid CTA below RESERVES rather than buys, and each one lands
  on the same intake form with its plan preselected.

  "Get a Hiring Pass" would be a lie in a button. "Reserve a Hiring Pass" is not.
*/
export const employerPlans: readonly Plan[] = [
  {
    id: "free-exploration",
    name: "Explore",
    price: "Free",
    unit: "no card, no expiry",
    body: "Confirm that relevant people exist before you spend anything.",
    includes: [
      { text: "See example profiles in full", status: "live" },
      { text: "Skills, software and experience", status: "live" },
      { text: "Save and shortlist accountants", status: "live" },
      { text: "One introduction, for a verified firm", status: "live" },
      { text: "Browse public profiles", status: "planned" },
      { text: "Post one role and view applicants", status: "planned" },
    ],
    excludes: [
      "No unrestricted contact access",
      "No private references",
      "No bulk exports",
    ],
    action: { status: "live", label: "Start free", href: "/#reserve" },
  },
  {
    id: "hiring-pass",
    name: "Hiring Pass",
    price: "US$99",
    unit: "30 days of hiring access",
    body: "For a firm with a role to fill now.",
    flag: "Most popular",
    includes: [
      { text: "Verification detail on every profile", status: "live" },
      { text: "Unlimited saved profiles", status: "live" },
      { text: "Candidate comparison", status: "live" },
      { text: "Up to three active job posts", status: "planned" },
      { text: "Full candidate search and filters", status: "planned" },
      { text: "Up to 25 contact unlocks", status: "planned" },
      { text: "Direct messaging", status: "planned" },
      { text: "Saved searches and alerts", status: "planned" },
    ],
    guarantee:
      "Find at least three people you would genuinely interview, or the next 30 days are free.",
    action: {
      status: "early-access",
      label: "Reserve a Hiring Pass",
      href: "/#reserve",
      note: "There is nothing to pay yet. This reserves a pass and tells us to build toward your role.",
    },
  },
  {
    id: "curated-shortlist",
    name: "Curated Shortlist",
    price: "US$750",
    unit: "per shortlist",
    body: "Hand the search and the first screen to us.",
    includes: [
      { text: "A conversation about the role", status: "live" },
      { text: "Help defining and writing it", status: "live" },
      { text: "Five recommended people", status: "live" },
      { text: "Availability confirmed before you see them", status: "live" },
      { text: "Interview coordination", status: "live" },
      { text: "One replacement shortlist", status: "live" },
      { text: "One 30-day Hiring Pass included", status: "planned" },
    ],
    action: {
      status: "live",
      label: "Request a shortlist",
      href: "/#reserve",
    },
  },
] as const;

/*
  The secondary tier. Deliberately not a fourth card: it is a hairline block under
  the three, because a firm choosing its first step should be choosing between
  three things, not six.
*/
export const ongoingHiring = {
  heading: "Hiring repeatedly?",
  options: [
    "Hiring Pro from US$249 per month",
    "Recruiter access from US$499 per month",
    "Managed Search at US$500 upfront plus 8% of first-year compensation, subject to a US$2,500 minimum total fee",
  ],
  action: {
    status: "live",
    label: "Discuss ongoing hiring",
    href: "/#reserve",
  } satisfies Action,
} as const;

export const pricingNote =
  "Browsing and taking part in the network are free. Firms pay when they want broader contact access, repeated recruiting tools, or hands-on help with a search.";
