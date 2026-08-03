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
  One flat nav, four items, identical on every page.

  THIS REVERSES THE AUDIENCE-GROUPED DROPDOWNS, deliberately, and the reasoning
  they were built on is worth keeping because most of it was right.

  The groups replaced two flat audience-specific lists that were swapped by prop,
  which made the header change shape between the two homepages and read as two
  sites sharing a wordmark. Grouping fixed that, and the panels were a careful
  piece of work: real disclosure semantics, arrow-key roving, Escape restoring
  focus, an "Overview" row because the group label was a button and did not
  navigate. The instruction at the time was to KEEP THE TWO GROUPS SYMMETRICAL so
  neither audience read as the afterthought.

  What changed is the product, not the craft. The site is now one network with two
  sides rather than two pitches sharing a domain, and the employer page grew the
  sections a firm actually navigates between (the network, how hiring works,
  pricing). Naming those directly beats hiding them one hover deep behind an
  audience label, and "For Accountants" as a peer item keeps the other side
  discoverable without a panel. The header also goes back to shipping zero
  JavaScript, since the disclosure state was the only thing that needed it.

  If dropdowns come back, components/chrome/NavGroup.tsx is in the git history at
  4727da7 and is worth restoring rather than rewriting: the keyboard handling in
  it was correct and is easy to get wrong.

  The section anchors stay absolute ("/#pricing", not "#pricing") because this nav
  renders on /legal and /faq too, where a page-local anchor would silently do
  nothing. An absolute anchor still scrolls correctly when you are already there.
  This is the one rule from the old comment that must not be relaxed.

  The CTA is NOT part of this list and stays context-aware (see employerCta and
  primaryCta below).
*/
export const navItems = [
  { label: "Find Talent", href: "/#network" },
  { label: "How It Works", href: "/#how-hiring-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "For Accountants", href: "/accountants" },
] as const;

/*
  The nav CTA on worker pages. "Join free" rather than "Apply free": the page now
  sells a professional profile you build and keep, and "apply" describes a single
  job application, which is the older and smaller promise.
*/
export const primaryCta = {
  label: "Join free",
  href: "/apply",
} as const;

/*
  The nav CTA on firm-facing pages. On worker pages the nav sells the profile
  ("Join free"); on "/" the reader runs a firm, so it points at the intake form on
  the same page rather than the worker funnel.

  Target is the intake form, the page's one conversion. The href is absolute
  ("/#reserve") rather than a bare "#reserve" because this nav also renders on
  /legal, where a page-local anchor would silently do nothing. An absolute anchor
  still scrolls correctly when you are already on "/".

  "Post a role free" rather than the old "Reserve founding access". Posting a role
  is not built, and the label would be a lie if it went anywhere that claimed
  otherwise; it goes to the intake form, where the first thing a firm picks is
  which service it wants and the honest-stage section says plainly what is live.
  The founding programme is now a section on the page rather than the name of
  every button on it.

  One label per intent: this exact string is also the hero secondary button and
  the sticky bar, so a firm never sees two differently-worded doors to one form.

  Note: the Nav renders <Cta position="hero"> on "/", which sources its own label
  and href from firms.reserve, so this constant is the fallback and its label and
  href are kept in sync with that.
*/
export const employerCta = {
  label: "Post a role free",
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
