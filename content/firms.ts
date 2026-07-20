import { CONTACT_EMAIL, LAUNCH_EMPLOYER, POOL_APPLICANT_COUNT } from "./site";

/*
  The employer page, top to bottom. Every string the /employers route renders
  resolves from here, the same content-driven discipline the homepage uses, so a
  copy edit is a data change rather than a JSX rewrite.

  The employer page can say "Q4 2026": US readers parse that as calendar Q4.
  Worker-facing pages must not, because the Indian financial year runs April to
  March and Q4 reads as January to March 2027 there.

  Dash convention, held to throughout: no em dashes and no en-dash separators.
  Ranges use a hyphen ("Sep-Oct", "$500-800"); a pause that an em dash would
  carry becomes a period, comma, colon, or parentheses. The   (non-breaking
  space) and ‑ (non-breaking hyphen) escapes weld a number or a compound to
  its neighbour so a line never ends on a dangling "US" or splits "1120-S".
*/
export const firms = {
  // Section 1: hero.
  hero: {
    h1: "Hire India's accounting talent. Directly.",
    sub: "A verified database of Indian bookkeepers, staff accountants, and US tax preparers. Every profile has passed a written‑English assessment and a US accounting exam, and shows the software they work in and the returns they've actually prepared. No agency markup. No per‑hire fees.",
    // The pull-line states the whole model in one breath, set as its own serif
    // navy line on the page.
    pullLine: "You search, you interview, you hire, you pay them directly.",
    subNote: "Flat subscription. Cancel anytime.",
  },

  // Section 2: the founding-firm card (#founding). Replaces the old waitlist
  // card. The card is the page's one conversion, so it carries the offer, the
  // form, and the post-submit concierge questions.
  founding: {
    eyebrow: "Founding firms",
    headline: "Founding firms get first pick of the pool.",
    intro: `The database opens to every US firm in ${LAUNCH_EMPLOYER}. Founding firms get in earlier, and on better terms:`,
    points: [
      {
        title: "Search first.",
        body: "Day‑one access to the verified pool, before it gets picked over.",
      },
      {
        title: "50% off year one.",
        body: "$49/month instead of $99. Cancel anytime.",
      },
      {
        title: "Hiring before launch?",
        body: "Tell us the role and we'll hand‑match you with verified candidates now. You interview and hire exactly as you would at launch, we just do the searching for you until the doors open.",
      },
    ],
    scarcity: "Founding pricing is limited to the first 50 firms.",
    label: "Work email",
    placeholder: "you@yourfirm.com",
    cta: "Become a founding firm",
    microcopy:
      "One short email a month: new verified profiles and pool salary data, nothing else. No sales calls. Unsubscribe anytime.",

    // Post-submit concierge. After the email is accepted the card swaps to these
    // two single-select questions, which feed the hand-match pipeline. Both are
    // optional; each tap saves that answer.
    concierge: {
      successHeading: "You're in.",
      intro: "One question while you're here, it helps us match you first:",
      roleQ: "What role would you hire first?",
      roleOptions: [
        "Bookkeeper",
        "Tax preparer",
        "Staff accountant",
        "Senior / reviewer",
        "Not sure yet",
      ],
      timingQ: "When?",
      timingOptions: ["Before tax season", "At launch", "Just watching for now"],
      skip: "Skip",
      // Selecting this timing shows the closing line below.
      beforeSeasonValue: "Before tax season",
      beforeSeasonClose:
        "We'll email you within a few days with hand‑matched profiles.",
    },
  },

  // Section 3: why now (#timeline).
  timeline: {
    heading: "Tax season doesn't wait for launch day.",
    body: "A direct hire isn't instant. Realistically: a week or two to search and interview, then four to six weeks of onboarding into your software, your workpapers, and your way of doing things. Count backwards from January and the math is clear: a preparer who's productive for busy season gets found in the fall.",
    steps: [
      {
        when: "Sep-Oct",
        text: "Search the pool, interview two or three candidates",
      },
      { when: "Oct-Nov", text: "Hire, onboard, train on your systems" },
      {
        when: "Dec",
        text: "First live work: extensions, cleanup, year‑end close",
      },
      { when: "Jan", text: "Full speed for busy season" },
    ],
    closing:
      "One more thing worth knowing: every profile in the pool can be hired exactly once. When a firm hires someone, the profile comes down. Founding firms search first.",
  },

  // Section 4: the pool (#pool). Momentum line, process line, then a grid of
  // clearly-labelled sample profiles.
  pool: {
    heading: "The pool is filling before the doors open.",
    momentum: `${POOL_APPLICANT_COUNT} accountants applied in the first days, before a single US firm had been announced. Applications are open and the pool grows weekly.`,
    process:
      "None of them lists without passing the written‑English assessment and the US accounting exam. Firms browse the passes, not the pile.",
    // v1 caption, while the grid shows samples. When real consented profiles
    // replace the samples, swap `sampleCaption` for `realCaption` below and pass
    // `sample={false}` to the cards. Never label a fictional card "a verified
    // profile from the pool".
    sampleCaption:
      "Sample profiles. This is the format every verified profile follows. Real profiles open to founding firms first.",
    realCaption:
      "From the verified pool. Names abbreviated; full profiles open to founding firms first.",

    // Fictional samples until consented profiles land, each with a stock
    // portrait (gender-matched to the name) and the "sample" caption below the
    // grid keeping it honest. The role line carries credential and years the way
    // the homepage card does, so no per-field divergence is needed. Salaries sit
    // inside the rate bands.
    samples: [
      {
        name: "Arjun S.",
        photo: { src: "/images/portrait-m-1.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Tax preparer · CA Inter · 4 yrs",
        location: "Ahmedabad · US‑overlap hours",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Drake", "Lacerte"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1040", "1120‑S", "1065"],
        salaryLabel: "Expected salary",
        salary: "$900‑1,200",
        salarySuffix: "/mo",
      },
      {
        name: "Priya M.",
        photo: { src: "/images/portrait-f-1.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Bookkeeper · CMA · 5 yrs",
        location: "Kochi · IST + overnight turnaround",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Xero", "Bill.com"],
        returnsLabel: "Bookkeeping scope",
        returns: ["Monthly close", "Catch‑up / cleanup", "AP & AR"],
        salaryLabel: "Expected salary",
        salary: "$700‑950",
        salarySuffix: "/mo",
      },
      {
        name: "Rahul K.",
        photo: { src: "/images/portrait-m-2.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Senior accountant · CA · 7 yrs",
        location: "Pune · US‑overlap hours",
        softwareLabel: "Software",
        software: ["QuickBooks", "CCH Axcess", "UltraTax"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1040", "1120", "1065"],
        salaryLabel: "Expected salary",
        salary: "$1,600‑2,100",
        salarySuffix: "/mo",
      },
      {
        name: "Sneha R.",
        photo: { src: "/images/portrait-f-2.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Staff accountant · M.Com · 3 yrs",
        location: "Bengaluru · IST + overnight turnaround",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Xero"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1040", "1120‑S"],
        salaryLabel: "Expected salary",
        salary: "$800‑1,100",
        salarySuffix: "/mo",
      },
      {
        name: "Vikram D.",
        photo: { src: "/images/portrait-m-3.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Tax preparer · CA Inter · 5 yrs",
        location: "Jaipur · US‑overlap hours",
        softwareLabel: "Software",
        software: ["Drake", "Lacerte", "ProSeries"],
        returnsLabel: "US returns prepared",
        returns: ["Form 1040", "1065"],
        salaryLabel: "Expected salary",
        salary: "$1,000‑1,400",
        salarySuffix: "/mo",
      },
      {
        name: "Ananya P.",
        photo: { src: "/images/portrait-f-3.jpg", alt: "Sample profile portrait" },
        verified: "English + US tax assessment",
        role: "Bookkeeper · B.Com · 4 yrs",
        location: "Indore · IST + overnight turnaround",
        softwareLabel: "Software",
        software: ["QuickBooks Online", "Dext", "Gusto payroll"],
        returnsLabel: "Bookkeeping scope",
        returns: ["Monthly close", "Payroll", "Sales tax filings"],
        salaryLabel: "Expected salary",
        salary: "$650‑900",
        salarySuffix: "/mo",
      },
    ],
  },

  // Section 5: the proof triad. Three blocks with rule dividers. Block 2 embeds
  // the bar chart (the same component the homepage uses) from the employer's
  // point of view, plus the salary bands.
  proof: {
    blocks: [
      {
        title: "The talent is real",
        body: "Every listed profile passes a written‑English assessment and a US accounting exam. Filter by QuickBooks, Xero, Drake, Lacerte, and CCH experience, and by the forms they've actually prepared: 1040, 1120‑S, 1065.",
      },
      {
        title: "The math is obvious. And it compounds.",
        body: [
          "Offshore agencies bill $1,200 to $2,500 per person per month, with recruiting, office, and margin baked in. Per the AICPA, a quarter of US firms already offshore: this is the same work, without the middleman.",
          "But the bigger number is the second bar. A direct hire keeps everything you pay, roughly double the take‑home of agency staff sitting at the same desk. Underpaid people leave after one busy season. Well‑paid people stay. The most expensive thing in offshoring was never the salary; it's retraining someone new every January.",
        ],
        // Employer point of view of the homepage bar chart. Same scale: 100% of
        // the track is $2,000, every width is amount / 2000.
        comparison: {
          agency: {
            label: "Through an agency",
            firmPays: "You pay $2,000/mo",
            you: {
              amount: "$600",
              label: "your accountant receives",
              pct: 30,
            },
            keeps: {
              amount: "the middle keeps $1,400",
              sub: "recruiting · office · margin",
              pct: 70,
            },
          },
          direct: {
            label: "Hired directly",
            firmPays: "You pay $1,200/mo",
            you: {
              amount: "$1,200",
              label: "your accountant receives",
              pct: 60,
            },
            saves: { amount: "you save $800/mo", pct: 40 },
          },
          caption:
            "Illustrative figures based on typical offshore staffing rates · bars drawn to scale ($2,000 = full width).",
        },
        salaryChips: [
          "$500-800 · bookkeepers",
          "$800-1,500 · experienced accountants and tax preparers",
          "$1,500-2,500+ · senior and reviewer roles",
        ],
        salaryNote:
          "Full-time monthly salaries, paid by you, to them. Typical, not guaranteed.",
      },
      {
        title: "Compliance handled",
        body: "Section 7216 consent templates, engagement‑letter and contractor‑agreement language, a client‑data access checklist, and payment guidance that satisfies Indian remittance paperwork. Built in, not your problem.",
      },
    ],
  },

  // Section 6: how hiring works (#how-it-works). Three steps in the homepage
  // step style. This page's nav "How it works" item points here.
  hiring: {
    heading: "How hiring works",
    steps: [
      {
        title: "Search",
        body: "Filter the verified pool by software, forms prepared, credential, experience, salary range, and working hours. Every profile is structured the same way, so comparing five candidates takes minutes, not a folder of resumes.",
      },
      {
        title: "Interview",
        body: "Contact candidates directly and run your normal process. No coordinator in the middle, no markup on the other side of the table. Most firms interview two or three before choosing.",
      },
      {
        title: "Hire and pay directly",
        body: "You make the offer, you set the terms, they work for you. We hand you the paperwork: §7216 consent, contractor‑agreement and engagement‑letter language, and payment guidance (Wise or international transfer, with the Indian remittance paperwork covered).",
      },
    ],
  },

  // Section 7: what your hire actually does. Two quiet lists and a closing line.
  scope: {
    heading: "What your hire actually does",
    movesLabel: "Moves to your hire",
    moves: [
      "1040, 1120‑S, and 1065 prep",
      "Monthly bookkeeping and close",
      "Cleanup and catch‑up projects",
      "Workpaper prep and tie‑outs",
      "AP/AR and payroll support",
    ],
    staysLabel: "Stays with you",
    stays: [
      "Review and sign‑off",
      "Client relationships",
      "Pricing and advisory",
      "Final judgment",
    ],
    closing:
      "Production moves. Judgment stays. That's the whole model, and it's how a ten‑person firm stops turning away 1040 work without adding a tenth US salary.",
  },

  // Section 8: who's building this. A note, not an About page. No photo yet; the
  // page leaves a slot for one.
  builder: {
    heading: "Who's building this",
    photo: {
      src: "/images/martin-headshot-bw.jpg",
      alt: "Martin Casey, founder of AccountingTalent.",
    },
    name: "Martin Casey",
    role: "Founder, AccountingTalent",
    body: [
      "I'm Martin Casey. I build software for a living, not a staffing agency, and that's the point. AccountingTalent exists because the offshore math bothered me: US firms paying $2,000 a month for accountants who see $600 of it.",
      "Both sides deserve a better deal, and a verified direct‑hire database (the model that's worked for 15 years in the Philippines) is the simplest way to give it to them.",
    ],
    contactLead: "If you run a firm and have questions, write to me:",
    email: CONTACT_EMAIL,
    contactTail: "You'll get me, not a sales team.",
    linkedin: {
      href: "https://www.linkedin.com/company/142887530",
      label: "AccountingTalent on LinkedIn",
    },
  },

  // Section 10: final CTA band. Mirrors the homepage closer.
  finalCta: {
    heading: "The database opens in Q4. Founding firms don't wait that long.",
    sub: "$49/month for year one · first access to the verified pool · hand‑matched before launch if you're hiring now · limited to the first 50 firms.",
    button: { label: "Become a founding firm", href: "#founding" },
  },

  // Section 9 heading (the FAQ items live in content/faq.ts as employerFaq).
  faqHeading: "Questions firms ask us",
} as const;
