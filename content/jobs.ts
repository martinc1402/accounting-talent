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
  sub: "Reserve your plan today and lock in a founding-member launch discount. Nothing is charged until the database opens.",
  currencyLabel: "Show prices in",
  includesHeading: "Every plan will include",
  includes: [
    "Every verified listing, with employer names shown",
    "All filters: country, remote from India, sponsorship signal, role, experience, date posted",
    "New listings added daily",
    "A direct link to apply on the employer's own site",
  ],
  free: {
    heading: "Free account",
    body: "A preview of a few recent listings, with employer names and evidence hidden.",
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
  sub: "Verified accounting roles, updated daily: remote jobs you can do from India, and jobs abroad that mention visa sponsorship, in the US, Canada, the UK, Australia and the Gulf.",
  primary: { label: "See example listings", href: "#listings" },
  secondary: { label: "View pricing", href: "#pricing" },
  /*
    Confident, and still true: memberships are open; the database is not yet.
    This line is what stops the present-tense sub above reading as "live now",
    so if it goes, the sub needs a tense check.
  */
  microcopy: "Founding memberships are open, with a launch discount.",
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
      title: "We find and verify jobs on company sites",
      body: "Every day we check employers' own career pages and the hiring systems they post on, like Greenhouse, Lever and Workday. A listing is verified when we've confirmed it's real and still live on the employer's own site. Not reposts, not agencies.",
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
  sub: "Search the way you actually job hunt: by where you can work, and whether they'll sponsor you.",
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
  sub: "Every listing answers the two questions that matter before you apply: can you apply from India, and will they sponsor you. Then it shows you why.",
  freeNote: "On a free account you'll see a few recent listings like the Riyadh one, with the employer name and evidence hidden.",
} as const;

export const trust = {
  heading: "What we do, and what we never do",
  do: {
    heading: "We do",
    items: [
      "Verify every listing is live on the employer's own careers page, and re-check it daily",
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
  /*
    The scam advice that used to live in the homepage FAQ, kept when the FAQs
    were removed: for this audience it is the most protective sentence on the
    page.
  */
  scam: `A real employer never charges you to apply, to be interviewed, or for a "visa processing" fee. We only take payment through our own checkout on accountingtalent.in, never by phone, WhatsApp or bank transfer, and no employer or agent will ever ask you for a fee on our behalf. If someone does, don't pay, and tell us at ${CONTACT_EMAIL}.`,
} as const;

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
    "Nothing is charged today.",
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
