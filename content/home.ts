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
    A sample of the actual product. The page is arguing that a US firm will see
    your profile and hire you, so showing the profile is the most literal way to
    make that concrete.

    Every line below is a field the application form actually asks for: role,
    qualification, experience, city, working hours, availability, start date,
    software, tax forms, salary. That is what keeps this honest. It is not a
    designer's impression of a product, it is the product.

    It is labelled a sample in the caption, and it needs to stay labelled. The
    card carries a real face and a real-looking credential set, so the one thing
    standing between it and a claim we cannot make is the word "sample".
  */
  sampleProfile: {
    // The name follows the face. This headshot is of a man, so the name is a
    // man's: a mismatched name over a photograph is the single most obvious
    // "this is fabricated" signal you could put on a card whose whole job is to
    // look credible. (The detail card further down the page is a different
    // person, Priya, with her own photograph. Same rule, applied twice.)
    name: "Arjun S.",
    photo: {
      src: "/images/headshot-1.jpg",
      alt: "The accountant in the sample profile.",
    },
    // The two things a firm cannot check for itself, so we check them for it.
    verified: "Verified · English + US\u00A0tax assessment",
    role: "Tax\u00A0preparer · CA\u00A0Inter · 4\u00A0yrs experience",
    location: "Ahmedabad, India · can work US\u2011overlap hours",
    availability: "Full\u2011time · available within 30\u00A0days",
    softwareLabel: "Software",
    software: ["QuickBooks Online", "Drake", "Lacerte"],
    returnsLabel: "US\u00A0returns prepared",
    returns: ["Form 1040", "1120\u2011S", "1065"],
    salaryLabel: "Expected salary",
    // The suffix is a separate field so it can render smaller and muted rather
    // than being baked into the figure. It is not decoration: "$900-1,200" on
    // its own does not say whether that is a month or a year, and for a reader
    // working out whether this doubles their income, that is the whole card.
    salary: "$900\u20111,200",
    salarySuffix: "/mo",
    caption: "A sample verified profile. This is what US\u00A0firms will see.",
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
  intro: "Work in the tools you already know",
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
  // The same shape as the hero card, at search-result scale: the row and the
  // card describe one object, so a reader who saw the hero recognises it here.
  results: [
    {
      name: "Arjun S.",
      credential: "CA\u00A0Inter · 4\u00A0yrs",
      role: "Tax\u00A0preparer · Ahmedabad",
    },
    {
      name: "Rahul M.",
      credential: "CA · 6\u00A0yrs",
      role: "Senior accountant · Pune",
    },
    {
      name: "Anjali K.",
      credential: "M.Com · 3\u00A0yrs",
      role: "Bookkeeper · Kochi",
    },
  ],
  verified: "Verified",
  caption: "Sample results. Verified profiles rank first.",
} as const;

/*
  A second profile, opened.

  This used to be the hero's profile at detail scale, deriving its name and photo
  from hero.sampleProfile so the two could not drift apart. It is now a different
  person: Arjun stays in the hero and in the search results, and Priya is the
  record a firm actually opens. Two faces, a man and a woman, on a page recruiting
  both.

  Nothing reads as broken by that, because the heading was never about him: it
  asks what a firm sees when it opens YOUR profile. So her fields are her own
  below, not references to his.

  This card is a sample, and unlike the hero card it is not only a sample of
  fields the form collects. The application asks 21 questions and does not ask for
  employment history, university, languages, or per-form volumes, all of which are
  below. That is a deliberate, recorded decision: the card is the target the form
  grows toward. Which is exactly why the heading and the caption both say sample,
  and why neither is optional. Take them off and the page is claiming a candidate
  it does not have.
*/
export const profileDetail = {
  heading: "What a US\u00A0firm sees when it opens your profile",
  lede: "Not a resume in an inbox. A structured, verified record, and the firm reads it without anyone standing in between.",

  name: "Priya M.",
  photo: {
    src: "/images/headshot-2.jpg",
    alt: "The accountant in the sample detail profile.",
  },

  /*
    Split in two on purpose. The green means Verified, it does not mean
    "everything about verification": three lines of solid #22c55e on a phone
    shouts, and the exam detail is a fact, not a state.

    The date follows the join date. The mockup had it verified in March and
    joined in July, which would have it verified before it existed.
  */
  verified: {
    state: "Verified 26\u00A0Jun 2026",
    detail: "passed the English writing assessment and US\u00A0tax & accounting exam (8/10)",
  },

  rows: {
    role: "Bookkeeper · 5\u00A0yrs experience · 3\u00A0yrs on US\u00A0clients",
    education: "CMA (India) · B.Com, MG\u00A0University",
    location: "Kochi, India · English (assessed), Malayalam, Hindi",
  },

  /*
    The most valuable thing on the card, and the only part a middleman cannot
    fake for you: her own English, unedited, answering the Stage 2 writing
    prompt. A firm's real fear is not that the accounting is wrong, it is that it
    cannot tell whether the person can explain what they did. So the card lets
    her explain what she did.

    Set in the sans face, not the display serif. The serif is the brand's voice.
    The whole worth of this paragraph is that it is HER voice, so the brand keeps
    out of it.

    One typography edit to her verbatim answer: the dash after "their books"
    became a colon, so it matches the dash-free convention the rest of the copy
    (and Arjun's hero quote) already hold to.
  */
  quote: {
    label: "In their own words",
    text: "“A new client came to us fourteen months behind on their books: two QuickBooks files, a personal card mixed into business spending, and an opening balance that was off by $6,900. I rebuilt the chart of accounts, brought in the bank and card feeds month by month, and tagged every owner expense for their CPA to review. It took about six weeks working a few hours a day. When we finished, their CPA filed the overdue return from clean books, and the client moved to a normal monthly close with me.”",
    attribution: "Written by Priya during assessment · unedited",
  },

  softwareLabel: "Software",
  software: [
    "QuickBooks Online · ProAdvisor",
    "Xero",
    "Dext",
    "Bill.com",
    "Gusto payroll",
  ],

  /*
    Pills here, not the key/value rows Arjun's returns use, and the difference is
    the data. A row exists to carry a right-hand number ("Form 1040 · about 140 a
    season"). Priya's scope items are tags: things she does, most without a count.
    "AP & AR" and "Catch-up / cleanup" have no number to put on the right, so a
    row would leave half of itself empty. So they render as pills, like software.

    returns is now a string[] rather than {form, volume}[]. ProfileDetail renders
    it through the shared PillGroup, the same component the software list uses.
  */
  returnsLabel: "Bookkeeping scope",
  returns: [
    "Monthly close · 14 clients",
    "Catch\u2011up / cleanup",
    "AP & AR",
    "Sales tax filings",
  ],

  experienceLabel: "Experience",
  experience: [
    {
      title: "Bookkeeper · US\u2011focused bookkeeping firm, Kochi",
      meta: "Mar 2023 to present · firm name shared on contact",
      body: "Monthly close and cleanup for 14 US\u00A0small\u2011business clients across QuickBooks Online and Xero; AP through Bill.com and payroll via Gusto.",
    },
    {
      title: "Junior accountant · CA\u00A0firm, Kochi",
      meta: "Jun 2020 to Feb 2023",
      body: "Indian bookkeeping, GST filings, and year\u2011end support for trading and services clients.",
    },
  ],

  salary: {
    label: "Expected salary",
    /*
      Her own band, below the tax-preparer hero card on purpose. A bookkeeper
      earns less than a tax preparer, and the two sample profiles landing at
      different points inside the rate card elsewhere on the page is more honest
      than two identical numbers.
    */
    figure: "$700\u2011950",
    suffix: "/mo",
    facts: [
      { term: "Commitment", detail: "Full\u2011time, only job" },
      { term: "Can start", detail: "Within 15\u00A0days" },
      { term: "Works to", detail: "IST day hours · overnight turnaround" },
    ],
  },

  activity: {
    label: "Activity",
    joined: "Joined June 2026",
    active: "Active this week",
  },

  /*
    The one panel that is a verbatim echo of the form: these are the three
    home_setup checkboxes, in order, and all three are required to submit. So the
    firm is reading exactly what the applicant was made to confirm.
  */
  setupLabel: "Work setup",
  setup: [
    "Own laptop, not shared",
    "60\u00A0Mbps broadband",
    "UPS power backup",
  ],

  /*
    A firm's controls, on a page whose reader is not a firm. They are rendered
    inert: no anchor, no button, not focusable, no hover, no press. This is a
    picture of someone else's screen, and the one thing worse than not having the
    buttons is having buttons that do nothing when a job-seeker taps them.
  */
  actions: {
    primary: "Contact Priya",
    secondary: "Save to shortlist",
  },
  footnote: "Profile ATL\u20110017 · you hire and pay directly",

  caption:
    "A sample profile, shown at full size. Sample details, including the work history and bookkeeping scope. What is real is the format: this is the record a US\u00A0firm reads, and the assessment writing is the applicant's own.",

  // The teaser variant shows only the top of the card and none of the fabricated
  // history, so it gets its own one-line caption. "Sample profile." leads it on
  // purpose: the teaser still shows a real face, a name and a Verified badge, and
  // dropping the word "sample" is exactly the overstatement this site avoids.
  captionTeaser:
    "Sample profile. A structured, verified record, not a resume in an inbox.",
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
