import { LAUNCH_WORKER } from "./site";

export type FaqItem = {
  // Stable, kebab-case. Drives the /faq deep-link anchors and the JSON-LD, and
  // lets homepageFaq below pick specific questions by name rather than by array
  // position, so reordering this list for /faq cannot change the homepage.
  id?: string;
  q: string;
  a: string[];
};

/*
  The order here IS the /faq render order (the page maps this array straight
  through the Accordion). It is NOT the homepage order any more: homepageFaq
  below pins its four questions by id, so this list can be reordered freely.
*/
export const faq: FaqItem[] = [
  {
    id: "free",
    q: "Is this really free?",
    a: [
      "Yes, permanently, for accounting professionals. US\u00A0firms pay a subscription to search the database. If anyone ever asks you for money to join, it is not us.",
    ],
  },
  {
    id: "salary",
    q: "What salary can I expect?",
    a: [
      "Typical direct-hire ranges: $500 to $800/month for bookkeepers, $800 to $1,500 for experienced accountants and tax preparers, and $1,500 to $2,500+ for senior and reviewer roles, full-time, long-term positions. You set your own expected salary in the application and negotiate directly with the firm that contacts you. Figures are typical, not guaranteed.",
    ],
  },
  {
    id: "after-applying",
    q: "What happens after I apply?",
    a: [
      "Make sure the email on your application is correct. It's how everything reaches you. Shortlisted applicants receive the skills assessment by email within 3 days. Pass it and your profile is marked Verified and shown first when US\u00A0firms begin searching in late 2026 (October to December). We email you at launch either way.",
    ],
  },
  {
    id: "timing",
    q: "When do US\u00A0firms actually start hiring?",
    a: [
      `We open the database to US\u00A0accounting firms in ${LAUNCH_WORKER}. There is no job waiting for you today, and we are not going to pretend otherwise. If that date slips, we will email you and say so.`,
    ],
  },
  {
    id: "us-experience",
    q: "I don't have US\u00A0experience. Should I still apply?",
    a: [
      "Yes, if you are a CA, CA\u00A0Inter, CMA, or an experienced accountant. Many US\u00A0firms train strong fundamentals. You will be in the trainable pool, shown to firms that hire for potential.",
    ],
  },
  {
    id: "payment",
    q: "How would a US\u00A0firm pay me?",
    a: [
      "Directly, in USD, via international transfer or payment platforms. This is the same way thousands of Indian freelancers and remote workers are paid today.",
      "We are also building payment tooling that handles the FIRC paperwork you need for GST and tax filing.",
    ],
  },
  {
    id: "night-hours",
    q: "Do I have to work US\u00A0night hours?",
    a: [
      "No. Many roles (bookkeeping, tax\u00A0prep) work fine on Indian hours with overnight turnaround. Roles needing live collaboration pay more for evening overlap. You declare your preference in the application.",
    ],
  },
  {
    id: "verification",
    q: "What is the verification assessment?",
    a: [
      "A short written prompt (describe an accounting problem you solved) plus 10 questions on US\u00A0accounting and tax basics. It takes about 20 minutes.",
      "It exists because Verified is what makes US\u00A0firms trust the database, and what gets you hired faster.",
    ],
  },
  {
    id: "tally",
    q: "What if I only know Tally?",
    a: [
      "Apply anyway and answer honestly. You will join the training pipeline. We will point you to free QuickBooks Online certification (Intuit's is free) and you can upgrade your profile once you complete it.",
      "Do not claim software you cannot use. Firms test in interviews, and false claims get profiles removed permanently.",
    ],
  },
  {
    id: "legal",
    q: "Is this legal? Do I need a company or GST registration?",
    a: [
      "Working for a foreign client as an Indian freelancer or contractor is legal and common. Depending on your income you may need GST registration. Exports of services are zero-rated, but the paperwork (FIRC and FIRA) matters.",
      "We publish plain-language guides on this before launch, and our payment tooling is being built to generate the right documentation automatically.",
      "We are a platform, not tax advisors. For your personal situation, consult a CA. You probably know one.",
    ],
  },
  {
    id: "currently-employed",
    q: "Can I apply if I'm currently employed at an offshore firm?",
    a: [
      "Yes. Your profile is not public to everyone: only paying, verified US\u00A0firms can browse it. You control what identifying detail appears, and you choose when to respond to contact.",
    ],
  },
  {
    id: "referral",
    q: "What does referring a friend actually get me?",
    a: [
      "For the first 90 days after employer launch, both you and the person you referred sort above equivalent profiles in firm search results. That is the whole promise, stated plainly.",
    ],
  },
  {
    id: "data",
    q: "What happens to my data?",
    a: [
      "It is shown only to subscribed US\u00A0employers, never sold, and deletable on request. The full policy is on our Privacy and Terms page.",
    ],
  },
];

/*
  The homepage short-FAQ. Pinned to four questions by id rather than the old
  faq.slice(0, 4), so reordering `faq` for the /faq page leaves the homepage
  showing exactly these four, in this order.
*/
const byId = (id: string): FaqItem => {
  const item = faq.find((f) => f.id === id);
  if (!item) throw new Error(`faq: no item with id "${id}"`);
  return item;
};

export const homepageFaq: FaqItem[] = [
  "free",
  "us-experience",
  "payment",
  "night-hours",
].map(byId);

/*
  The employer FAQ, rendered on /employers under the proof blocks. Same FaqItem
  shape and the same Accordion component the homepage uses. Kept separate from
  `faq` (the worker FAQ) because the two audiences ask different questions and
  /faq should not show firm-side answers. Ids are stable kebab-case so a future
  deep-link can land on a specific question; the page currently links to the FAQ
  section as a whole (#faq).

  Dashes conformed to the site convention (no em dashes; ranges use "to" or a
  plain hyphen; an em-dash pause becomes a comma, colon, or parentheses).
*/
export const employerFaq: FaqItem[] = [
  {
    id: "how-fast",
    q: "How quickly can I receive candidates?",
    a: [
      "Send us your role brief and we come back with a shortlist of matched candidates within 72 hours, usually sooner. From there you interview at your own pace.",
    ],
  },
  {
    id: "who-is-available",
    q: "What kinds of accounting professionals are available?",
    a: [
      "US tax preparers, bookkeepers, staff and senior accountants, AP/AR and payroll specialists, audit support, and accounting operations staff. Experience with tools like QuickBooks Online, Xero, Drake, Lacerte, UltraTax, ProSeries, and NetSuite varies by candidate, so tell us what your firm runs and we match to it.",
    ],
  },
  {
    id: "interview-before-paying",
    q: "Can I interview candidates before paying?",
    a: [
      "Yes. You review the shortlist and interview candidates directly, at no cost. You pay only when you decide to hire someone.",
    ],
  },
  {
    id: "who-employs",
    q: "Who employs or contracts with the accountant?",
    a: [
      "You do, directly. Most firms engage the accountant as an independent contractor who invoices them; some move a long-term hire onto an employer-of-record platform. How you classify and structure the relationship is a decision for you and your advisor. AccountingTalent introduces the candidate and is not a party to the engagement.",
    ],
  },
  {
    id: "how-compensation",
    q: "How is compensation agreed?",
    a: [
      "You and the accountant agree on pay directly, the same way you would with any hire. We can share typical market ranges to help you set an offer, but the number is yours to negotiate.",
    ],
  },
  {
    id: "salary-cut",
    q: "Does AccountingTalent take part of the accountant's salary?",
    a: [
      "No. The accountant keeps 100% of what you pay them. We are paid a one-time success fee by the firm when you hire, never a recurring percentage of anyone's salary.",
    ],
  },
  {
    id: "if-it-doesnt-work-out",
    q: "What happens if the hire doesn't work out?",
    a: [
      "You hire directly, so it is your engagement to end, with no agency contract or buyout clause. If a placement does not work out during the guarantee period, we put together a replacement shortlist so you can find a better fit.",
    ],
  },
  {
    id: "us-hours",
    q: "Can candidates work US hours?",
    a: [
      "Many can. Availability ranges from full US business-hours overlap to a partial morning or afternoon overlap to overnight turnaround on Indian hours, which suits a lot of bookkeeping and tax-prep work. Tell us what you need and we match candidates to it.",
    ],
  },
  {
    id: "how-assessed",
    q: "How are candidates assessed?",
    a: [
      "Before we introduce someone, our review may include written English, accounting knowledge, relevant software experience, US accounting or tax experience, work history, availability, and compensation expectations, with references or identity verification where completed. Not every check applies to every candidate; we tell you what has been verified for the people on your shortlist.",
    ],
  },
  {
    id: "security-compliance",
    q: "What security and compliance measures should my firm consider?",
    a: [
      "Treat a remote accountant the way careful firms treat any remote staff: a confidentiality agreement, least-privilege system access, multi-factor authentication, sensible device and password policies, client-consent procedures where required (for example IRS Section 7216 when offshoring tax preparation), and a plan for how data is handled and access is revoked when an engagement ends.",
      "Employment, contractor classification, taxpayer-data consent, and professional obligations vary by firm and jurisdiction. We are not your legal, tax, or compliance advisor; obtain advice appropriate to your circumstances.",
    ],
  },
];
