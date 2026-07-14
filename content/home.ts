import { LAUNCH_WORKER, LAUNCH_WORKER_SHORT } from "./site";

/*
  The headline's line breaks are set by hand rather than left to the browser, so
  it is stored as its lines. Left to wrap on its own it stranded "firms." from
  "US accounting" and cut "Keep" off from its clause.

  No non-breaking spaces here, unlike the rest of the copy: the breaks are
  explicit, so there is nothing for an   to protect against. Below md the <br>
  elements are display:none and the headline wraps naturally, which is why each
  line is a plain string with ordinary spaces.
*/
const heroH1Lines = [
  "Work directly for",
  "US accounting firms.",
  "Keep 100% of your salary.",
] as const;

export const hero = {
  h1Lines: heroH1Lines,
  // The same words as one string, derived rather than duplicated, so the two
  // forms cannot drift apart.
  h1: heroH1Lines.join(" "),
  sub: "US\u00A0CPA firms find your profile and hire you themselves. No agency, no commission, no cut of your salary, ever.",
  cta: "Apply free, takes 3\u00A0minutes",
  microcopy: `Free for accounting professionals. Always. US\u00A0firms begin hiring in ${LAUNCH_WORKER}.`,
  /*
    A sample of the actual product, not a photograph of someone who could be
    using it. The page is arguing that a US firm will see your profile and hire
    you, so showing the profile is the most literal way to make that concrete.
  */
  sampleProfile: {
    name: "Priya S.",
    credential: "CA\u00A0Inter · 4\u00A0yrs experience",
    verified: "Verified",
    skills: ["QuickBooks Online", "Drake", "Form 1040 · 1120\u2011S"],
    expectation: "Expected: $900\u20111,200/mo · Full\u2011time",
    caption: "A sample verified profile. This is what US\u00A0firms will see.",
  },
  image: {
    src: "/images/hero-accountant.webp",
    alt: "An accountant working at a home office desk in India, reviewing a spreadsheet on a monitor.",
  },
} as const;

/*
  The software the audience already works in. Every one of these is named
  elsewhere in the copy, so the strip is a restatement, not a new claim.

  Deliberately typographic rather than a logo wall: four of the six have no mark
  in any open icon library, and using Intuit / Wolters Kluwer trademarks to
  illustrate what our candidates can do (rather than an integration we have
  built) would imply a partnership that does not exist. Wrong move for a brand
  whose entire pitch is that it does not overstate things.
*/
export const software = {
  intro: "The software you already know",
  tools: [
    "QuickBooks",
    "Xero",
    "Drake",
    "Lacerte",
    "CCH",
    "UltraTax",
  ],
  note: "Software names are the property of their owners. We are not affiliated with any of them.",
} as const;

/*
  What a US firm sees when it searches the database. The hero shows one profile;
  this shows the search it appears in, which is the literal answer to "how does a
  firm find me". Sample data, labelled as such, with realistic Indian names.
*/
export const firmView = {
  heading: "What US\u00A0firms search",
  filters: ["QuickBooks", "Drake", "Form 1040"],
  results: [
    { name: "Priya S.", credential: "CA\u00A0Inter · 4\u00A0yrs" },
    { name: "Rahul M.", credential: "CA · 6\u00A0yrs" },
    { name: "Anjali K.", credential: "M.Com · 3\u00A0yrs" },
  ],
  verified: "Verified",
  caption: "Sample results. Verified profiles rank first.",
} as const;

export const photoBand = {
  src: "/images/us-firm.jpg",
  alt: "An accounting firm partner reviewing documents at a desk in a small US\u00A0office.",
} as const;

export const math = {
  h2: "Why direct hiring changes everything",
  leadIn:
    "Whether you're at an offshore firm or working domestically, someone between you and the client keeps most of what your work is worth.",
  /*
    Both bars are drawn on one dollar scale: 100% of the track is $2,000, so
    every width below is (amount / 2000). The comparison only works because the
    two rows share that scale, which is the whole reason this is a bar chart and
    not two cards with numbers in them.
  */
  comparison: {
    agency: {
      // Named in the same words the lead-in already uses ("offshore firm"), so
      // the reader does not have to work out that "agency" and "offshore firm"
      // are the same thing.
      label: "Through an offshore firm or agency",
      // "US firm pays", not "firm pays": there are two firms in this row now,
      // and the one doing the paying is the American one.
      firmPays: "US\u00A0firm pays $2,000/mo",
      you: {
        amount: "$600",
        /*
          The rupee figure is the point of this line: $600/mo means nothing to
          someone who is paid in rupees.

          Converted at ~95.7 and rounded DOWN. The true values are ~₹57,400 and
          ~₹1,14,800, but this brand does not overstate what someone will earn,
          so under is the safe direction. The exact 2x still holds, which is the
          whole argument of the section.
        */
        label: "you receive · about ₹55,000/mo",
        pct: 30,
      },
      keeps: {
        amount: "middleman keeps $1,400",
        sub: "office · sales team · margin",
        pct: 70,
      },
    },
    direct: {
      label: "Hired directly",
      firmPays: "US\u00A0firm pays $1,200/mo",
      you: {
        amount: "$1,200, all yours",
        label: "you receive · about ₹1.1\u00A0lakh/mo",
        pct: 60,
      },
      /*
        The 40% of track the direct bar does not use. It was empty space making
        the point implicitly; now it names what the US firm gets out of this,
        which is the missing half of "everyone wins except the middleman".
      */
      saves: { amount: "US\u00A0firm saves $800/mo", pct: 40 },
    },
    // One caption, not two. The standalone "100% = $2,000 per month" scale note
    // was a second line of fine print saying something this one can absorb.
    caption:
      "Illustrative figures based on typical offshore staffing rates · bars drawn to scale ($2,000 = full width) · ₹ amounts approximate.",
  },
  // The $800 itself now lives in the ghost segment of the direct bar, so this
  // line no longer repeats it. It states the shape of the trade, not the sum.
  delta: "Twice the pay for you. A smaller bill for the firm.",
} as const;

export const howItWorks = {
  h2: "How it works",
  sub: "Three steps, and the first one takes three minutes.",
  steps: [
    {
      title: "Apply",
      body: "Tell us your qualifications, software skills, US\u00A0tax\u00A0experience, and salary expectations. Structured questions, no essay, no resume upload.",
    },
    {
      title: "Get verified",
      body: "Shortlisted applicants complete a short English writing prompt and a 10\u2011question US\u00A0accounting quiz by email. Pass it and your profile earns a Verified badge, the thing US\u00A0firms filter for first.",
    },
    {
      title: "Get hired, directly",
      body: `When US\u00A0firms join in ${LAUNCH_WORKER_SHORT}, they search the database, contact you directly, interview you, and hire you. You negotiate your own salary. They pay you, not us.`,
    },
  ],
} as const;

export const whoWeWant = {
  h2: "Who we're looking for",
  sub: "We are building India's best database of US\u2011ready accounting talent. You are a fit if you are any of the following.",
  // One card is navy. It carries a badge saying why, so the colour means
  // something instead of decorating.
  priorityBadge: "Priority profile",
  profiles: [
    {
      title: "Chartered Accountants, CA\u00A0Inter and Finalists",
      body: "Including those with zero US\u00A0experience. Your fundamentals are the hard part. US\u00A0tax\u00A0software is learnable.",
      priority: false,
    },
    {
      title: "Offshore firm staff on US\u00A0clients",
      body: "QuickBooks, Drake, Lacerte, CCH, UltraTax. If you want to stop giving away most of your billing rate, you are exactly who we are looking for.",
      priority: true,
    },
    {
      title: "Bookkeepers and staff\u00A0accountants",
      body: "With strong English and one or more years of experience.",
      priority: false,
    },
    {
      title: "Tax preparers",
      body: "Anyone who has prepared US\u00A0returns: 1040s, 1120\u2011S, 1065s.",
      priority: false,
    },
    {
      title: "CMAs, ACCAs and M.Coms",
      body: "With professional accounting experience.",
      priority: false,
    },
  ],
  rates: {
    intro: "What US\u00A0firms typically pay direct hires",
    bands: [
      { role: "Bookkeepers", range: "$500 to $800" },
      { role: "Experienced accountants and tax\u00A0preparers", range: "$800 to $1,500" },
      { role: "Senior and reviewer roles", range: "$1,500 to $2,500+" },
    ],
    note: "Per month, full-time, long-term positions. Not gig work. Figures are typical, not guaranteed.",
  },
} as const;

export const honest = {
  h2: "Where we are right now",
  lede: "We'll be straight with you, because you've seen enough websites that aren't.",
  body: [
    `AccountingTalent.in is new. We are building the talent database first, and that is what this application is. We open it to US\u00A0accounting firms in ${LAUNCH_WORKER}.`,
  ],
  // Pulled out of `body` and given its own field because it is the sentence the
  // whole brand rests on. Same words, its own weight on the page.
  admission: "There is no job waiting for you today.",
  promiseIntro: "What you get by applying now:",
  promises: [
    {
      title: "Founding-member placement",
      body: "Verified early profiles appear first when firms start searching.",
    },
    {
      title: "A free, permanent profile",
      body: "We will never charge accountants. Our revenue comes from firms paying for database access, the same model that has worked for over 15 years in the Philippines (OnlineJobs.ph), where more than 500,000 employers hire this way.",
    },
    {
      title: "No exclusivity, no lock-in",
      body: "Your profile, your negotiation, your job. Delete anytime.",
    },
  ],
} as const;

export const finalCta = {
  h2: `The database opens to US\u00A0firms in ${LAUNCH_WORKER_SHORT}. Be in it on day one.`,
  // Same label as the hero. One intent, one label, everywhere on the page.
  cta: "Apply free, takes 3\u00A0minutes",
  referral:
    "Know another accountant working US\u00A0hours for agency pay? Refer them and you will both get featured placement at launch.",
  referralLinkLabel: "Refer them",
} as const;
