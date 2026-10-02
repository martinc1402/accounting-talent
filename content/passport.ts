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
