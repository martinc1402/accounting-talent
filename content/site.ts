/*
  Every user-facing string on the site resolves from content/*.

  That flip has now happened: "/" is the employer pitch (content/firms.ts) and
  worker recruitment lives at /accountants (content/home.ts). It was a content
  change rather than a rewrite, which is the whole reason for this discipline.
  Earlier comments called the worker destination /careers; the route that shipped
  is /accountants.
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

  LAUNCH_EMPLOYER is back. It was removed when the employer page briefly sold
  concierge matching with no launch gate; the database model has a date again, so
  the firm-facing pages need their own constant. Same value as the worker pair
  today, deliberately kept separate: the two sides can slip independently, and
  the employer copy says "Q4" nowhere for the same financial-year reason.
*/
export const LAUNCH_WORKER = "late\u00A02026 (October\u00A0to\u00A0December)";
export const LAUNCH_WORKER_SHORT = "late\u00A02026";

export const LAUNCH_EMPLOYER = "late\u00A02026 (October\u00A0to\u00A0December)";
export const LAUNCH_EMPLOYER_SHORT = "late\u00A02026";

export const CONTACT_EMAIL = "contact@accountingtalent.in";
export const OPERATOR = "Kaya Virtual (Australia)";

/*
  Two navs, because the site sells to two audiences from two homepages and a
  single list cannot serve both. "/" is the firm pitch, /accountants is the worker
  pitch, and an item like "Pricing" is an employer concern that would send an
  accountant to the wrong page mid-visit.

  KEEP THE TWO LISTS THE SAME LENGTH AND THE SAME SHAPE: two section anchors, then
  FAQ, then the link to the other audience's page. Same rhythm, same slot order,
  labels suited to the reader. The site has to look like one product across both
  pages, and a four-item bar next to a three-item bar is the tell that it is not.
  If you add or drop an item here, do it to both.

  The lists cannot be identical, only shape-matched: "/" has four anchored
  sections while /accountants has two (#how-it-works, #who-we-want) and keeps its
  FAQ on a separate route.

  Four items plus a CTA is the ceiling before labels start colliding at lg
  (1024px), which is also where the header must still render on one line.

  This replaced a string-rewrite in Nav.tsx that rebuilt hrefs by matching on
  "/#how-it-works". That hack broke silently the moment this file changed, which
  is exactly what it did when the homepage moved. Nav now picks a list by
  audience instead of patching one.
*/
export const nav = [
  { label: "How we vet", href: "/#vetting" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "For Accountants", href: "/accountants" },
] as const;

export const workerNav = [
  { label: "How it works", href: "/accountants#how-it-works" },
  { label: "Who we want", href: "/accountants#who-we-want" },
  { label: "FAQ", href: "/faq" },
  { label: "For Firms", href: "/" },
] as const;

export const primaryCta = {
  label: "Apply free",
  href: "/apply",
} as const;

/*
  The nav CTA on firm-facing pages. On worker pages the nav sells the application
  ("Apply free"); on "/" the reader runs a firm, so it points at the intake form
  on the same page rather than the worker funnel. Nav swaps on audience, so it
  stays a zero-JS server component.

  Target is the founding-access intake form, the page's one conversion. The href
  is absolute ("/#reserve") rather than a bare "#reserve" because this nav also
  renders on /legal, where a page-local anchor would silently do nothing. An
  absolute anchor still scrolls correctly when you are already on "/".

  One label per intent: this exact string is also the hero button, the sticky bar
  and the closing CTA, so a firm never sees two differently-worded doors to the
  same form.

  Note: the Nav renders <Cta position="hero"> on "/", which sources its own label
  and href from firms.reserve, so this constant is the fallback and its label and
  href are kept in sync with that.
*/
export const employerCta = {
  label: "Reserve founding access",
  href: "/#reserve",
} as const;

export const footer = {
  tagline: "Hire India's accounting talent, directly.",
  links: [
    { label: "For Accountants", href: "/accountants" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy & Terms", href: "/legal" },
  ],
  email: CONTACT_EMAIL,
  disclosure: `AccountingTalent.in is a talent database operated by ${OPERATOR}. We are not a staffing agency, employer, or party to any employment agreement.`,
} as const;
