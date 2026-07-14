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
    // Arjun, not Priya: the headshot is of a man, and a female name over a male
    // face is the single most obvious "this is fabricated" signal you could put
    // on a card whose whole job is to look credible.
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
  The same profile as the hero card, opened.

  Three scales of one object: the hero card (the summary), FirmView (the search
  result), and this (the full record a firm reads before it contacts you). The
  shared fields below are DERIVED from hero.sampleProfile rather than restated,
  the same way hero.h1 is derived from its lines. If the hero says $900-1,200 and
  this card says something else, the "same person" premise dies quietly.

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

  name: hero.sampleProfile.name,
  photo: hero.sampleProfile.photo,

  /*
    Split in two on purpose. The green means Verified, it does not mean
    "everything about verification": three lines of solid #22c55e on a phone
    shouts, and the exam detail is a fact, not a state.

    The date follows the join date. The mockup had it verified in March and
    joined in July, which would have it verified before it existed.
  */
  verified: {
    state: "Verified 26\u00A0Jun 2026",
    detail: "passed the English writing assessment and the US\u00A0tax exam (9/10)",
  },

  rows: {
    role: "Tax\u00A0preparer · 4\u00A0yrs experience · 2.5\u00A0yrs on US\u00A0clients",
    education: "CA\u00A0Inter (both groups) · B.Com, Gujarat University",
    location: "Ahmedabad, India · English (assessed), Hindi, Gujarati",
  },

  /*
    The most valuable thing on the card, and the only part a middleman cannot
    fake for you: his own English, unedited, answering the Stage 2 writing
    prompt. A firm's real fear is not that the accounting is wrong, it is that it
    cannot tell whether the person can explain what they did. So the card lets
    him explain what he did.

    Set in the sans face, not the display serif. The serif is the brand's voice.
    The whole worth of this paragraph is that it is HIS voice, so the brand keeps
    out of it.
  */
  quote: {
    label: "In their own words",
    text: "“Last tax season a client's QuickBooks bank feed re\u2011imported three months of transactions after their bank migrated systems, so the register showed nearly double the actual activity and the books were off by $18,400. I exported both the register and the bank statements to Excel, matched them by date and amount to isolate the duplicates, and confirmed in the audit log that they came from the second feed connection. After removing the duplicates and re\u2011reconciling October to December, the difference came to zero. I also set a bank rule to flag same\u2011day same\u2011amount entries so it would not happen again silently.”",
    attribution: "Written by Arjun during assessment · unedited",
  },

  softwareLabel: "Software",
  software: [
    "QuickBooks Online · ProAdvisor",
    "Drake",
    "Lacerte",
    "Excel (advanced)",
  ],

  /*
    Rows, not pills. "Form 1040 · about 140 a season" is a key/value pair wearing
    a tag's clothes: it is twice the width of a real tag, three of them will not
    share a line, and the pill ends up wider than the column with nothing
    flex-wrap can do about it. It visibly burst its own pill in the mockup.

    So the card draws a line it should have drawn anyway: pills are for tags
    (software, which you either have or you do not), rows are for measured facts
    (volumes, which have a number on the right).

    "about", not "~". The tilde is not in this site's vocabulary; everywhere else
    it says "about ₹55,000", "approximate", "typical".
  */
  returnsLabel: "US\u00A0returns prepared",
  returns: [
    { form: "Form\u00A01040", volume: "about 140 a season" },
    { form: "Form\u00A01120\u2011S", volume: "about 35 a season" },
    { form: "Form\u00A01065", volume: "about 15 a season" },
    { form: "Form\u00A0941", volume: "payroll, quarterly" },
  ],

  experienceLabel: "Experience",
  experience: [
    {
      title: "Senior tax associate · US\u2011focused offshore firm, Ahmedabad",
      meta: "Jan 2024 to present · firm name shared on contact",
      body: "Prepares and first\u2011reviews 1040 and 1120\u2011S returns for three US\u00A0CPA firm clients; monthly close and QBO cleanup for 12 small\u2011business books.",
    },
    {
      title: "Article assistant, then staff accountant · CA\u00A0firm, Ahmedabad",
      meta: "Aug 2019 to Dec 2023 · CA\u00A0articleship completed",
      body: "Statutory audit, Indian bookkeeping, and Tally\u2011to\u2011QuickBooks migrations for trading and services clients.",
    },
  ],

  salary: {
    label: "Expected salary",
    // Derived, so the two cards cannot quote different numbers.
    figure: hero.sampleProfile.salary,
    suffix: hero.sampleProfile.salarySuffix,
    facts: [
      { term: "Commitment", detail: "Full\u2011time, only job" },
      { term: "Can start", detail: "Within 30\u00A0days" },
      { term: "Works to", detail: "10pm IST ≈ 12:30pm ET" },
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
    "Reliable broadband",
    "Power backup and 5G\u00A0hotspot",
  ],

  /*
    A firm's controls, on a page whose reader is not a firm. They are rendered
    inert: no anchor, no button, not focusable, no hover, no press. This is a
    picture of someone else's screen, and the one thing worse than not having the
    buttons is having buttons that do nothing when a job-seeker taps them.
  */
  actions: {
    primary: "Contact Arjun",
    secondary: "Save to shortlist",
  },
  footnote: "Profile ATL\u20110042 · you hire and pay directly",

  caption:
    "A sample profile, shown at full size. Sample details, including the work history and volumes. What is real is the format: this is the record a US\u00A0firm reads, and the assessment writing is the applicant's own.",
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
