import { LAUNCH_WORKER_SHORT } from "./site";

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
      "Yes, permanently, for accounting professionals. US\u00A0firms pay us for access to the database, plus a one-time fee when they hire someone. We will never ask you for money at any stage: not to apply, not to be verified, not to be introduced to a firm. If anyone ever asks you for money to join, it is not us.",
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
    id: "currently-employed",
    q: "Can I apply if I'm currently employed at an offshore firm?",
    a: [
      "Yes, and this is the case we designed for. Your profile is not published anywhere public and it is not visible to search engines. Only subscribed US firms can search the database, they see only the detail you have chosen to show, and your name and contact details are not part of it. If a firm wants to talk to you, it has to request an introduction, and we ask you first. Nothing reaches them until you say yes, and you can delete your profile at any time.",
    ],
  },
  {
    id: "after-applying",
    q: "What happens after I apply?",
    a: [
      `Make sure the email on your application is correct. It is how everything reaches you. Shortlisted applicants receive the skills assessment by email within 3 days. Pass it and your profile is marked Verified, which is what firms filter for first when the database opens in ${LAUNCH_WORKER_SHORT}. We email you either way, and we send every profile a short update once a month.`,
    ],
  },
  {
    id: "timing",
    q: "When do US\u00A0firms actually start hiring?",
    a: [
      `We open to US\u00A0accounting firms in ${LAUNCH_WORKER_SHORT}. There is no job waiting for you today, and we are not going to pretend otherwise. If that timing slips, we will email you and say so.`,
    ],
  },
  {
    id: "us-experience",
    q: "I don't have US\u00A0experience or US\u00A0software. Should I still apply?",
    a: [
      "Yes. If you are a CA, CA\u00A0Inter, CMA, or an experienced accountant, apply and answer honestly. Many US\u00A0firms train strong fundamentals, and US\u00A0tax\u00A0software is learnable. If you only know Tally, we will point you to Intuit's free QuickBooks Online certification, and you can upgrade your profile once you complete it.",
      "Do not claim software you cannot use. Firms test in interviews, and false claims get profiles removed permanently.",
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
    id: "legal",
    q: "Is this legal? Do I need a company or GST registration?",
    a: [
      "Working for a foreign client as an Indian freelancer or contractor is legal and common. Depending on your income you may need GST registration. Exports of services are zero-rated, but the paperwork (FIRC and FIRA) matters.",
      "We publish plain-language guides on this before launch, and our payment tooling is being built to generate the right documentation automatically.",
      "We are a platform, not tax advisors. For your personal situation, consult a CA. You probably know one.",
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
      "It is shown only to US\u00A0firms searching the database, never sold, and deletable on request. Your contact details are not part of what they see: those only reach a firm after you approve an introduction. The full policy is on our Privacy and Terms page.",
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
  The employer FAQ, rendered on the homepage under #faq. Same FaqItem shape and
  the same Accordion component the worker pages use. Kept separate from `faq`
  (the worker FAQ) because the two audiences ask different questions and /faq
  should not show firm-side answers. Ids are stable kebab-case so a future
  deep-link can land on a specific question.

  Rewritten for the database model. The previous version was written for the
  concierge offer that briefly replaced it ("send us a role brief, shortlist in
  72 hours, guarantee period") and contradicted every other section on the page
  it renders under.

  Prices here MUST match firms.pricing exactly: $1,440 a year, $720 founding,
  $2,400 per hire, 90 days. They are stated in `cost` and referenced in
  `different-from-staffing`. If pricing moves, both move.

  [TODO: LEGAL REVIEW] on `confidentiality` and `who-employs`. They name IRS
  Section 7216 and PCAOB/AICPA expectations, and describe consent language we
  supply. The wording is deliberately "we provide templates, you and your advisor
  decide" and must not drift into telling a firm what satisfies its obligations.

  Dashes conformed to the site convention (no em dashes; ranges use "to" or a
  plain hyphen; an em-dash pause becomes a comma, colon, or parentheses).
*/
export const employerFaq: FaqItem[] = [
  {
    id: "how-verified",
    q: "How are candidates verified?",
    a: [
      "Every profile marked Verified has been through the same checks: an English writing assessment of 80 to 200 words about a real accounting problem the candidate solved, a 10\u2011question exam on US\u00A0tax and accounting, a record of which software they have actually worked in and at what depth, a history of which US\u00A0returns they have prepared, and confirmed working hours. A person reviews every submission, and candidates who fall short are not marked Verified.",
      "Each profile shows what has been verified and the date each check was last confirmed, so you can see how current it is before you spend time on it.",
    ],
  },
  {
    id: "who-employs",
    q: "Who employs the accountant?",
    a: [
      "You do, directly. Most firms engage the accountant as an independent contractor who invoices them; some move a long-term hire onto an employer-of-record platform. How you classify and structure the relationship is a decision for your firm and your own advisor.",
      "AccountingTalent is not the employer, not a party to your agreement, and takes no part of what you pay the accountant.",
    ],
  },
  {
    id: "cost",
    q: "What does it cost?",
    a: [
      "Access to the database is $1,440 a year per firm, billed annually. Firms that reserve before launch keep a founding rate of $720 a year for as long as they stay subscribed. There is a one-time success fee of $2,400 when you hire someone, waived in full if the hire does not reach 90\u00A0days.",
      "There is no monthly plan, no per-seat charge, and no recurring percentage of anyone's salary. Reserving a place now costs nothing and does not commit you to subscribing.",
    ],
  },
  {
    id: "if-it-doesnt-work-out",
    q: "What if it doesn't work out?",
    a: [
      "The success fee is waived in full if the hire does not reach 90\u00A0days, and you can search the database for a replacement at no additional cost while your access is current.",
      "Because you engage the accountant directly, ending the arrangement is between you and them, on whatever notice your agreement sets. There is no agency contract to exit and no buyout clause.",
    ],
  },
  {
    id: "payment",
    q: "How do we pay someone in India?",
    a: [
      "The same way you would pay any overseas contractor. Most firms use an international transfer service or a contractor-payment platform that handles the currency conversion and keeps the paperwork in one place; some pay by wire directly to the accountant's bank.",
      "We give you a written guide to how firms do this in practice, including what documentation is worth keeping. What your firm is required to collect and report is a question for your own accountant, not for us.",
    ],
  },
  {
    id: "confidentiality",
    q: "What about client confidentiality and consent?",
    a: [
      "This is the question worth getting right before you hire, not after. If you disclose client tax return information to a preparer outside the United States, IRS\u00A0Section\u00A07216 sets out consent requirements, and consent generally has to be obtained in writing from the client before the disclosure. Firms doing audit or attest work also have PCAOB and AICPA confidentiality expectations to meet, and state boards may add their own.",
      "Your firm holds those obligations. We do not take them on and cannot discharge them for you. What we provide is a starting point: draft client-consent wording and a confidentiality and data-handling annexure you can put in front of your own counsel.",
      "Have your advisors review anything we give you before you rely on it. These are templates, not legal advice, and whether they fit your firm's circumstances is a judgment only your advisors can make.",
    ],
  },
  {
    id: "different-from-staffing",
    q: "How is this different from an offshore staffing firm?",
    a: [
      "A staffing firm rents you a seat and keeps a margin on it for as long as the person works for you, often $2,000 to $2,500 a month of which a fraction reaches the accountant. You do not choose the person, you rarely know what they are paid, and the relationship ends when the agency reassigns them.",
      "Here you search the database yourself, choose who to talk to, agree pay directly with the accountant, and employ or contract them yourself. We charge for access and once per hire. After that the relationship is yours, and nobody is taking a cut of it.",
    ],
  },
  {
    id: "when-open",
    q: "When does the database open?",
    a: [
      `Late\u00A02026, October to December. We are building and verifying the candidate pool first, and there is nobody to hire through us today.`,
      "Reserving founding access now locks your rate, puts you in before the database opens more widely, and gets you one short email a month on where the pool stands, including the months when there is nothing new to report.",
    ],
  },
  {
    id: "security-compliance",
    q: "What security measures should my firm put in place?",
    a: [
      "Treat a remote accountant the way careful firms treat any remote staff: a signed confidentiality agreement, least-privilege access to systems rather than a shared login, multi-factor authentication, sensible device and password policies, and a written plan for how access is revoked and data is returned or destroyed when an engagement ends.",
      "Employment, contractor classification, taxpayer-data consent, and professional obligations vary by firm and jurisdiction. We are not your legal, tax, or compliance advisor; obtain advice appropriate to your circumstances.",
    ],
  },
];
