import { CONTACT_EMAIL } from "./site";

/*
  The employer page, top to bottom. Every string the /employers route renders
  resolves from here, the same content-driven discipline the homepage uses, so a
  copy edit is a data change rather than a JSX rewrite.

  The model this page sells is concierge matching, open now: a firm tells us the
  role, we send a shortlist of assessed candidates within 72 hours, they
  interview and hire directly, and pay only when they hire. There is no
  self-service database, no subscription, and no launch-date gate in this copy. A
  self-service candidate search may follow later; it is not the offer here.

  American English throughout (this audience is US accounting firms).

  Dash convention, held to throughout: no em dashes and no en-dash separators.
  Ranges use "to" or a hyphen; a pause that an em dash would carry becomes a
  period, comma, colon, or parentheses. The   (non-breaking space) escapes
  weld a number or a compound to its neighbor so a line never ends on a dangling
  "US" or "72".

  `founding` and `scope` are kept intact: `founding` still backs the dormant
  FoundingForm and the saveFirmConcierge option lists in app/actions.ts; `scope`
  backs HireScope.
*/
export const firms = {
  // Section 1: hero.
  hero: {
    eyebrow: "Direct hiring for US accounting firms",
    h1: "Hire an assessed Indian accountant without the agency markup",
    sub: "Tell us the role, software, and experience you need. We'll introduce you to a shortlist of matched accounting professionals within 72 hours. Interview and hire them directly.",
    trustLine: "No upfront fee. Direct hire. Pay only when you hire.",
    // Right-column card: the offer stated plainly, replacing the old email form.
    promise: {
      title: "What you get",
      points: [
        "A shortlist of matched candidates within 72 hours",
        "Every candidate assessed for accounting knowledge, written English, and relevant experience",
        "Full-time professionals available for US-overlap hours",
        "You interview directly and pay only when you hire",
      ],
    },
  },

  // Primary and secondary calls to action, reused across the page.
  getMatched: { label: "Get matched candidates", href: "#get-matched" },
  seeHow: { label: "See how it works", href: "#how-it-works" },
  // Rendered as a mailto in the components that use them (built from
  // CONTACT_EMAIL); no scheduling tool is wired up yet.
  bookCall: { label: "Book a hiring call" },
  discuss: { label: "Discuss your hiring need" },
  contactEmail: CONTACT_EMAIL,

  // Section 2a: pain mirror. Short, full-width, directly under the hero.
  painMirror: {
    heading: "You know the season you just had.",
    beats: [
      "Returns you declined because nobody was free to prepare them.",
      "The senior you offered $85K who took $95K across town.",
      'The agency hire you spent three months training, reassigned in a "reallocation," training gone with them.',
    ],
    pivot:
      "The shortage isn't easing, and the agency keeps its margin. There's a better way to staff the work.",
  },

  // Section 2b: value proposition with benefit cards.
  benefits: {
    heading: "Add capacity without adding another US-sized salary",
    intro:
      "Access experienced accounting professionals who can support bookkeeping, tax preparation, reconciliations, workpapers, monthly close, and other repeatable accounting workflows.",
    items: [
      {
        title: "Assessed talent",
        body: "Candidates are screened for accounting knowledge, communication, and relevant experience.",
      },
      {
        title: "Relevant experience",
        body: "Match by software, work type, tax forms, seniority, and working-hour availability.",
      },
      {
        title: "Direct employment relationship",
        body: "Interview and engage the professional directly rather than paying an ongoing salary markup.",
      },
      {
        title: "Lower hiring risk",
        body: "Receive a replacement shortlist if the original placement does not work out during the guarantee period.",
      },
    ],
  },

  // Section 3: how it works (#how-it-works). This page's nav "How it works" item
  // points here.
  hiring: {
    heading: "How it works",
    steps: [
      {
        title: "Tell us what you need",
        body: "Share the role, software, experience, schedule, and budget.",
      },
      {
        title: "Receive a shortlist",
        body: "We identify and present the strongest matching candidates within 72 hours.",
      },
      {
        title: "Interview directly",
        body: "Meet candidates, review their experience, and choose who fits your firm.",
      },
      {
        title: "Hire with confidence",
        body: "Agree on compensation directly and pay AccountingTalent only after a successful hire.",
      },
    ],
  },

  // The employer brief (#get-matched): the page's primary conversion. Field
  // config is data so options tune without touching the component. Keys match
  // the EmployerLeadInput shape in app/actions.ts.
  brief: {
    heading: "Tell us who you need",
    sub: "Share your requirements and we'll identify the strongest available candidates for your firm.",
    submit: "Request candidate matches",
    submitting: "Sending...",
    requiredNote: "A star marks a required field.",
    success: {
      heading: "Your brief is in.",
      body: "We'll review your requirements and come back within 72 hours with a shortlist of matched candidates. Keep an eye on your inbox.",
    },
    genericError: "Something went wrong. Please try again.",
    fields: {
      full_name: {
        label: "Your name",
        required: true,
        placeholder: "Jane Cooper",
      },
      work_email: {
        label: "Work email",
        required: true,
        placeholder: "you@yourfirm.com",
      },
      firm_name: {
        label: "Firm name",
        required: true,
        placeholder: "Cooper & Associates CPA",
      },
      firm_website: {
        label: "Firm website",
        required: false,
        placeholder: "yourfirm.com",
      },
      role: {
        label: "Role you're hiring for",
        required: true,
        options: [
          "Bookkeeper",
          "Tax preparer",
          "Staff accountant",
          "Senior accountant",
          "AP / AR specialist",
          "Payroll specialist",
          "Audit support",
          "Not sure yet",
        ],
      },
      experience_required: {
        label: "Accounting experience",
        required: false,
        options: ["No preference", "1 to 2 years", "3 to 5 years", "5+ years"],
      },
      software: {
        label: "Software they should know",
        required: false,
        help: "Select any that apply.",
        options: [
          "QuickBooks Online",
          "Xero",
          "Drake",
          "Lacerte",
          "UltraTax",
          "ProSeries",
          "NetSuite",
          "Other",
        ],
      },
      tax_forms: {
        label: "Tax forms or work types",
        required: false,
        help: "Where relevant.",
        options: [
          "1040 individual",
          "1120 / 1120-S corporate",
          "1065 partnership",
          "Bookkeeping and close",
          "Payroll",
          "AP / AR",
          "Audit support",
          "Not tax-specific",
        ],
      },
      hours_overlap: {
        label: "Preferred US working-hour overlap",
        required: false,
        options: [
          "Full US business hours",
          "Partial morning overlap",
          "Partial afternoon overlap",
          "Flexible / overnight turnaround",
        ],
      },
      budget: {
        label: "Approximate monthly budget",
        required: false,
        options: [
          "$500 to $1,000 / mo",
          "$1,000 to $1,500 / mo",
          "$1,500 to $2,500 / mo",
          "$2,500+ / mo",
          "Not sure yet",
        ],
      },
      start_timeframe: {
        label: "Desired start date",
        required: false,
        options: [
          "As soon as possible",
          "Within 2 to 4 weeks",
          "1 to 2 months",
          "Just exploring",
        ],
      },
      details: {
        label: "Anything else?",
        required: false,
        help: "Optional.",
        placeholder:
          "Client types, must-haves, the tools your firm runs, anything that helps us match.",
      },
    },
  },

  // Section 4: roles available (#roles). Talent categories and the software
  // candidates commonly work in. Replaces the old sample-profile grid.
  roles: {
    heading: "Roles we place",
    intro:
      "Concierge matching is open now for US firms hiring across the accounting workflow.",
    categories: [
      "US tax preparers",
      "Bookkeepers",
      "Staff accountants",
      "Senior accountants",
      "Accounts payable and receivable specialists",
      "Payroll specialists",
      "Audit support professionals",
      "Accounting operations staff",
    ],
    softwareLabel: "Software our candidates work in",
    software: [
      "QuickBooks Online",
      "Xero",
      "Drake",
      "Lacerte",
      "UltraTax",
      "ProSeries",
      "NetSuite",
    ],
    softwareNote:
      "Experience varies by candidate. Tell us the tools your firm runs and we match to them, rather than assuming everyone knows every platform.",
  },

  // Section 5: what your hire actually does. Two quiet lists and a closing line.
  scope: {
    heading: "What your hire actually does",
    movesLabel: "Moves to your hire",
    moves: [
      "1040, 1120-S, and 1065 prep",
      "Monthly bookkeeping and close",
      "Cleanup and catch-up projects",
      "Workpaper prep and tie-outs",
      "AP/AR and payroll support",
    ],
    staysLabel: "Stays with you",
    stays: [
      "Review and sign-off",
      "Client relationships",
      "Pricing and advisory",
      "Final judgment",
    ],
    closing:
      "Production moves. Judgment stays. That's how a ten-person firm stops turning away 1040 work without adding a tenth US salary.",
  },

  // Section 6: candidate quality and assessment. Careful "may include" wording:
  // not every check is completed for every candidate.
  assessment: {
    heading: "More than a résumé database",
    intro:
      "Before we introduce a candidate, we look past the résumé. Depending on the role and how far a candidate has progressed, our review may include:",
    dimensions: [
      "Written English",
      "Accounting knowledge",
      "Relevant software experience",
      "US accounting or tax experience",
      "Work history",
      "Availability and working-hour overlap",
      "Compensation expectations",
      "References or identity verification, where completed",
    ],
    note: "Not every check applies to every candidate. We tell you what has been verified for the people on your shortlist, so you can interview with the full picture.",
  },

  // Section 7: live talent snapshot. The count is read from the database at
  // render (see TalentSnapshot); the copy here is the framing only, never a
  // hard-coded figure.
  snapshot: {
    heading: "The talent pool, right now",
    intro:
      "Applications from accounting professionals across India, and the pool grows every week.",
    totalLabel: "accounting professionals applied",
    fallback: "Applications are open and the pool grows every week.",
  },

  // Section 8: economics. A balanced comparison, no published fee.
  economics: {
    heading: "Build offshore capacity without a permanent agency margin",
    intro:
      "Offshore staffing agencies add a recurring markup on top of the salary, for as long as the person works for you. Direct hiring keeps that margin in your firm.",
    traditional: {
      label: "Traditional staffing model",
      points: [
        "Ongoing agency markup on every hour worked",
        "Limited visibility into what the worker is actually paid",
        "Less direct ownership of the relationship",
      ],
    },
    direct: {
      label: "AccountingTalent direct-hire model",
      points: [
        "Transparent compensation, agreed directly with the accountant",
        "A direct relationship with the person doing the work",
        "A one-time success fee, paid only when you hire",
        "No recurring percentage added to the salary",
      ],
    },
    pricingNote:
      "Introductory success-fee pricing is available for early hiring partners.",
  },

  // Section 9: security and compliance. Acknowledges concerns, claims no legal or
  // tax advice, and carries the required disclaimer.
  security: {
    heading: "Designed for responsible remote hiring",
    intro:
      "Hiring a remote accountant is routine for US firms, and it works best with the basics in place. As you would with any remote staff, your firm should establish appropriate:",
    items: [
      "Confidentiality agreements",
      "System access controls",
      "Multi-factor authentication",
      "Device and password policies",
      "Client-consent procedures where required",
      "Data-handling practices",
      "Worker-classification arrangements",
    ],
    disclaimer:
      "Employment, contractor classification, taxpayer-data consent, and professional obligations vary by firm and jurisdiction. Employers should obtain advice appropriate to their circumstances.",
  },

  // Section 10: who's building this. A note, not an About page.
  builder: {
    heading: "Who's building this",
    photo: {
      src: "/images/martin-headshot.jpg",
      alt: "Martin Casey, founder of AccountingTalent.",
    },
    name: "Martin Casey",
    role: "Founder, AccountingTalent",
    body: [
      "I'm Martin Casey. I build software for a living, not a staffing agency, and that's the point. AccountingTalent exists because the offshore math bothered me: US firms paying $2,000 a month for accountants who see $600 of it.",
      "Both sides deserve a better deal. We match you with assessed candidates, you interview and hire them directly, and nobody skims a permanent margin off the salary. That's the whole idea.",
    ],
    contactLead: "If you run a firm and have questions, write to me:",
    email: CONTACT_EMAIL,
    contactTail: "You'll get me, not a sales team.",
    linkedin: {
      href: "https://www.linkedin.com/company/142887530",
      label: "AccountingTalent on LinkedIn",
    },
  },

  // Final CTA band (navy).
  finalCta: {
    heading: "Tell us the role. We'll find the match.",
    sub: "Share your hiring requirements and receive a shortlist of relevant Indian accounting professionals.",
  },

  // FAQ heading (items live in content/faq.ts as employerFaq).
  faqHeading: "Questions firms ask us",

  // Shown under primary button CTAs.
  trustRow: "No upfront fee. Direct hire. Pay only when you hire.",

  // Mobile-only sticky CTA bar.
  stickyBar: {
    label: "Hiring? Get matched candidates.",
    cta: "Get matched",
  },

  // ---------------------------------------------------------------------------
  // Dormant. Not rendered on the concierge page. Kept because the FoundingForm
  // component and the saveFirmConcierge option lists in app/actions.ts still
  // reference these keys. Safe to delete once the firm_waitlist path is retired.
  founding: {
    eyebrow: "Founding firms",
    headline: "Founding firms get first pick of the pool.",
    intro:
      "Founding firms get in earlier, and on better terms:",
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
