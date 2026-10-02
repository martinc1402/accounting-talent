import type { FaqItem } from "@/content/faq";
import { CONTACT_EMAIL } from "@/content/site";
import type { JobListing } from "@/lib/jobs/types";

/*
  The job-seeker homepage ("/") and /get-access, top to bottom.

  THE PRODUCT IS NOT BUILT YET, and every line here is written so it never reads
  as if it were. There is no jobs table, no scraper and no checkout in this repo.
  The page sells a founding membership: reserve a plan now, pay nothing, get a
  launch discount and an email when the database opens. So:

  - Process, filters and listings are described in the future tense or labelled
    with the site's existing "Launching soon" status (StatusLabel, planned).
  - Every listing card is an example we wrote, labelled "Example listing" on its
    face, with no real employer named.
  - No counts, ratings, testimonials or success stories anywhere. Where social
    proof would go there is a TODO in the component, not a number.

  Honesty is the brand. If a line here starts claiming something the code cannot
  back, it is wrong even if it converts.
*/

/* -------------------------------------------------------------------------- */
/* Shared option lists (form, server validation, filters preview)              */
/* -------------------------------------------------------------------------- */

/*
  Read by the /get-access form AND re-checked in reserveMembership (app/actions.ts),
  so a hand-crafted POST cannot write an arbitrary string into a column the
  launch list will be segmented by. Free-text columns, validated against these
  lists, same convention as employer_leads.
*/
export const targetOptions = [
  "Remote from India",
  "Gulf",
  "UK",
  "USA",
  "Canada",
  "Australia",
] as const;

export const roleTypeOptions = [
  "Audit",
  "Tax",
  "AP / AR",
  "FP&A",
  "Bookkeeping",
  "Other / not sure yet",
] as const;

export const experienceOptions = [
  "Student, CA Inter or finalist",
  "Newly qualified (under 1 year)",
  "1 to 3 years",
  "3 to 6 years",
  "6 to 10 years",
  "10+ years",
] as const;

/* -------------------------------------------------------------------------- */
/* Pricing                                                                      */
/* -------------------------------------------------------------------------- */

export type Currency = "INR" | "USD";
export type MembershipPlanId = "weekly" | "monthly" | "quarterly" | "yearly";

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  months: number;
  unit: string;
  /** Whole currency units. A plan missing a currency is not sold in it. */
  price: Partial<Record<Currency, number>>;
  note: string;
  flag?: string;
};

/*
  Founding prices. INR for India, USD for everyone else. There is no quarterly
  plan in USD, so the USD grid is three cards and a quarterly reservation made
  in INR has no USD equivalent (the form clears the choice on a currency switch).

  Yearly carries the "Best value" flag in both currencies because it is the
  cheapest per month in both (about ₹250 and about $4).
*/
export const membershipPlans: readonly MembershipPlan[] = [
  {
    id: "weekly",
    name: "Weekly",
    months: 0.25,
    unit: "per week",
    price: { INR: 199, USD: 7 },
    note: "For a short, focused search.",
  },
  {
    id: "monthly",
    name: "Monthly",
    months: 1,
    unit: "per month",
    price: { INR: 599, USD: 20 },
    note: "The usual length of an active search.",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    months: 3,
    unit: "per 3 months",
    price: { INR: 1499 },
    note: "Time to apply, interview and wait on offers.",
  },
  {
    id: "yearly",
    name: "Yearly",
    months: 12,
    unit: "per year",
    price: { INR: 2999, USD: 50 },
    note: "For a planned move abroad.",
    flag: "Best value",
  },
];

export const pricing = {
  heading: "Founding membership",
  sub: "Payments aren't live yet. Reserve the plan you'd pick, pay nothing today, and get a founding-member launch discount when the database opens.",
  currencyLabel: "Show prices in",
  includesHeading: "Every plan will include",
  includes: [
    "Search every listing, with employer names shown",
    "All filters: country, remote from India, sponsorship signal, role, experience, date posted",
    "New listings added daily",
    "A direct link to apply on the employer's own site",
  ],
  free: {
    heading: "Free account",
    body: "Create a profile and preview a few recent listings, with employer names hidden.",
  },
  payment: {
    INR: "When checkout opens you'll pay by UPI or card, through our own checkout on accountingtalent.in. Never by phone, WhatsApp or bank transfer.",
    USD: "When checkout opens you'll pay by card, through our own checkout on accountingtalent.in. Never by phone, WhatsApp or bank transfer.",
  },
  ctaPrefix: "Reserve",
  founding: {
    heading: "Joined us before?",
    body: "If you signed up when we said AccountingTalent would always be free for accountants, that still holds for you. Founding members keep free access. You don't need to do anything.",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Homepage                                                                     */
/* -------------------------------------------------------------------------- */

export const hero = {
  eyebrow: "For Indian CAs, CMAs, ACCAs and accountants",
  h1: "Remote and overseas accounting jobs, straight from employers' career pages.",
  sub: "We're building a daily-updated database of accounting roles you can do from India, and roles abroad that mention visa sponsorship, in the US, Canada, the UK, Australia and the Gulf.",
  primary: { label: "See example listings", href: "#listings" },
  secondary: { label: "View pricing", href: "#pricing" },
  microcopy: "The database isn't open yet. Founding members pay nothing now, get a launch discount, and hear from us first.",
  sampleCaption: "An example we wrote to show the format. Not a real job.",
} as const;

export const problem = {
  heading: "Finding a job abroad shouldn't mean paying a middleman or guessing.",
  items: [
    {
      title: "Crowded portals",
      body: "By the time a role is reposted on the big job sites, it can already have hundreds of applicants.",
    },
    {
      title: "Agency middlemen",
      body: "Some agencies sit between you and the employer and take a cut of your salary, sometimes for months.",
    },
    {
      title: "Sponsorship is hard to find",
      body: "Job boards don't let you filter for roles that mention visa sponsorship, or remote roles that are really open to India.",
    },
    {
      title: "Fake jobs and pay-to-apply scams",
      body: "\"Processing fees\", \"visa fees\", interviews only on WhatsApp. A real employer never charges you to apply.",
    },
  ],
} as const;

export const howItWorks = {
  heading: "How it will work",
  sub: "Four steps, and the last one happens on the employer's site, not ours.",
  steps: [
    {
      title: "We find jobs on company sites",
      body: "Every day we check employers' own career pages and the hiring systems they post on, like Greenhouse, Lever and Workday. Not reposts, not agencies.",
    },
    {
      title: "We tag each listing",
      body: "Country, whether it's remote and open to people in India, and whether the listing mentions visa sponsorship.",
    },
    {
      title: "You filter",
      body: "Narrow by country, remote-from-India, sponsorship signal, role type, experience and how recently it was posted.",
    },
    {
      title: "You apply directly to the employer",
      body: "Every listing links to the original on the employer's site. You apply there. We never see your application and never take a cut.",
    },
  ],
} as const;

export const filters = {
  heading: "Filters other job boards don't give you",
  sub: "A preview of the search. It isn't live yet.",
  groups: [
    {
      label: "Country",
      options: ["USA", "Canada", "UK", "Australia", "UAE", "Saudi Arabia", "Qatar"],
      selected: ["UAE", "Qatar"],
    },
    {
      label: "Remote from India",
      options: ["Remote, open to India", "On-site abroad"],
      selected: ["Remote, open to India"],
    },
    {
      label: "Sponsorship signal",
      options: ["Mentions sponsorship", "Not mentioned", "Says no sponsorship"],
      selected: ["Mentions sponsorship"],
    },
    {
      label: "Role type",
      options: ["Audit", "Tax", "AP / AR", "FP&A", "Bookkeeping"],
      selected: ["Audit"],
    },
    {
      label: "Experience",
      options: ["Student / finalist", "0 to 2 years", "3 to 6 years", "6+ years"],
      selected: ["3 to 6 years"],
    },
    {
      label: "Posted",
      options: ["Last 24 hours", "Last 3 days", "Last week"],
      selected: ["Last 3 days"],
    },
  ],
  footnote: "\"Mentions sponsorship\" means the listing's own text says so. It's a signal, not a promise: the employer decides.",
} as const;

/*
  The example listings. EVERY ONE IS FICTIONAL: the employers, quotes, salaries
  and dates were written to show what a real card will carry, and each card says
  "Example listing" on its face. No applyUrl, so no card links anywhere external.

  Each one demonstrates a different state the scraper will produce:
    1. Dubai: sponsorship stated, full view.
    2. Remote US tax: no visa question; the catch is evening hours in IST.
    3. UK audit senior: licensed sponsor but the listing is silent, so amber
       "may sponsor"; salary checked against the SOC 2421 going rate.
    4. Riyadh: the locked free preview (employer and evidence hidden), with
       Saudization making sponsorship "unclear".
    5. Abu Dhabi: "UAE residents only", so not eligible from India.

  The UK going rate (£49,200 a year for SOC 2421, Chartered and certified
  accountants, from 8 April 2026) is a real figure as reported by secondary
  sources; confirm it against gov.uk Appendix Skilled Occupations before a real
  listing relies on it, and re-check whenever the Home Office updates rates.

  INR lines use round illustrative rates and say "≈". The scraper should use a
  dated rate and say which.

  Times are relative to EXAMPLE_NOW, not the clock: this page is static, and a
  build-time clock would claim "checked 3h ago" for weeks.
*/
export const EXAMPLE_NOW = "2026-10-03T09:00:00+05:30";

export const exampleJobs: readonly JobListing[] = [
  {
    id: "example-dubai-senior-accountant",
    title: "Senior Accountant, Group Reporting",
    employer: { name: "Dunewell Logistics", direct: true },
    destination: { label: "Dubai, UAE", code: "DXB" },
    location: "Jebel Ali, Dubai",
    workMode: "On-site",
    applyFromIndia: {
      tone: "good",
      value: "Open to India",
      reason: "Listing invites applicants from outside the UAE.",
    },
    second: {
      kind: "visa-sponsorship",
      check: {
        tone: "good",
        value: "Sponsorship stated",
        reason: "Employment visa and Emirates ID provided by the employer.",
      },
    },
    checkedAt: "2026-10-03T06:00:00+05:30",
    firstSeenAt: "2026-10-01T10:00:00+05:30",
    evidence: {
      quote: "Employment visa, family medical insurance and an annual return flight are provided.",
      source: "Dunewell careers page (Workday)",
    },
    package: ["Employment visa", "Medical insurance", "Annual flight"],
    requirements: [
      { label: "IFRS consolidation", kind: "skill" },
      { label: "5+ yrs, GCC or Big 4", kind: "experience" },
      { label: "CA or ACCA", kind: "qualification" },
      { label: "Oracle NetSuite", kind: "skill" },
    ],
    salary: {
      display: "AED 16,000–19,000 a month",
      source: "employer-stated",
      basic: "Basic AED 10,500, plus housing and transport",
      inr: "≈ ₹3.7–4.4 lakh a month",
    },
    access: "full",
    example: true,
  },
  {
    id: "example-remote-us-tax",
    title: "Tax Associate, US Individual and S-Corp Returns",
    employer: { name: "Brightledger CPA", direct: true },
    destination: { label: "Remote · USA", code: "US" },
    location: "Remote, US firm",
    workMode: "Remote",
    applyFromIndia: {
      tone: "good",
      value: "Open to India",
      reason: "Listing says remote from the US or India.",
    },
    second: {
      kind: "working-hours",
      check: {
        tone: "warn",
        value: "Evenings IST",
        reason: "Needs 4 hours' overlap with US Eastern, about 7pm–11pm IST.",
      },
    },
    checkedAt: "2026-10-03T08:00:00+05:30",
    firstSeenAt: "2026-10-02T21:00:00+05:30",
    evidence: {
      quote: "Fully remote. Open to candidates in the US or India; must overlap at least four hours with Eastern Time.",
      source: "Brightledger careers page (Greenhouse)",
    },
    requirements: [
      { label: "3+ US busy seasons", kind: "experience" },
      { label: "CA, CPA or EA", kind: "qualification" },
      { label: "1040 and 1120-S", kind: "skill" },
    ],
    salary: {
      display: "US$22–28 an hour, contractor",
      source: "employer-stated",
      inr: "≈ ₹1,850–2,350 an hour",
    },
    access: "full",
    example: true,
  },
  {
    id: "example-london-audit-senior",
    title: "Audit Senior, Financial Services",
    employer: { name: "Halden & Wren LLP", direct: true },
    destination: { label: "London, UK", code: "LON" },
    location: "London, UK",
    workMode: "Hybrid",
    applyFromIndia: {
      tone: "neutral",
      value: "Not restricted",
      reason: "Listing doesn't limit where applicants live.",
    },
    second: {
      kind: "visa-sponsorship",
      check: {
        tone: "warn",
        value: "May sponsor",
        reason: "A licensed sponsor, but this listing doesn't mention sponsorship.",
      },
    },
    checkedAt: "2026-10-03T04:00:00+05:30",
    firstSeenAt: "2026-09-29T12:00:00+05:30",
    evidence: {
      quote: "Halden & Wren LLP is listed on the register of licensed sponsors (Skilled Worker). The job advert itself is silent on sponsorship.",
      source: "Home Office register of licensed sponsors",
    },
    package: ["Study support", "Hybrid, 3 days in office"],
    requirements: [
      { label: "ACA or ACCA", kind: "qualification" },
      { label: "FS audit, UK or IFRS", kind: "skill" },
      { label: "2+ yrs as senior", kind: "experience" },
    ],
    salary: {
      display: "£50,000–56,000 a year",
      source: "employer-stated",
      visaThreshold: {
        tone: "good",
        text: "Above the £49,200 Skilled Worker going rate for SOC 2421 (from 8 Apr 2026).",
      },
      inr: "≈ ₹56–63 lakh a year",
    },
    access: "full",
    example: true,
  },
  {
    id: "example-riyadh-reporting-manager",
    title: "Financial Reporting Manager",
    employer: { name: "Sandmere Industrial Co.", direct: true },
    destination: { label: "Riyadh, Saudi Arabia", code: "RUH" },
    location: "Riyadh, Saudi Arabia",
    workMode: "On-site",
    applyFromIndia: {
      tone: "good",
      value: "Open to India",
      reason: "Listing accepts overseas applicants.",
    },
    second: {
      kind: "visa-sponsorship",
      check: {
        tone: "warn",
        value: "Unclear",
        reason: "Saudization quotas may limit this role for non-Saudis.",
      },
    },
    checkedAt: "2026-10-03T07:00:00+05:30",
    firstSeenAt: "2026-10-02T09:00:00+05:30",
    evidence: {
      quote: "Hidden on the free preview.",
      source: "Hidden on the free preview.",
    },
    requirements: [
      { label: "CA or CPA", kind: "qualification" },
      { label: "8+ yrs", kind: "experience" },
      { label: "IFRS consolidation", kind: "skill" },
    ],
    salary: { display: null, source: "not-disclosed" },
    access: "locked",
    example: true,
  },
  {
    id: "example-abu-dhabi-ar",
    title: "Accounts Receivable Specialist",
    employer: { name: "Corniche Ledger Services", direct: true },
    destination: { label: "Abu Dhabi, UAE", code: "AUH" },
    location: "Abu Dhabi, UAE",
    workMode: "On-site",
    applyFromIndia: {
      tone: "bad",
      value: "Not eligible",
      reason: "Listing says UAE residents only.",
    },
    second: {
      kind: "visa-sponsorship",
      check: {
        tone: "neutral",
        value: "Not offered",
        reason: "Residents-only roles don't sponsor a visa.",
      },
    },
    checkedAt: "2026-10-03T05:00:00+05:30",
    firstSeenAt: "2026-09-30T15:00:00+05:30",
    evidence: {
      quote: "Applicants must currently reside in the UAE with a valid residence visa.",
      source: "Corniche Ledger careers page (Lever)",
    },
    requirements: [
      { label: "B.Com or M.Com", kind: "qualification" },
      { label: "2+ yrs AR", kind: "experience" },
      { label: "SAP FI", kind: "skill" },
    ],
    salary: {
      display: "AED 9,000–11,000 a month",
      source: "employer-stated",
      inr: "≈ ₹2.1–2.6 lakh a month",
    },
    access: "ineligible",
    example: true,
  },
];

export const listings = {
  heading: "What a listing will look like",
  sub: "These are examples we wrote to show the format. The jobs, employers and quotes are not real.",
  freeNote: "On a free account you'll see a few recent listings like the Riyadh one, with the employer name and evidence hidden.",
} as const;

export const trust = {
  heading: "What we do, and what we never do",
  do: {
    heading: "We do",
    items: [
      "Link to the original listing on the employer's own site",
      "Tag sponsorship and remote signals from the listing's own wording",
      "Remove listings we find are closed or fake, and act on your reports",
      "Take payment only through our own checkout on accountingtalent.in",
    ],
  },
  dont: {
    heading: "We never",
    items: [
      "Take a cut of your salary",
      "Sell ranking, or let anyone pay to be shown first",
      "Invent listings",
      "Guarantee a job, an interview or a visa",
      "Ask for payment by phone, WhatsApp or bank transfer",
    ],
  },
  footnote: "Employers decide whether to sponsor a visa, and immigration rules change. A sponsorship tag means the listing mentioned it when we found it. Always check the employer's listing and official government sources before you rely on it.",
} as const;

export const faqHeading = "Questions";

/*
  ids are an interface, not copy: they drive the faq_opened analytics event
  (see content/faq.ts). Prefixed "jobs-" so they cannot collide with the
  accountant or employer FAQ ids in the dashboard.
*/
export const jobsFaq: readonly FaqItem[] = [
  {
    id: "jobs-what-jobs",
    q: "What jobs will be included?",
    a: [
      "Accounting and finance roles posted on employers' own career pages and hiring systems: audit, tax, AP/AR, FP&A, bookkeeping and related work. Two kinds: remote roles you can do from India, and roles abroad where the listing mentions visa sponsorship.",
      "We don't include agency reposts, and we don't write listings ourselves.",
    ],
  },
  {
    id: "jobs-sponsorship",
    q: "How do you know a job offers visa sponsorship?",
    a: [
      "We read the listing's own text. If it says the employer sponsors visas or provides an employment visa, we tag it \"Mentions sponsorship\". If it says it doesn't, we tag that too.",
      "It's a signal, not a guarantee. Listings can be vague or out of date, the employer makes the final decision, and immigration rules change. Always confirm with the employer and official government sources.",
    ],
  },
  {
    id: "jobs-remote-india",
    q: "How do you know a remote job is open to India?",
    a: [
      "Many \"remote\" jobs are remote within one country only. We tag a role \"Remote, open to India\" only when the listing allows applicants in India or worldwide. If it's unclear, we don't tag it.",
    ],
  },
  {
    id: "jobs-countries",
    q: "Which countries will you cover?",
    a: [
      "Remote roles open to India, plus roles in the USA, Canada, the UK, Australia and the Gulf (UAE, Saudi Arabia, Qatar, Oman, Kuwait and Bahrain).",
    ],
  },
  {
    id: "jobs-refresh",
    q: "How often will listings be updated?",
    a: [
      "Daily. We check employers' sites every day, add new roles and remove ones that have closed, so you can apply early rather than after a role has been reposted everywhere.",
    ],
  },
  {
    id: "jobs-refunds",
    q: "Can I cancel or get a refund?",
    a: [
      "Nothing is charged yet, so there's nothing to refund. Reserving a plan doesn't commit you to anything.",
      "Before checkout opens we'll publish our cancellation and refund policy on this site, and you'll see it before you pay.",
    ],
  },
  {
    id: "jobs-not-agency",
    q: "Are you a recruitment agency?",
    a: [
      "No. We don't place candidates, we don't represent you to employers and we never take a cut of your salary. We find listings and link you to them. You apply directly to the employer, and any offer is between you and them.",
    ],
  },
  {
    id: "jobs-founding",
    q: "I joined when it was free. Do I have to pay now?",
    a: [
      "No. If you signed up under our earlier promise that AccountingTalent would always be free for accountants, you keep free access as a founding member. You don't need to do anything.",
    ],
  },
  {
    id: "jobs-scams",
    q: "How do I spot a job scam?",
    a: [
      "A real employer never asks you to pay to apply, to be interviewed, or for a \"visa processing\" or \"training\" fee. Be careful with interviews held only on WhatsApp or Telegram, offers made without any interview, and email addresses that don't match the company's website.",
      `We only take payment through our own checkout on accountingtalent.in, never by phone, WhatsApp or bank transfer, and no employer or agent will ever ask you for a fee on our behalf. If someone claiming to be us asks you for money any other way, don't pay, and tell us at ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: "jobs-reserve",
    q: "What does reserving a founding membership mean?",
    a: [
      "You tell us who you are, where you want to work and which plan you'd pick. Nothing is charged. When the database opens we'll email you first, with your founding-member launch discount, and you decide then whether to pay.",
    ],
  },
];

export const finalCta = {
  heading: "Be first in when the database opens.",
  sub: "Reserve a founding membership. Nothing is charged today, and founding members get a launch discount.",
  primary: { label: "Reserve founding membership", href: "/get-access" },
  secondary: { label: "See example listings", href: "#listings" },
} as const;

/* -------------------------------------------------------------------------- */
/* /get-access                                                                  */
/* -------------------------------------------------------------------------- */

export const getAccess = {
  eyebrow: "Founding membership",
  h1: "Reserve a founding membership",
  points: [
    "Payments aren't live yet. Nothing is charged today.",
    "Founding members get a launch discount.",
    "We'll email you when the database opens, and you decide then.",
  ],
  plansHeading: "Pick the plan you'd choose",
  formHeading: "Your details",
  formSub: "Takes about a minute. We use this to tell you when we open and to prioritise which countries and roles we cover first.",
  fields: {
    full_name: { label: "Full name", placeholder: "Your name" },
    email: {
      label: "Email",
      placeholder: "you@example.com",
      help: "We'll email you when the database opens.",
    },
    whatsapp: {
      label: "WhatsApp number (optional)",
      placeholder: "+91 98765 43210",
      help: "Only for launch updates. We will never ask you for payment on WhatsApp.",
    },
    targets: {
      label: "Where do you want to work?",
      help: "Pick all that apply.",
    },
    role_type: { label: "Main role type" },
    experience: { label: "Years of experience" },
    plan: {
      label: "Which plan would you pick?",
      notSure: "Not sure yet",
    },
  },
  submit: "Reserve my place",
  submitting: "Reserving...",
  reassurance: "No payment, no card. You can ask us to delete your details at any time.",
  requiredNote: "* Required",
  genericError: "Something went wrong. Please try again, or email us.",
  success: {
    heading: "You're on the founding list",
    body: [
      "Nothing has been charged. When the database opens we'll email you first, with your founding-member launch discount.",
      "We'll only ever take payment through our own checkout on accountingtalent.in. Never by phone, WhatsApp or bank transfer.",
    ],
  },
} as const;
