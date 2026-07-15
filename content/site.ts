/*
  Every user-facing string on the site resolves from content/*.
  The copy doc is explicit that at employer launch the homepage flips to the
  employer pitch and worker recruitment moves to /careers. Keeping sections
  content-driven makes that flip a data change rather than a rewrite.
*/

/**
 * Worker-facing pages say "late 2026" rather than "Q4 2026": the Indian
 * financial year runs April to March, so "Q4" reads as Jan-Mar 2027 to many
 * applicants. The employer page can safely say Q4, US readers parse it as
 * calendar Q4.
 */
/*
  The \u00A0 (non-breaking space) escapes below keep a number welded to its unit,
  so a line can never end on a dangling "late" or "Q4". These four constants are
  the single source of every launch date on the site, so fixing them here fixes
  the hero fine print, the steps, the closing CTA and the FAQ at once.

  Written as escapes rather than literal non-breaking spaces on purpose: a raw
  NBSP pasted into source looks exactly like a normal space, cannot be grepped,
  and the next person to edit this line would delete it without knowing.
*/
export const LAUNCH_WORKER = "late\u00A02026 (October\u00A0to\u00A0December)";
export const LAUNCH_WORKER_SHORT = "late\u00A02026";
export const LAUNCH_EMPLOYER = "Q4\u00A02026";
export const LAUNCH_MONTH = "October\u00A02026";

export const CONTACT_EMAIL = "contact@accountingtalent.in";
export const OPERATOR = "Kaya Virtual (Australia)";

export const nav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "For Employers", href: "/employers" },
] as const;

export const primaryCta = {
  label: "Apply free",
  href: "/apply",
} as const;

/*
  The nav CTA on the employer page. Everywhere else the nav sells the worker
  application ("Apply free"); on /employers the reader is a firm, so it points at
  the waitlist form on the same page rather than the worker funnel. Nav swaps to
  this purely off its `active` prop, so it stays a zero-JS server component.
*/
export const employerCta = {
  label: "Join the waitlist",
  href: "#waitlist",
} as const;

export const footer = {
  tagline: "Hire India's accounting talent, directly.",
  links: [
    { label: "For Employers", href: "/employers" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy & Terms", href: "/legal" },
  ],
  email: CONTACT_EMAIL,
  disclosure: `AccountingTalent.in is a talent database operated by ${OPERATOR}. We are not a staffing agency, employer, or party to any employment agreement.`,
} as const;
