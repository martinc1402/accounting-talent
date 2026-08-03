import { CONTACT_EMAIL } from "./site";

/*
  The employer homepage, top to bottom. Every string the "/" route renders
  resolves from here, so a copy edit is a data change rather than a JSX rewrite.

  WHAT THIS PAGE NOW SELLS. AccountingTalent is a professional network: an
  accountant builds a record from verified credentials, practical work evidence,
  software proof and vouches, and firms discover people through those signals.
  Browsing is free, the first role post is free, and a firm pays when it wants
  broader contact access or hands-on help with a search.

  THIS REPLACES the "verified database, opens late 2026" model: an annual access
  fee plus a per-hire success fee, gated behind a launch date. Two things changed.
  The gate is gone, because the page now describes what a firm can do today and
  labels what it cannot; and the fees are gone, replaced by the three plans in
  content/passport.ts. If you are changing the revenue model AGAIN, content/faq.ts,
  content/home.ts, content/legal.ts and lib/assessment/emails.ts all state it too
  and all have to move together. lib/assessment/emails.ts is the one that will not
  produce a build error when you miss it.

  HONESTY IS THE CONSTRAINT ON THIS FILE. Most of what the Passport describes is
  not built: no candidate search, no messaging, no work samples, no vouches, no
  job posting, no payments. Nothing here may imply otherwise. Capability status
  lives in content/passport.ts, where the type system enforces that an unbuilt
  feature cannot be given a working button. Read that file before adding a claim.

  Search and candidate privacy are not in tension, and the copy must not imply
  they are. Firms see GATED profiles: what a candidate has chosen to expose is
  what a firm sees, and contact requires an introduction the candidate approves.
  That is what lib/authz/* actually implements, so it is what we say.

  Order matters and is argued. The problem is reframed before the product is
  described, the Passport is explained before the pool is shown, and price comes
  after all of it, because a firm that does not believe the evidence is real does
  not care what access to it costs.

  American English throughout (this audience is US accounting firms).

  Dash convention, held to throughout: no em dashes and no en-dash separators.
  Ranges use "to" or a hyphen; a pause that an em dash would carry becomes a
  period, comma, colon, or parentheses. The   (non-breaking space) escapes
  weld a number or a compound to its neighbor so a line never ends on a dangling
  "US" or "30".

  `founding` at the bottom is dormant and stays. app/actions.ts:1333 still reads
  firms.founding.concierge for the saveFirmConcierge option lists. The Founding
  Employer SECTION on this page is `foundingProgramme`, which is a different
  thing; do not merge them without removing that dependency first.
*/
export const firms = {
  /*
    Section 1: hero.

    Five text elements, which is one more than the four this hero was cut down to,
    and the fifth is deliberate. The element that was removed was a trust line
    arguing the product ("no monthly markup, no exclusivity"); the one added back
    is `microcopy`, which states the price. Those are not the same thing. A firm
    landing here has exactly one question before it will click anything, and it is
    "what does this cost me to look", so the answer belongs above the fold rather
    than eight sections down. If it ever goes back to arguing rather than
    answering, cut it again.
  */
  hero: {
    eyebrow: "The professional network for Indian accounting talent",
    h1: "Hire Indian accountants based on proof, not promises.",
    sub: "Verified profiles, practical work evidence, and vouches from people who have seen the work. Browse free, post your first role free.",
    microcopy:
      "Free to browse. First role post free. One introduction for verified firms.",
    /*
      Caption under the hero card. The card is the product, so it is shown rather
      than described, but it must never read as a real person a firm could email
      this afternoon.

      One short line, once. This used to say "sample" here and again on every card
      and again under the grid, which read as apology rather than candour. It is
      down to a single sentence per card location. Do not delete the sentence: the
      card carries a name, a face and a Verified badge, and without it the page is
      showing invented inventory to someone deciding whether to pay for access to
      that inventory. ProfileCard now REQUIRES this, so it cannot be forgotten.
    */
    exampleChip: "Example",
    sampleCaption:
      "An example profile, not a real person or a real photograph. It shows the shape of a complete Passport, including the parts that are still being built.",
    profile: {
      name: "Arjun M.",
      photo: {
        src: "/images/portrait-m-1.jpg",
        alt: "Example profile portrait",
      },
      verified: "Identity and qualification verified",
      role: "US tax preparer, 6 years",
      location: "Bengaluru, India",
      availability: "Full US business hours",
      softwareLabel: "Software",
      software: ["QuickBooks Online", "Drake", "Lacerte"],
      returnsLabel: "US returns prepared",
      returns: ["Form 1040", "1120‑S", "1065"],
      salaryLabel: "Expected compensation",
      salary: "$1,000‑1,400",
      salarySuffix: "/mo",
    },
  },

  /*
    Calls to action. EVERY button on this page goes to the intake form.

    That is a deliberate narrowing. "Explore talent" used to be the hero's primary
    button and scrolled to the example profiles at #network, on the reasoning that
    there is no candidate directory to send it to (no /candidates index route
    exists, and the card component built for one is imported by nothing). The
    reasoning was sound and the outcome was not: it made the most prominent button
    on the page a non-converting one that moved a reader down the page instead of
    into the only thing here that captures intent.

    So the secondary label no longer promises browsing. "See what we offer" is
    honest about arriving at a form rather than at a search, and the page still
    has plenty of browsing in it via the nav's "Find Talent" and the #network
    section itself, both of which are navigation rather than calls to action.

    When candidate search actually ships, a browse CTA earns its place back and
    this is where it goes.
  */
  reserve: { label: "Post a role free", href: "/#reserve" },
  secondary: { label: "See what we offer", href: "/#reserve" },
  contactEmail: CONTACT_EMAIL,

  /*
    Section 2: the reframe. Stated before the offer, full width, directly under
    the hero.

    This deliberately does NOT lead with cost. Price is the accountant's argument
    (it is the pitch on /accountants); a firm owner's first thought about an
    overseas hire is whether the person can do the work, and a page that opens on
    price reads as though it has not understood the question.
  */
  problem: {
    heading:
      "Finding accountants is easy. Knowing who can actually do the work is harder.",
    body: "US firms are already approached by offshore accountants, recruiters and staffing companies. The problem is not access to more résumés. It is knowing which professionals are credible, relevant, and ready to work in a US accounting environment.",
    frustrations: [
      {
        title: "Résumés are difficult to verify",
        body: "A claim about six years of 1120‑S work looks identical on the page whether or not it happened.",
      },
      {
        title: "Software proficiency is self-reported",
        body: "Every résumé lists QuickBooks. Very few distinguish between having opened it and having run a month-end close in it.",
      },
      {
        title: "Interviews show a narrow slice",
        body: "An hour on a call tests how someone talks about their work. It does not show you the work.",
      },
    ],
    close:
      "AccountingTalent is being built to make professional capability visible before you hire.",
  },

  // Section 3: the Passport. Pillars live in content/passport.ts, shared with
  // /accountants so the two sides cannot describe the same thing differently.
  passport: {
    heading: "More than a profile. A professional AccountingTalent Passport.",
    intro:
      "Every accountant can build a living professional record that becomes more useful as they verify credentials, demonstrate skills, complete work challenges, and receive vouches from people who have worked with them.",
  },

  /*
    Section 4: the network effect. Four steps that close a loop.

    Rendered as the same dot-and-rail step list the rest of the site uses, plus a
    closing sentence saying the fourth step feeds the first. A circular SVG
    diagram was the obvious alternative and is the wrong one: this site has
    repeatedly rejected decoration that makes no argument (see ProfileDetail,
    which replaced a full-bleed photograph for exactly that reason).
  */
  loop: {
    heading:
      "A talent network that becomes more useful with every credible contribution.",
    steps: [
      {
        title: "Accountants build evidence-rich profiles",
        body: "Credentials, software depth, industry exposure and availability, each confirmed and dated rather than asserted once and left to age.",
      },
      {
        title: "Colleagues verify specific capabilities",
        body: "Not a general endorsement. A named person confirms one particular thing they saw this accountant do.",
      },
      {
        title: "Firms discover people through stronger signals",
        body: "You filter on evidence rather than on keywords, which is the difference between a shortlist and a pile.",
      },
      {
        title: "Hiring outcomes strengthen the record",
        body: "What happened after the hire becomes the most valuable signal on the profile, and it feeds straight back into the first step.",
      },
    ],
    close:
      "The goal is not to collect the largest number of résumés. It is to build the most useful professional reputation network for Indian accounting talent.",
  },

  // Section 5: what kind of network this is, and what it deliberately is not.
  // Items live in content/passport.ts as networkPrinciples.
  principles: {
    heading: "Built around work, not empty engagement.",
    intro:
      "AccountingTalent will not be a professional feed. There are no follower counts, no posting streaks, and no engagement to farm. The thing you are looking at on a profile is the work.",
  },

  /*
    Section 6: how hiring works. Four steps, each carrying its own capability
    status, because two of the four are not built.

    A step marked "Launching soon" is not a smaller claim about a working feature.
    It means the step does not exist yet, and the reader is entitled to know that
    before they plan around it.
  */
  hiring: {
    heading: "Explore first. Pay when you are ready to hire.",
    intro:
      "Nothing on this page asks for a card. Here is the order things happen in, and where we actually are on each.",
    steps: [
      {
        title: "Browse the network",
        body: "Review profiles, skills, experience and selected work evidence without paying. Today that means full example profiles and the people we introduce you to directly. Open search and filters are being built.",
        status: "early-access" as const,
      },
      {
        title: "Post your first role free",
        body: "Describe the role, working hours, software, compensation and the experience you need. Right now we set this up with you from your brief rather than from a self-serve form.",
        status: "planned" as const,
      },
      {
        title: "Build a shortlist",
        body: "Save and compare accountants, and request an introduction. Verified firms get one introduction at no cost. This part works today.",
        status: "live" as const,
      },
      {
        title: "Unlock hiring access",
        body: "Take a 30-day Hiring Pass for broader contact access, or ask us to prepare a curated shortlist for you.",
        status: "early-access" as const,
      },
    ],
  },

  /*
    Section 7: the pool, shown rather than described. The strongest thing on the
    page and the one that most needs its disclosure.

    These are invented people. Names are first-name-plus-initial, which is also
    how a gated profile reads to a firm before an introduction is approved.

    `note` is doing real work and must not be trimmed to a single word. A firm is
    looking at three faces, three verification lines and three salary
    expectations, under a heading that says what is in the network. Some of the
    evidence shown on these cards (vouch counts, Work Proof) describes parts of
    the Passport that are NOT BUILT. Saying so here, next to the cards, is the
    difference between showing a design and making a claim.
  */
  network: {
    heading: "Inside the AccountingTalent network",
    intro:
      "This is how a profile reads before you request an introduction: enough to decide whether to talk, without exposing the person's identity or contact details.",
    profiles: [
      {
        name: "Meera R.",
        photo: {
          src: "/images/portrait-f-1.jpg",
          alt: "Example profile portrait",
        },
        verified: "Identity, qualification and English verified",
        role: "Senior tax preparer, 8 years",
        location: "Chennai, India",
        availability: "Full US business hours",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Drake", "UltraTax"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1040", "1120‑S"],
        salaryLabel: "Expected compensation",
        salary: "$1,600‑2,100",
        salarySuffix: "/mo",
        badges: [
          { kind: "work-proof" as const, label: "Work Proof" },
          { kind: "vouch" as const, label: "3 vouches" },
        ],
      },
      {
        name: "Nikhil D.",
        photo: {
          src: "/images/portrait-m-2.jpg",
          alt: "Example profile portrait",
        },
        verified: "Identity and qualification verified",
        role: "Bookkeeper and monthly close, 5 years",
        location: "Pune, India",
        availability: "Partial morning overlap",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Xero"],
        returnsLabel: "Core responsibilities",
        returns: ["Monthly close", "AP / AR", "Bank reconciliations"],
        salaryLabel: "Expected compensation",
        salary: "$650‑800",
        salarySuffix: "/mo",
        badges: [{ kind: "vouch" as const, label: "1 vouch" }],
      },
      {
        name: "Fatima Q.",
        photo: {
          src: "/images/portrait-f-2.jpg",
          alt: "Example profile portrait",
        },
        verified: "Identity verified",
        role: "Staff accountant, 4 years",
        location: "Hyderabad, India",
        availability: "Full US business hours",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Lacerte", "CCH Axcess"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1065", "1120‑S"],
        salaryLabel: "Expected compensation",
        salary: "$850‑1,150",
        salarySuffix: "/mo",
        badges: [{ kind: "work-proof" as const, label: "Work Proof" }],
      },
    ],
    exampleChip: "Example",
    note: "These are example profiles, not real people or real photographs, and they show the Passport as it is being built. Identity, qualification and English checks are live today. Work Proof results are not yet shown on profiles, and vouches are not built at all, so no profile carries either right now. Compensation figures are typical of the bands we see, not quotes.",
    trademarks:
      "Software names are the property of their owners. We are not affiliated with any of them.",
  },

  // Section 8: pricing. Plans live in content/passport.ts, because the same four
  // services are also the intake form's options and the analytics vocabulary.
  pricing: {
    heading: "Pay when you are ready to hire",
    intro:
      "Three ways in. The first one is free and stays free, and none of them takes a percentage of anyone's salary.",
  },

  /*
    Section 9: the Founding Employer programme.

    EVERYTHING IN THIS SECTION IS A COMMITMENT WE ARE MAKING, not a feature that
    exists. "60 days of Hiring Pro access" describes a tier with no
    implementation; "10 candidate introductions" is us doing them by hand. Framed
    as what we will do for the first 25 firms, that is honest. Framed as a
    product, it is not. Keep the future tense.

    The ask is deliberately not a testimonial requirement. We ask for PERMISSION
    to request one later, which is a different thing, and the difference matters
    to the kind of firm we want.
  */
  foundingProgramme: {
    heading: "Become a Founding Employer",
    sub: "We are working closely with the first 25 US firms to shape a better way to hire Indian accounting talent.",
    offerIntro: "What we will do for you:",
    offer: [
      {
        title: "60 days of full hiring access, free",
        body: "Everything a paid plan will carry when it ships, at no cost, for your first two months.",
      },
      {
        title: "Up to 10 introductions",
        body: "Prepared by hand while the matching tools are being built, which for now means we do the searching.",
      },
      {
        title: "A shortlist put together for you",
        body: "One role, five people, availability confirmed before you see them.",
      },
      {
        title: "Help writing the role",
        body: "Most offshore hires go wrong at the job description. We will work through yours with you.",
      },
      {
        title: "50% off for the following year",
        body: "Half the published rate on paid hiring access for twelve months after your founding period ends.",
      },
    ],
    askIntro: "What we ask in return:",
    ask: [
      "A short conversation about how your firm hires today.",
      "Your honest reaction to the candidates we recommend, including when the answer is no.",
      "A few minutes after an interview to tell us what the profile missed.",
      "Permission to ask you later about a testimonial or case study. Asking is not the same as owing us one, and a founding place does not depend on saying yes.",
    ],
  },

  /*
    Section 10: where we actually are.

    A firm owner evaluating us will read /accountants within about two clicks, and
    that page tells accountants there is no job waiting for them today. Saying
    something softer here than we say there is the one move that would discredit
    both pages at once. `admission` is the sentence that keeps this page honest;
    it is set in display type for the same reason its worker-side counterpart is.

    No countdown, no seat counter, no unverified user totals. If a number appears
    here it has to be one the business can substantiate.
  */
  honest: {
    heading: "We are building the network with our first employers.",
    lede: "The same straight answer we give accountants, on a page you can reach from ours in one click.",
    body: [
      "AccountingTalent already has real interest from Indian accounting professionals, and profiles are being built and checked today. The next step is not simply adding more of them. It is working with US firms to find out which evidence, assessments and reputation signals actually improve a hiring decision, because we would rather build four things that change your mind than forty that do not.",
    ],
    admission: "The network is in early access, and not everything on this page is live yet.",
    expectIntro: "What taking part gets you:",
    expect: [
      {
        term: "A say in what gets built",
        body: "You are early enough that telling us a signal is useless is enough to stop us building it.",
      },
      {
        term: "Candidates put in front of you by hand",
        body: "Until search ships, matching is something we do rather than something you do.",
      },
      {
        term: "Nothing to pay, and nothing to cancel",
        body: "There is no card to enter. Taking part does not commit you to paying or to hiring anyone.",
      },
      {
        term: "A monthly note, either way",
        body: "One short email a month on where the network stands, including the months when there is nothing new to report.",
      },
    ],
    notIntro: "What it does not get you:",
    not: [
      "A guaranteed hire. We do not control whether the right person is available when you need them.",
      "A working candidate search today. It is being built, and this page says so wherever it comes up.",
      "An employment or staffing relationship. You contract the accountant directly and we are not a party to it.",
    ],
  },

  /*
    Section 11: the intake form (#reserve). The page's one conversion, and the
    only thing on it we are actually measuring.

    Field config is data so option lists tune without touching the component. Keys
    match the EmployerLeadInput shape in app/actions.ts and the columns in
    employer_leads.

    Field ORDER is qualifying-questions-first and it is deliberate: service, firm,
    email, size, volume, timing, budget, and only then the personal and open-ended
    fields. Someone who abandons halfway has still told us the things this exists
    to learn. Asking their name first is politeness that costs data.

    `reassurance` renders under the submit button. It answers the three questions a
    partner has with their cursor over it: when do I hear back, what does this cost
    me now, and am I committing to anything.
  */
  brief: {
    heading: "Reserve founding access",
    sub: "A few questions about your firm. They tell us what to build toward, and they hold your founding place.",
    submit: "Reserve founding access",
    submitting: "Sending...",
    reassurance:
      "We read every one of these and reply within two working days. Nothing to pay, no card, and no obligation to hire or to subscribe later.",
    requiredNote: "A star marks a required field.",
    success: {
      heading: "You are on the founding list.",
      lede: "Thank you. Your place is held, and so is the founding rate.",
      body: [
        "We will be in touch within two working days, and once a month after that with where the network stands.",
        "There is nothing to pay now and no obligation to subscribe or to hire.",
        "A confirmation email is on its way. Reply to it with any questions and it comes straight to me.",
      ],
    },
    genericError: "Something went wrong. Please try again.",
    fields: {
      firm_name: {
        label: "Firm name",
        required: true,
        placeholder: "Cooper & Associates CPA",
      },
      full_name: {
        label: "Your name",
        required: true,
        placeholder: "Jane Cooper",
      },
      work_email: {
        label: "Work email",
        required: true,
        placeholder: "you@yourfirm.com",
        help: "Please use your firm address rather than a personal one.",
      },
      firm_website: {
        label: "Firm website",
        required: false,
        placeholder: "yourfirm.com",
      },
      firm_size: {
        label: "Firm size",
        required: true,
        options: ["1 to 5", "6 to 20", "21 to 50", "50+"],
      },
      /*
        The option LIST is not here. It lives in content/passport.ts as
        `serviceOptions`, because the same four values are the pricing cards, the
        preferred_service column (migration 0021) and the `service` prop on the
        lead_submit event. One array, so a firm's stated intent and its recorded
        intent cannot disagree. Only the label and helper text live here.
      */
      preferred_service: {
        label: "What are you interested in?",
        required: true,
        help: "Pick the closest. Nothing here is a commitment, and there is nothing to pay.",
      },
      roles: {
        label: "Roles you would hire",
        required: true,
        help: "Select any that apply.",
        options: [
          "Bookkeeper",
          "Staff accountant",
          "Tax preparer",
          "Senior / reviewer",
        ],
      },
      hires_12mo: {
        label: "Hires in the next 12 months",
        required: false,
        options: ["1", "2 to 3", "4 to 6", "7+", "Not sure yet"],
      },
      start_timeframe: {
        label: "When would you want them",
        required: false,
        options: ["Busy season 2027", "Mid‑2027", "Just exploring"],
      },
      budget: {
        label: "Budget per hire",
        required: false,
        help: "Annual, in US dollars. A range is fine.",
        options: [
          "Under $12,000",
          "$12,000 to $18,000",
          "$18,000 to $25,000",
          "$25,000+",
          "Not sure yet",
        ],
      },
      details: {
        label: "Anything else?",
        required: false,
        help: "Optional.",
        // A single line, not a textarea. A big empty box at the end of a form
        // reads as homework and is the last thing people see before deciding
        // whether to submit. One line invites a phrase and nothing more.
        placeholder: "Software your firm runs, client types, must-haves",
      },
    },
  },

  // Final CTA band (navy).
  finalCta: {
    heading: "Find your next accountant through evidence, not guesswork.",
    sub: "Browse the founding network free, post your first role, or ask us to prepare a shortlist.",
  },

  // FAQ heading (items live in content/faq.ts as employerFaq).
  faqHeading: "Questions firms ask us",

  // Shown under primary button CTAs.
  trustRow: "Free to browse. No card. You contract the accountant directly.",

  // Mobile-only sticky CTA bar. The label is short because the bar is one flex
  // row on a 375px screen: at "Hiring for busy season 2027?" the label took the
  // width the button needed and "Reserve access" wrapped to two lines.
  stickyBar: {
    label: "Hiring for 2027?",
    cta: "Post a role free",
  },

  // ---------------------------------------------------------------------------
  // Dormant. Not rendered on this page. Kept because app/actions.ts:1333 reads
  // firms.founding.concierge for the saveFirmConcierge option lists, and because
  // FoundingForm.tsx still references these keys. Retiring the firm_waitlist path
  // is a separate decision from this rewrite; do this content and that code in one
  // commit when it happens, code first or the build breaks.
  //
  // NOT to be confused with `foundingProgramme` above, which is the Founding
  // Employer section this page actually renders.
  founding: {
    eyebrow: "Founding firms",
    headline: "Founding firms get first pick of the pool.",
    intro: "Founding firms get in earlier, and on better terms:",
    points: [
      {
        title: "Search first.",
        body: "Day-one access to the verified pool, before it gets picked over.",
      },
      {
        title: "Better terms.",
        body: "Founding rates on the plan that arrives at launch.",
      },
      {
        title: "Hiring now?",
        body: "Tell us the role and we'll hand-match you with verified candidates today.",
      },
    ],
    scarcity: "Limited to the first 50 firms.",
    label: "Work email",
    placeholder: "you@yourfirm.com",
    cta: "Join as a founding firm",
    microcopy:
      "One short email a month: new verified profiles and pool salary data, nothing else. No sales calls. Unsubscribe anytime.",
    concierge: {
      successHeading: "You're in.",
      intro: "One question while you're here, it helps us match you first:",
      roleQ: "What role would you hire first?",
      roleOptions: [
        "Bookkeeper",
        "Tax preparer",
        "Staff accountant",
        "Senior / reviewer",
        "Not sure yet",
      ],
      timingQ: "When?",
      timingOptions: ["Before tax season", "At launch", "Just watching for now"],
      skip: "Skip",
      done: "Done",
      saved: "Thanks, that helps us match you first. We'll be in touch soon.",
      summaryRoleLabel: "Role",
      summaryTimingLabel: "When",
      beforeSeasonValue: "Before tax season",
      beforeSeasonClose:
        "We'll email you within a few days with hand-matched profiles.",
    },
  },
} as const;
