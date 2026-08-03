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
  "Prove what you can do.",
  "Get discovered by",
  "US accounting firms.",
] as const;

export const hero = {
  h1Lines: heroH1Lines,
  // The same words as one string, derived rather than duplicated, so the two
  // forms cannot drift apart.
  h1: heroH1Lines.join(" "),
  eyebrow: "Build your AccountingTalent Passport",
  sub: "A free profile built around your skills, software experience, work evidence and vouches from people who have worked with you.",
  cta: "Join the founding network",
  secondaryCta: "See what employers see",
  microcopy:
    "Free to join. No application fees. No salary commission. No pay-to-rank.",
  /*
    A sample of the actual product. The page is arguing that a US firm will see
    your profile and hire you, so showing the profile is the most literal way to
    make that concrete.

    Every line below is a field the application form actually asks for: role,
    qualification, experience, city, working hours, availability, start date,
    software, tax forms, salary. That is what keeps this honest. It is not a
    designer's impression of a product, it is the product.

    The caption below it carries one short line saying it is illustrative, and
    that line needs to stay. The card carries a face, a name and a Verified badge,
    and that sentence is the only thing between an illustration and a claim we
    cannot make. It is one sentence, said once. It used to be said four times.
  */
  sampleProfile: {
    // The name follows the portrait: the image shows a man, so the name is a
    // man's. A mismatched name over a face is the single most obvious "this is
    // fabricated" signal you could put on a card whose whole job is to look
    // credible. (The detail card further down the page is a different person,
    // Priya, with her own portrait. Same rule, applied twice.)
    //
    // Neither the person nor the portrait is real. `imageNote` says so on the
    // page, and the alt text carries it too so a screen-reader user is told what
    // a sighted reader is.
    name: "Arjun S.",
    photo: {
      src: "/images/headshot-1.jpg",
      alt: "Illustrative profile portrait",
    },
    // Named checks, with nothing implied beyond them. This used to read
    // "Verified + English + US tax assessment", which invited the reading that
    // the profile as a whole had been verified. Three specific checks exist
    // (identity, English, qualification) and the card now says which, matching
    // lib/marketing/verificationLevels.ts.
    verified: "Identity, qualification and English verified",
    badges: [
      { kind: "work-proof" as const, label: "Work Proof" },
      { kind: "vouch" as const, label: "4 vouches" },
    ],
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
    caption: "This is what US\u00A0firms will see.",
    // The chip ProfileCard renders over the photo. Required by the component, so
    // this card cannot go out undisclosed.
    exampleChip: "Example",
    // The one line, matching the employer page's wording exactly. Rendered at
    // small-print size under the caption. Kept as its own sentence rather than
    // folded into the caption: a reader working out whether this is a real person
    // should not have to parse a clause to find out.
    //
    // It now covers the badges too. Work Proof results are not shown on profiles
    // yet and vouches are not built at all, so a card displaying both is showing
    // the shape of a finished Passport rather than a current one. Saying that
    // here is what makes showing it acceptable.
    imageNote:
      "An example profile, not a real person or a real photograph. It shows a complete Passport, including Work Proof and vouches, which are still being built.",
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
  What we put in front of a US firm. The hero shows one profile; this shows the
  shortlist it appears in, which is the literal answer to "how does a firm find
  me". Sample data, labelled as such, with realistic Indian names.

  The chips are the match criteria, not a search box the firm types into: the
  heading names them as what WE match on, because under concierge matching the
  firm does not work the database itself.
*/
export const firmView = {
  heading: "What we match you on",
  filters: ["QuickBooks", "Drake", "Form 1040"],
  // The same shape as the hero card, at shortlist-row scale: the row and the
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
  caption: "Illustrative. Verified profiles go first.",
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

  This card is illustrative, and unlike the hero card it does not only illustrate
  fields the form collects. The application asks 21 questions and does not ask for
  employment history, university, languages, or per-form volumes, all of which are
  below. That is a deliberate, recorded decision: the card is the target the form
  grows toward. Which is exactly why `imageNote` runs under it and is not
  optional. Take it off and the page is claiming a candidate it does not have.
*/
export const profileDetail = {
  heading: "What a US\u00A0firm sees when it opens your profile",
  lede: "Not a resume in an inbox. A structured, verified record, and the firm reads it without anyone standing in between.",

  name: "Priya M.",
  photo: {
    // Not a real person, like the hero card's. Said in the alt text as well as in
    // `imageNote` below, so a screen-reader user is told what a sighted reader is.
    src: "/images/headshot-2.jpg",
    alt: "Illustrative profile portrait",
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
    "Shown at full size, including the work history and bookkeeping scope. What is real is the format: this is the record a US\u00A0firm reads, and the assessment writing is the applicant's own.",

  // The teaser variant shows only the top of the card and none of the invented
  // history, so it gets its own one-line caption. The teaser still shows a face,
  // a name and a Verified badge, so `imageNote` below runs under it too.
  captionTeaser:
    "A structured, verified record, not a resume in an inbox.",

  // Rendered under whichever caption is showing, at the same small-print size,
  // matching the employer page. One field for both variants: the full card and
  // the teaser show the same portrait, so they cannot say different things.
  imageNote: "Illustrative. Not a real candidate or a real photograph.",
} as const;

export const math = {
  h2: "Direct hiring can create better economics for both sides.",
  /*
    Softened from "Why direct hiring changes everything" and from a lead-in that
    asserted someone "keeps most of what your work is worth" as a flat fact. The
    argument is the same and it is a good one, but it is a claim about a range of
    arrangements we do not have data on, and this page now leads on reputation
    rather than on pay. "Can create" is what we can support. Do not put the
    absolute back.
  */
  leadIn:
    "When a firm hires through a traditional offshore agency, the accountant often receives only part of what the client pays. Hiring directly can mean the accountant earns more while the firm still spends less overall.",
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
  /*
    Was "Twice the pay for you. A smaller bill for the firm." The 2x is exactly
    true of the illustrative figures in the bars above, and it is NOT true of
    every accountant, which is how a reader will take it as a standalone line
    under a chart. What is defensible is the shape of the trade, not the multiple.
  */
  delta: "More reaches you. The firm still pays less than an agency seat.",
  closing:
    "No agency margin is deducted by AccountingTalent. You and the employer agree compensation directly, and all of it is yours.",
} as const;


/*
  Why a professional record beats a résumé. New section, sitting between the hero
  and the Passport so the Passport arrives as an answer rather than as a feature
  list.
*/
export const reputation = {
  h2: "A résumé tells employers what you claim. Your Passport helps you show the evidence.",
  sub: "Talented accountants are often reduced to a job title, a keyword list and a number of years. This is being built to give you a richer and more credible way to show what you can actually do.",
  points: [
    {
      title: "Show practical work, not responsibilities",
      body: "The difference between “handled month-end close” and showing how you handled one.",
      icon: "file" as const,
      status: "planned" as const,
    },
    {
      title: "Verify the things that matter",
      body: "Identity, qualification and written English, each checked by a person and dated, so you stop re-arguing them with every employer.",
      icon: "seal" as const,
      status: "live" as const,
    },
    {
      title: "Get specific vouches",
      body: "From the people who actually saw the work, about the particular thing they saw you do.",
      icon: "users" as const,
      status: "planned" as const,
    },
    {
      title: "Carry it between opportunities",
      body: "Your record belongs to you. It does not reset when a conversation with one firm ends.",
      icon: "briefcase" as const,
      status: "live" as const,
    },
  ],
} as const;

// The Passport, accountant framing. Pillars come from content/passport.ts, shared
// with the employer page so neither side can describe them differently.
export const passport = {
  heading: "One profile that becomes stronger over time.",
  intro:
    "You build it once and keep improving it. Each part you add makes the profile more useful to an employer deciding whether to talk to you, and none of it expires the moment a conversation ends.",
} as const;

/*
  How the network works, from the accountant's side. Four steps.

  The privacy note is not optional and must not be moved into fine print. Step two
  asks people to upload work, and the single worst outcome of this entire product
  would be an accountant uploading a client's books. It sits directly under the
  steps, at reading size.
*/
export const howItWorks = {
  h2: "Build once. Keep improving it.",
  sub: "Four steps, and the first one takes three minutes.",
  steps: [
    {
      title: "Create your profile",
      body: "Your experience, software, qualifications, the work you want and what you expect to be paid. Structured questions, no essay, no resume upload.",
      status: "live" as const,
    },
    {
      title: "Add credible evidence",
      body: "Complete the written assessment and the US accounting exam, and verify your identity and qualification. Work samples and practical challenges are being built and are not open yet.",
      status: "early-access" as const,
    },
    {
      title: "Invite professional vouches",
      body: "Ask former colleagues, managers or clients to verify one specific capability they saw. This is not built yet, and no profile carries a vouch today.",
      status: "planned" as const,
    },
    {
      title: "Get discovered",
      body: "A firm that wants to talk to you asks us first, and nothing about you reaches them until you say yes. You interview directly, agree your own salary, and they pay you.",
      status: "live" as const,
    },
  ],
  privacyNote:
    "You control which parts of your profile are public and which stay hidden. Never upload client-identifiable or confidential material: work evidence is designed around anonymised and synthetic data, and anything containing a real client’s information will be rejected.",
} as const;

/*
  The anti-LinkedIn section. Short, and it earns its place by being a commitment
  rather than a boast: it says what we will not do to rank people.
*/
export const workNotPopularity = {
  h2: "You should not need to become an influencer to build professional credibility.",
  sub: "Search relevance here comes from skills, experience, availability, evidence and reputation. Not from posting frequency, not from follower counts, and not from paying us.",
  principles: [
    {
      title: "Evidence over engagement",
      body: "What you can demonstrate, not how often you post about it.",
      icon: "file" as const,
    },
    {
      title: "Specific vouches over empty endorsements",
      body: "A named colleague verifying one capability beats a hundred one-click endorsements from people who never worked with you.",
      icon: "users" as const,
    },
    {
      title: "Relevance over paid ranking",
      body: "No accountant can buy a higher position in search results. There is no product that does this, and there is not going to be one.",
      icon: "seal" as const,
    },
  ],
} as const;

/*
  Who this is for. Rewritten from "Who we're looking for", which was a filter, to
  a question of relevance.

  DO NOT state that a qualification is mandatory. The application does not require
  one, and the previous version's lead card (Chartered Accountants first) implied
  a hierarchy the product does not apply.
*/
export const whoWeWant = {
  h2: "Who we are building the network for",
  sub: "If you work in accounting for US or international clients, or you are ready to, this is being built for you.",
  priorityBadge: "Strongest signal today",
  profiles: [
    {
      title: "Bookkeepers and staff accountants",
      body: "Monthly close, AP and AR, reconciliations. One or more years of experience and strong written English.",
      feature: false,
    },
    {
      title: "US accounting and bookkeeping professionals",
      body: "QuickBooks, Xero, Drake, Lacerte, CCH, UltraTax. If you already work US client files, you are the closest fit the network has.",
      feature: true,
    },
    {
      title: "Tax preparers",
      body: "Anyone who has prepared US returns: 1040s, 1120‑S, 1065s.",
      feature: false,
    },
    {
      title: "Payroll, AP and AR specialists",
      body: "Deep in one function rather than broad across several. That is a strength here, not a gap.",
      feature: false,
    },
    {
      title: "Management and financial reporting accountants",
      body: "Budgeting, variance analysis, management packs and statutory reporting.",
      feature: false,
    },
    {
      title: "Audit, assurance and systems specialists",
      body: "Including accountants who implement and run the software rather than only working in it.",
      feature: false,
    },
    {
      title: "CAs, CA Inter, CMAs, ACCAs and M.Coms",
      body: "Including those with no US experience yet. Fundamentals are the hard part and US tax software is learnable.",
      feature: false,
    },
    {
      title: "Experienced graduates with evidence",
      body: "If you can show the work, a short career is not a barrier. Showing it is the part that matters.",
      feature: false,
    },
  ],
  signalsIntro: "What stands out most to the firms we talk to",
  signals: [
    "QuickBooks or Xero experience",
    "US GAAP or direct US client exposure",
    "Strong written communication",
    "A consistent work history",
    "Client-facing experience",
    "Reliable overlap with US working hours",
  ],
  rates: {
    intro: "What US firms typically pay direct hires",
    bands: [
      { role: "Bookkeepers", range: "$500 to $800" },
      {
        role: "Experienced accountants and tax preparers",
        range: "$800 to $1,500",
      },
      { role: "Senior and reviewer roles", range: "$1,500 to $2,500+" },
    ],
    note: "Per month, full-time, long-term positions. Not gig work. Figures are typical of what we see and are not guaranteed: what you earn depends on your experience, the role, the hours, the firm, and what you agree between you.",
  },
} as const;

/*
  Accountant pricing. The free plan is the product; Pro is a de-emphasised
  possibility with no payment button, because it is not being launched.

  THE PAY-TO-RANK LINE IS NOT NEGOTIABLE. It is the single most load-bearing
  promise on this page for an audience that has been charged by everyone else in
  this market, and it has to survive any future pricing work. If Pro ever ships
  and it does buy ranking, this page has lied.
*/
export const pricing = {
  h2: "Free to build your professional reputation.",
  sub: "The core product is free and is going to stay that way. Nothing about your profile, your applications or your ranking is behind a payment.",
  free: {
    name: "AccountingTalent Free",
    price: "₹0",
    unit: "the full core profile",
    includes: [
      { text: "A public professional profile", status: "live" as const },
      { text: "Skills, software and experience", status: "live" as const },
      { text: "Qualifications and verification", status: "live" as const },
      { text: "Applications to roles", status: "live" as const },
      { text: "Employer discovery", status: "live" as const },
      { text: "A shareable profile URL", status: "live" as const },
      { text: "Work Proof portfolio", status: "planned" as const },
      { text: "Professional vouches", status: "planned" as const },
      { text: "Standard work challenges", status: "planned" as const },
      { text: "Profile analytics", status: "planned" as const },
    ],
    commitments: [
      "No application fee, ever.",
      "No commission on your salary, ever.",
      "No charge to receive a message from an employer.",
      "No payment required to rank fairly in search.",
    ],
  },
  pro: {
    name: "AccountingTalent Pro",
    status: "Planned for later. Not available, and not being sold.",
    price: "Possibly ₹299 a month",
    body: "If it ever ships, it would be presentation and insight tools: deeper profile analytics, tailored résumé exports, a custom profile address, career benchmarking, portfolio tools.",
    critical:
      "Pro will not buy a higher position in search results. Ranking is not for sale here to anyone, at any price.",
  },
} as const;

/*
  Verification, accountant-facing. The copy for each check lives in
  lib/marketing/verificationLevels.ts, which is unit-tested against the checks the
  app can actually stamp, so this object holds only the framing.
*/
export const verification = {
  h2: "Verification should build trust, not act as a paywall for work.",
  sub: "During founding access, straightforward identity and qualification verification is free wherever we can operationally do it. Charging an accountant to prove who they are, before they have earned anything, is the wrong way round.",
  statusIntro: "What a check can say on your profile",
  gapsIntro: "What we deliberately do not check",
} as const;

/*
  Where we actually are. Same shape as the employer page's honest section, and the
  two must stay in step: a firm evaluating us reads this page within about two
  clicks, and softening one while the other stands would discredit both.

  `admission` is the sentence the whole brand rests on. It does not move and it
  does not get gentler.

  THE PRICING FIGURES THAT USED TO LIVE HERE ARE GONE. This section previously
  quoted "$1,440 a year, $720 founding, $2,400 per hire" as the proof that
  accountants are never charged. Those numbers no longer exist anywhere in the
  product, and this file was one of the four places the old comments warned would
  drift. The promise did not depend on the figures, so it is now made directly.
*/
export const honest = {
  h2: "There is no guaranteed job waiting for you today.",
  lede: "We'll be straight with you, because you've seen enough websites that aren't.",
  body: [
    "AccountingTalent.in is building the employer side of the network. Joining now lets you create an early profile, help shape what gets built, and be visible as US firms begin taking part. It does not guarantee an interview, an employer message, or an offer.",
  ],
  admission: "There is no job waiting for you today.",
  expectIntro: "What you can expect:",
  expect: [
    {
      term: "A free, permanent profile",
      body: "We will never charge accountants, at any stage. Firms pay us for hiring access. Not one rupee of what you agree with an employer comes to us, in any month, for as long as you work there.",
    },
    {
      term: "Your feedback actually changing things",
      body: "You are early enough that telling us a question is useless is enough to get it removed.",
    },
    {
      term: "A place in the Work Proof pilots",
      body: "When the practical challenges open, early profiles go first.",
    },
    {
      term: "A monthly update, either way",
      body: "One email a month on where things stand, including the months when there is no news.",
    },
    {
      term: "No exclusivity and no lock-in",
      body: "Your profile, your negotiation, your job. Delete it whenever you want.",
    },
  ],
  notIntro: "What you should not expect:",
  not: [
    "Guaranteed employment. We do not control whether a firm is hiring for what you do.",
    "Any way to pay for a better position in search results. It does not exist and will not be built.",
    "Job listings invented to make the network look busier than it is.",
    "AccountingTalent taking a share of your salary. Not now, not later.",
  ],
} as const;

export const finalCta = {
  h2: "Build a professional profile that shows more than a résumé.",
  sub: "Join the founding network free and help shape a better way for Indian accountants to be discovered internationally.",
  cta: "Join the founding network",
  secondaryCta: "See example profiles",
  referral:
    "Know another accountant working US hours for agency pay? Refer them and you will both get featured placement at launch.",
  referralLinkLabel: "Refer them",
} as const;

export const faqHeading = "Questions accountants ask us";

// Where "See what employers see" and "See example profiles" go: the real preview
// page, rendering the real profile component through the real authorization
// projection. Not a mock.
export const exampleProfile = { href: "/candidates/preview" } as const;
