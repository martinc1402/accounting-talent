import { LAUNCH_EMPLOYER } from "./site";

/*
  The employer page can say "Q4 2026": US\u00A0readers parse that as calendar Q4.
  Worker-facing pages must not, because the Indian financial year runs April to
  March and Q4 reads as January to March 2027 there.
*/
export const firms = {
  h1: "Hire India's accounting talent. Directly.",
  sub: "A vetted database of Indian bookkeepers, staff\u00A0accountants, and US\u00A0tax\u00A0preparers. Chartered Accountants and US-software-experienced staff at $500 to $1,500 per month, full-time. No agency markup. No per-hire fees. You search, you interview, you hire, you pay them directly. Flat subscription, cancel anytime.",
  proof: [
    {
      title: "The talent is real",
      body: "Every listed profile passes an English writing assessment and a US\u00A0accounting quiz. Filter by QuickBooks, Xero, Drake, Lacerte and CCH experience, and by the US\u00A0forms they have actually prepared (1040, 1120\u2011S, 1065).",
    },
    {
      title: "The math is obvious",
      body: "Offshore staffing agencies charge $1,200 to $2,500 per month per person with their margin baked in. Direct hires cost roughly half. Per the AICPA, a quarter of US\u00A0firms already offshore. This is the same work, without the middleman.",
    },
    {
      title: "Compliance handled",
      body: "Section 7216 consent templates, engagement-letter language, and payment rails that satisfy Indian remittance paperwork. Built in, not your problem.",
    },
  ],
  waitlist: {
    heading: `Launching ${LAUNCH_EMPLOYER}`,
    body: "Founding firms get 50% off for the first year and first access to the verified pool.",
    label: "Work email",
    placeholder: "you@yourfirm.com",
    cta: "Join the waitlist",
    success:
      "You're on the list. We'll be in touch before launch with founding-firm details.",
  },
  image: {
    src: "/images/us-firm.jpg",
    alt: "An accounting firm partner reviewing documents at a desk in a small US\u00A0office.",
  },
} as const;
