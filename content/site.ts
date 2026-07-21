/*
  Every user-facing string on the site resolves from content/*.
  The copy doc is explicit that at employer launch the homepage flips to the
  employer pitch and worker recruitment moves to /careers. Keeping sections
  content-driven makes that flip a data change rather than a rewrite.
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

  The employer page no longer references a launch date: concierge matching is
  open now, so LAUNCH_EMPLOYER / LAUNCH_MONTH were removed with the old
  subscription model.
*/
export const LAUNCH_WORKER = "late\u00A02026 (October\u00A0to\u00A0December)";
export const LAUNCH_WORKER_SHORT = "late\u00A02026";

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
  the role-brief form on the same page rather than the worker funnel. Nav swaps
  to this purely off its `active` prop, so it stays a zero-JS server component.
  Target is #get-matched (the "Tell us who you need" brief), the page's one
  conversion.

  Note: the Nav renders <Cta position="hero"> for /employers, which sources its
  own label and href from firms.getMatched, so this constant is the fallback and
  its label/href are kept in sync with that.
*/
export const employerCta = {
  label: "Get matched candidates",
  href: "#get-matched",
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
