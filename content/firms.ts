import { CONTACT_EMAIL, LAUNCH_EMPLOYER, LAUNCH_EMPLOYER_SHORT } from "./site";

/*
  The homepage, top to bottom. Every string the "/" route renders resolves from
  here, the same content-driven discipline /accountants uses, so a copy edit is a
  data change rather than a JSX rewrite.

  The model this page sells is a verified candidate database, opening to US\u00A0firms
  in late 2026: a firm subscribes for annual access, searches verified profiles,
  requests an introduction, and hires the accountant directly. Revenue is the
  access fee plus a per-hire success fee, waived if the hire does not last 90
  days. There is no per-seat markup and no exclusivity.

  This reverses the concierge copy that briefly lived at /employers ("no database,
  no subscription, no launch gate"). The candidate-side and legal copy were
  reconciled to match in the same pass; if you are changing the revenue model
  again, content/faq.ts, content/home.ts, content/legal.ts and
  lib/assessment/emails.ts all state it too and all have to move together.

  Search and candidate privacy are not in tension, and the copy must not imply
  they are. Firms search GATED profiles: what a candidate has chosen to expose is
  what a firm sees, and contact requires an introduction request the candidate
  approves. That is what lib/authz/* actually implements, so it is what we say.

  Order matters and is argued, not arbitrary. Risk comes before price, because a
  firm's first objection to an overseas hire is "who is this person", not "what
  does it cost". Vetting is the longest section on the page for the same reason.
  The illustrative profiles sit directly after it as the evidence for the claim.

  American English throughout (this audience is US\u00A0accounting firms).

  Dash convention, held to throughout: no em dashes and no en-dash separators.
  Ranges use "to" or a hyphen; a pause that an em dash would carry becomes a
  period, comma, colon, or parentheses. The   (non-breaking space) escapes
  weld a number or a compound to its neighbor so a line never ends on a dangling
  "US" or "90".

  Dollar figures, the pass rate, the software mix and the availability share are
  deliberately unresolved and marked [TODO: ...] so they are greppable. Nothing on
  this page should state a number the business cannot back.

  `founding` is kept intact at the bottom: it still backs the dormant FoundingForm
  and the saveFirmConcierge option lists in app/actions.ts.
*/
export const firms = {
  // Section 1: hero. Four text elements at most (eyebrow, headline, subhead,
  // CTAs). The old hero carried a fifth (a trust line under the buttons); it
  // moved into TrustRow further down the page, where it is not competing with
  // the one thing the hero is for.
  hero: {
    eyebrow: "For US\u00A0accounting firms",
    h1: "Hire vetted Indian accountants directly.",
    // The differentiator moved out of the headline and into here. In the headline
    // it pushed the h1 to three lines at 1440px, left a two-word orphan on the
    // last one, and shoved the CTA to the bottom edge of a 900px viewport. The
    // subhead carries it at 19 words, under the 20-word ceiling a hero subhead
    // gets before it stops being read.
    sub: "No staffing agency, no monthly markup. Search a verified database, request an introduction, and hire on your own terms.",
    // Caption under the card in the right column. The card is the product, so it
    // is shown rather than described, but it must never read as a real person a
    // firm could contact today.
    //
    // One short line, once. This used to say "sample" here and again on every
    // card and again under the grid, which read as apology rather than candour.
    // It is down to a single sentence per card location. Do not delete the
    // sentence: the card carries a name, a face and a Verified badge, and without
    // it the page is showing invented inventory to someone deciding whether to
    // pay for access to that inventory.
    sampleCaption: `Illustrative. Not a real candidate or a real photograph. The database opens to US\u00A0firms in ${LAUNCH_EMPLOYER_SHORT}.`,
    profile: {
      name: "Arjun M.",
      photo: {
        src: "/images/portrait-m-1.jpg",
        alt: "Illustrative profile portrait",
      },
      verified: "Verified 14 Jun 2026",
      role: "US\u00A0tax preparer, 6 years",
      location: "Bengaluru, India",
      availability: "Full US\u00A0business hours",
      softwareLabel: "Software",
      software: ["QuickBooks Online", "Drake", "Lacerte"],
      returnsLabel: "US returns prepared",
      returns: ["Form\u00A01040", "1120\u2011S", "1065"],
      salaryLabel: "Expected compensation",
      salary: "$1,000\u20111,400",
      salarySuffix: "/mo",
    },
  },

  // Primary and secondary calls to action, reused across the page. One label per
  // intent: "Reserve founding access" is the nav button, the hero button, the
  // sticky bar and the closing CTA. A second wording for the same form would read
  // as a second offer.
  reserve: { label: "Reserve founding access", href: "/#reserve" },
  seeVetting: { label: "How we vet", href: "/#vetting" },
  // Rendered as a mailto in the components that use them (built from
  // CONTACT_EMAIL); no scheduling tool is wired up yet.
  bookCall: { label: "Book a hiring call" },
  discuss: { label: "Discuss your hiring need" },
  contactEmail: CONTACT_EMAIL,

  // Section 2: the objection, stated before the offer. Short, full-width,
  // directly under the hero.
  //
  // This deliberately does NOT lead with the agency markup. "Cut out the
  // middleman" is the accountant's argument (it is the pitch on /accountants);
  // a firm owner's first thought about an overseas hire is risk, and a page that
  // opens on price reads as though it has not understood the question. Price is
  // section 5, after the vetting has earned it.
  risk: {
    heading: "The hard part was never the cost.",
    beats: [
      "Someone you have never met, vouched for by nobody, working inside your client files.",
      "A résumé that claims Drake and UltraTax, with nothing behind the claim until a return comes back wrong in March.",
      "Client data leaving your systems under a confidentiality arrangement you never actually read.",
    ],
    pivot:
      "Every one of those is a vetting problem before it is a price problem. So that is where we start.",
  },

  /*
    Section 3: how candidates are vetted. The most important section on the page,
    and the longest, because "verified" is the entire product claim.

    Every item here describes a check that exists in the code today:
    lib/assessment/questions.ts holds a real 10-question bank, content/assessment.ts
    sets the 80-200 word writing prompt, and the confirmation dates come from
    lib/candidate/confirmationEvents.ts.

    No pass mark is published. The threshold enforced in lib/assessment/service.ts
    is a bare literal in two places and has moved before; a number printed here
    goes stale silently the next time it moves. "Candidates who fall short are not
    marked Verified" is true regardless of where the line sits.
  */
  vetting: {
    heading: "What Verified actually means here",
    intro:
      "Verified is not a label we put on a résumé. It is a set of checks a candidate has to pass, and every profile shows you the date each one was last confirmed.",
    steps: [
      {
        title: "An English writing assessment",
        body: "Candidates write 80 to 200 words about a real accounting problem they solved: the numbers, the software, the steps they took. It is their own writing, and it appears on the profile word for word, so you can read how someone explains their work before you spend an hour on a call.",
      },
      {
        title: "A 10\u2011question exam on US\u00A0tax and accounting",
        body: "1120\u2011S and 1065 filing rules, Form 941, Form 1099\u2011NEC, bank reconciliations, accrual recognition, and how US sales tax differs from GST. A person reviews every submission. Candidates who fall short are not marked Verified.",
      },
      {
        title: "Software verification",
        body: "QuickBooks, Drake, Lacerte, CCH, UltraTax. We record which tools a candidate has actually worked in and at what depth, rather than assuming everyone knows every platform.",
      },
      {
        title: "Returns-prepared history",
        body: "Which US returns they have prepared and in what volume: Form 1040, Form 1120\u2011S, Form 1065. Claims get tested in your interview, and candidates are told that before they make them.",
      },
      {
        title: "Confirmed availability, with a date",
        body: "Working hours, US overlap, and notice period, each carrying the date the candidate last confirmed it. A profile nobody has reconfirmed in months says so on its face.",
      },
    ],
    note: "Not every check is complete for every candidate. Each profile shows exactly what has been verified and when, so you can interview with the full picture rather than a badge.",
  },

  /*
    Section 4: what is in the database. Evidence, not a promise, and the strongest
    thing on the page.

    These are invented people. Names are first-name-plus-initial, which is also
    how a gated profile reads to a firm before an introduction is approved.

    `imageNote` is the one place the page says so, in one sentence, under the
    grid. It previously said it four times over (section intro, a caption under
    every card, here, and every alt text) which was clutter and read as hedging.

    What must not happen is it going to zero. A firm is looking at three faces,
    three Verified badges and three salary expectations under a heading that says
    what is in the database, while being asked to pay for access to that database.
    One quiet sentence is the difference between an illustration and a claim.
  */
  database: {
    heading: "What is in the database",
    intro:
      "Verified profiles, built from the checks above. This is how a gated profile reads before you request an introduction.",
    profiles: [
      {
        name: "Meera R.",
        photo: {
          src: "/images/portrait-f-1.jpg",
          alt: "Illustrative profile portrait",
        },
        verified: "Verified 02 Jul 2026",
        role: "Senior tax preparer, 8 years",
        location: "Chennai, India",
        availability: "Full US\u00A0business hours",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Drake", "UltraTax"],
        returnsLabel: "US returns prepared",
        returns: ["Form\u00A01040", "1120\u2011S"],
        salaryLabel: "Expected compensation",
        salary: "$1,600\u20112,100",
        salarySuffix: "/mo",
      },
      {
        name: "Nikhil D.",
        photo: {
          src: "/images/portrait-m-2.jpg",
          alt: "Illustrative profile portrait",
        },
        verified: "Verified 19 Jun 2026",
        role: "Bookkeeper and monthly close, 5 years",
        location: "Pune, India",
        availability: "Partial morning overlap",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Xero"],
        returnsLabel: "Core responsibilities",
        returns: ["Monthly close", "AP / AR", "Bank reconciliations"],
        salaryLabel: "Expected compensation",
        salary: "$650\u2011800",
        salarySuffix: "/mo",
      },
      {
        name: "Fatima Q.",
        photo: {
          src: "/images/portrait-f-2.jpg",
          alt: "Illustrative profile portrait",
        },
        verified: "Verified 28 Jun 2026",
        role: "Staff accountant, 4 years",
        location: "Hyderabad, India",
        availability: "Full US\u00A0business hours",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Lacerte", "CCH Axcess"],
        returnsLabel: "US returns prepared",
        returns: ["Form\u00A01065", "1120\u2011S"],
        salaryLabel: "Expected compensation",
        salary: "$850\u20111,150",
        salarySuffix: "/mo",
      },
    ],
    imageNote:
      "Illustrative. Not real candidates or real photographs. Compensation figures are typical of the bands we see, not quotes.",
    note: "Software names are the property of their owners. We are not affiliated with any of them.",
  },

  /*
    Section 5: pricing. Now that the vetting has been shown, the money argument
    is allowed to be made.

    Real numbers, not ranges: $1,440 a year for access, $2,400 once per hire,
    $720 a year for the founding cohort. Billing is annual only. The $120/month
    figure appears once, as arithmetic, and is explicitly not an option a firm can
    choose; if a monthly plan ever exists it is a pricing decision, not a copy
    decision, and it has to be added here deliberately.

    `arithmetic` is the line a partner scanning the section needs: what the fees
    cost against what the alternative costs. Deliberately flat. No percentage
    saved, no exclamation, no "pays for itself" claim, because the comparison
    depends entirely on numbers the firm controls and we do not.

    The staffing-rate range is marked illustrative in `arithmetic.caption`. It is
    what firms report paying, not a quote we can stand behind, and the difference
    matters if a partner ever puts this next to an actual invoice.

    The comparison below reuses MathBars from the worker page, reframed for a
    firm: of the $2,000 a month a firm pays an offshore agency, roughly $600
    reaches the person doing the work. That is a quality argument as much as a
    price one. Its $2,000 and $1,200 both sit inside the ranges `arithmetic`
    quotes, so the two do not contradict each other; move one and check the other.
  */
  pricing: {
    heading: "What it costs",
    intro:
      "Two numbers, and neither of them is a recurring cut of somebody's salary.",
    plans: [
      {
        title: "Annual database access",
        price: "$1,440",
        unit: "per firm, per year",
        body: "Search verified profiles, request introductions, and hire as many people as you need. The fee does not move with your headcount. Billed annually: there is no monthly plan, though it works out at $120 a month.",
      },
      {
        title: "A success fee per hire",
        price: "$2,400",
        unit: "once, per hire",
        body: "Payable when you hire someone. Waived in full if the hire does not reach 90\u00A0days.",
      },
      {
        title: "Founding cohort",
        price: "$720",
        unit: "per year, locked at reservation",
        body: "Half the published access fee, held for as long as you stay subscribed, whatever the price does later. Reserving now costs nothing and commits you to nothing.",
      },
    ],
    arithmetic: {
      body: "An offshore staffing seat runs about $2,000 to $2,500 a month. Hiring the same person directly runs about $1,000 to $1,400. Over a year that difference is roughly $7,000 to $18,000. A year of founding access plus one success fee comes to $3,120.",
      caption:
        "Staffing rates are illustrative of what firms report paying, not quotes. Your figures depend on the role, the experience, and what you and the accountant agree between you.",
    },
    termsLabel: "What that does not include",
    terms: [
      "No per-seat monthly markup. We never take a percentage of anyone's salary, at any point.",
      "No exclusivity. Hire through us, hire elsewhere, or both.",
      "You employ or contract the accountant directly. We are not the employer and not a party to your agreement.",
    ],
    comparison: {
      agency: {
        label: "Through an offshore staffing agency",
        firmPays: "your firm pays $2,000/mo, every month",
        you: { amount: "$600", label: "reaches the accountant", pct: 30 },
        keeps: {
          amount: "$1,400",
          sub: "agency margin, for as long as they work for you",
          pct: 70,
        },
      },
      direct: {
        label: "Hired directly",
        firmPays: "your firm pays $1,200/mo",
        you: {
          amount: "$1,200",
          label: "all of it reaches the accountant",
          pct: 60,
        },
        saves: { amount: "$800/mo stays in your firm", pct: 40 },
      },
      caption:
        "Illustrative, based on a $2,000 monthly agency placement. Your figures depend on the role, the experience, and what you and the accountant agree between you.",
    },
  },

  /*
    Section 6: the paperwork around a cross-border hire.

    [TODO: LEGAL REVIEW] REQUIRED BEFORE THIS SHIPS.

    Every string in `edges` describes a document we say we supply, and touches
    client-consent and cross-border payment. It needs sign-off from an actual
    advisor before it goes live. content/legal.ts carries the same flag and is
    still an unreviewed draft, and the `confidentiality` item in employerFaq
    makes related claims that have to be reviewed alongside these.

    The framing is deliberately narrow and must stay that way: these are
    starting points a firm takes to its own advisors, never a representation
    that using them satisfies anything. Language to keep out of this section:
    "compliant", "meets", "satisfies", "covers you", "ensures", "protects you",
    and anything else that implies legal sufficiency. Every item says what the
    document is; none of them says what it achieves.
  */
  edges: {
    heading: "What we hand you around the edges",
    intro:
      "Hiring someone in another country involves paperwork you should not have to draft from a blank page. These are starting points for your own advisors to review, not legal advice, and using them does not by itself satisfy any obligation your firm has.",
    items: [
      {
        title: "Contractor agreement template",
        body: "A draft agreement for engaging an accountant in India: scope, payment terms, ownership of work product, and termination. A starting point to mark up, not a form to sign as-is.",
      },
      {
        title: "Confidentiality and data-handling annexure",
        body: "Draft clauses covering client data: access limits, device and password rules, retention, and what happens to everything at the end of the engagement.",
      },
      {
        title: "Client-consent language",
        body: "Draft wording for telling clients that a preparer outside the US may work on their file. Whether it meets your obligations under IRS\u00A0Section\u00A07216 or your professional standards is a question for your advisors, not for us.",
      },
      {
        title: "Paying an individual in India",
        body: "A written guide to how US\u00A0firms do this in practice: the payment rails firms actually use, the documentation worth keeping, and the questions to put to your own accountant.",
      },
    ],
    disclaimer:
      "Employment, contractor classification, taxpayer-data consent, and professional obligations vary by firm and jurisdiction. These templates are a starting point and are not legal or tax advice. We make no representation that they are sufficient for your circumstances, and your firm remains responsible for its own compliance. Have your own advisors review anything here before you rely on it.",
  },

  /*
    Section 7: where we actually are. Mirrors the worker page's "Where we are
    right now" in both structure and nerve.

    A firm owner who is evaluating us will read /accountants too, and that page
    tells accountants there is no job waiting for them today. Saying something
    softer here than we say there would be the one thing that discredits both
    pages at once.
  */
  honest: {
    h2: "Where we are right now",
    lede: "The same straight answer we give accountants, on a page you can reach from ours in one click.",
    body: [
      `AccountingTalent.in is new. We are building the verified candidate pool first, and that part is real: applications are open, assessments are being marked, and profiles are being built today. The database opens to US firms in ${LAUNCH_EMPLOYER}.`,
    ],
    admission: "You cannot hire anyone through us today.",
    promiseIntro: "What reserving founding access gets you:",
    promises: [
      {
        title: "A locked founding rate",
        body: "The rate you reserve at is the rate you keep for as long as you stay subscribed, whatever the published price does afterward.",
      },
      {
        title: "First access at launch",
        body: "Founding firms get into the database before it opens more widely, while the pool is still unpicked.",
      },
      {
        title: "A monthly update, either way",
        body: "One short email a month on where the pool stands and what is being verified, including the months when there is nothing new to report.",
      },
      {
        title: "Nothing to pay now",
        body: "Reserving is a form, not a contract. There is no card to enter, nothing to cancel, and no obligation to subscribe when we open.",
      },
    ],
  },

  /*
    Section 8: the intake form (#reserve). The page's one conversion, and the only
    thing on it that we are actually measuring.

    Field config is data so the option lists tune without touching the component.
    Keys match the EmployerLeadInput shape in app/actions.ts and the columns in
    employer_leads (see supabase/migrations/0020_employer_leads_firm_intake.sql
    for firm_size, hires_12mo and roles).

    Field ORDER is qualifying-questions-first, and it is deliberate: firm name,
    work email, size, volume, timing, budget, and only then the personal and
    open-ended fields. Someone who abandons halfway has still told us the things
    the smoke test exists to learn. Asking their name first is politeness that
    costs data.

    `budget` runs full width rather than sharing a row. It is the single field
    this test is really for, and a half-width select in the middle of a grid is
    the one people skip.

    `reassurance` renders under the submit button. It answers the three questions
    a partner has with their cursor over it: when do I hear back, what does this
    cost me now, and am I committing to anything.
  */
  brief: {
    heading: "Reserve founding access",
    // Deliberately not "six questions" or any other count. The form has ten
    // fields (five required), and a number the reader can disprove by looking at
    // the thing directly underneath it costs more trust than the reassurance buys.
    sub: "A few questions about your firm. They tell us what to build the pool toward, and they lock your founding rate.",
    submit: "Reserve founding access",
    submitting: "Sending...",
    reassurance: `We will be in touch when the database opens to US\u00A0firms in ${LAUNCH_EMPLOYER_SHORT}. Nothing to pay to reserve a place, and no obligation to subscribe when we open.`,
    requiredNote: "A star marks a required field.",
    success: {
      heading: "You are on the founding list.",
      lede: `Thank you. Your place is reserved and your founding rate of $720 a year is held for you.`,
      body: [
        `The database opens to US\u00A0firms in ${LAUNCH_EMPLOYER}. You will hear from us then, and once a month until then with where the pool stands.`,
        "There is nothing to pay now and no obligation to subscribe when we open.",
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
        label: "Hires in the next 12 months",
        required: false,
        options: ["1", "2 to 3", "4 to 6", "7+", "Not sure yet"],
      },
      start_timeframe: {
        label: "When would you want them",
        required: false,
        options: ["Busy season 2027", "Mid\u20112027", "Just exploring"],
      },
      budget: {
        label: "Budget per hire",
        required: false,
        help: "Annual, in US dollars. A range is fine.",
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
    heading: `The database opens to US firms in ${LAUNCH_EMPLOYER_SHORT}. Reserve your place in it.`,
    sub: "Founding firms lock their rate now and get in before the pool is picked over.",
  },

  // FAQ heading (items live in content/faq.ts as employerFaq).
  faqHeading: "Questions firms ask us",

  // Shown under primary button CTAs.
  trustRow: "No monthly markup. No exclusivity. You hire directly.",

  // Mobile-only sticky CTA bar. The label is short because the bar is one flex
  // row on a 375px screen: at "Hiring for busy season 2027?" the label took the
  // width the button needed and "Reserve access" wrapped to two lines.
  stickyBar: {
    label: "Hiring for 2027?",
    cta: "Reserve access",
  },

  // ---------------------------------------------------------------------------
  // Dormant. Not rendered on this page. Kept because the FoundingForm component
  // and the saveFirmConcierge option lists in app/actions.ts still reference these
  // keys. Safe to delete once the firm_waitlist path is retired.
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
