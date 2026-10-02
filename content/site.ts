/*
  Every user-facing string on the site resolves from content/*.

  "/" is the job-search membership (content/jobs.ts). The firm pitch and the
  /apply profile funnel were removed in 2026-10; /accountants (content/home.ts)
  is still in the repo but redirected away.
*/

/*
  Worker-facing launch dates. Kept as the single source so a change fixes the
  hero fine print, the steps, and the FAQ at once. Worker pages say "late 2026"
  rather than "Q4 2026": the Indian financial year runs April to March, so "Q4"
  reads as Jan-Mar 2027 to many applicants.

  Written as \u00A0 (non-breaking space) escapes rather than literal NBSPs on
  purpose: a raw NBSP pasted into source looks exactly like a normal space,
  cannot be grepped, and the next person to edit the line would delete it without
  knowing. The escapes weld a number to its unit so a line never ends on a
  dangling "late".

  LAUNCH_EMPLOYER IS GONE, for the second time and for a better reason than the
  first. It was removed once when the employer page briefly sold concierge
  matching, then reinstated when the database model got a date back.

  The employer page no longer has a launch gate at all. It describes a network in
  early access: some things work today, some are labelled "Launching soon" on
  their face, and a single site-wide date cannot express that. A firm reading
  "opens late 2026" beside a working introduction request learns the wrong thing
  in both directions. Per-capability status now lives in content/passport.ts,
  which is also the only place that can be checked by the type system.

  The worker pair stays for now: /accountants still tells applicants when firms
  begin hiring, which is a real thing they are waiting on rather than a gate on
  what they can do today (they can build a profile now).
*/
export const LAUNCH_WORKER = "late\u00A02026 (October\u00A0to\u00A0December)";
export const LAUNCH_WORKER_SHORT = "late\u00A02026";

export const CONTACT_EMAIL = "contact@accountingtalent.in";
export const OPERATOR = "Kaya Virtual (Australia)";

/*
  One nav, on every public page. The site sells one thing (a job-search
  membership), so there is one item list and one CTA.

  THE AUDIENCE SPLIT IS GONE. The site used to carry a firm nav (/employers), a
  worker nav (/accountants, /apply) and a job-seeker nav. /employers, /apply and
  the FAQs were deleted and /accountants is redirected away (next.config.ts), so
  only the job-seeker list is left. If the firm or profile sides come back, the
  previous version of this file and components/chrome/Nav.tsx are in git.

  Anchors stay absolute ("/#pricing", not "#pricing") because this nav also
  renders on /get-access and /legal, where a page-local anchor would silently do
  nothing. An absolute anchor still scrolls correctly when you are already on "/".
*/
export const navItems = [
  { label: "Example listings", href: "/#listings" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
] as const;

/*
  The nav CTA. "Reserve access" rather than "Get access" or "Join": there is no
  checkout yet, so a paid offer may reserve interest but must not say Get, Buy
  or Subscribe until payment exists (lib/content/ctas.test.ts). Short enough to
  sit beside the hamburger at 360px.
*/
export const memberCta = {
  label: "Reserve access",
  href: "/get-access",
} as const;

export const footer = {
  tagline: "Remote and overseas accounting jobs, straight from employers.",
  links: [{ label: "Privacy & Terms", href: "/legal" }],
  email: CONTACT_EMAIL,
  disclosure: `AccountingTalent.in is operated by ${OPERATOR}. We are a job-search membership, not a recruitment agency or an employer: we link to listings on employers' own sites, and you apply to the employer directly. We never take a cut of your salary.`,
} as const;
