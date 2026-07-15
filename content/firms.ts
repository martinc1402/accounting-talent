import { LAUNCH_EMPLOYER } from "./site";

/*
  The employer page can say "Q4 2026": US\u00A0readers parse that as calendar Q4.
  Worker-facing pages must not, because the Indian financial year runs April to
  March and Q4 reads as January to March 2027 there.
*/
export const firms = {
  h1: "Hire India's accounting talent. Directly.",

  // The paragraph, the pull-line and the note under it were one run-on `sub`
  // before. Split so the pull-line ("you search, you interview...") can stand as
  // its own serif line, which is the sentence that actually sells the model.
  sub: "A vetted database of Indian bookkeepers, staff\u00A0accountants, and US\u00A0tax\u00A0preparers. Chartered Accountants and US\u2011software\u2011experienced staff at $500 to $1,500 per month, full-time. No agency markup. No per\u2011hire fees.",
  pullLine: "You search, you interview, you hire, you pay them directly.",
  subNote: "Flat subscription. Cancel anytime.",

  proof: [
    {
      title: "The talent is real",
      body: "Every listed profile passes an English writing assessment and a US\u00A0accounting quiz. Filter by QuickBooks, Xero, Drake, Lacerte and CCH experience, and by the US\u00A0forms they have actually prepared (1040, 1120\u2011S, 1065).",
    },
    {
      title: "The math is obvious",
      // `emphasis` is the one phrase the page renders in navy medium weight, so
      // the number that carries the section is the thing the eye lands on.
      body: "Offshore staffing agencies charge $1,200 to $2,500 per month per person with their margin baked in. Direct hires cost roughly half. Per the AICPA, a quarter of US\u00A0firms already offshore. This is the same work, without the middleman.",
      emphasis: "Direct hires cost roughly half.",
    },
    {
      title: "Compliance handled",
      body: "Section\u00A07216 consent templates, engagement-letter language, and payment rails that satisfy Indian remittance paperwork. Built in, not your problem.",
    },
  ],

  waitlist: {
    heading: `Launching ${LAUNCH_EMPLOYER}`,
    body: "Founding firms get 50% off for the first year and first access to the verified pool.",
    // The price anchor. A waitlist with no number is a shrug; naming the launch
    // price and the founding discount is what makes "join" a decision.
    priceAnchor:
      "Launch price $99/month. Founding firms pay $49/month for year one.",
    label: "Work email",
    placeholder: "you@yourfirm.com",
    cta: "Join the waitlist",
    microcopy: "One email at launch, one before. No spam, no sales calls.",
    success:
      "You're on the list. We'll be in touch before launch with founding-firm details.",
  },

  // The sample profile shown on this page is the homepage hero card, reused. A
  // firm sees the same artifact a worker sees, which is the honest version of
  // "here is what is in the pool".
  profileLabel: "A verified profile from the pool",
  profileCaption:
    "Sample profile. Every listed profile passes the same assessment.",

  faqHeading: "Questions firms ask us",
} as const;
