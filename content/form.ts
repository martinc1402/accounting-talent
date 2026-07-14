/*
  The 19 questions from stage1-application-form-spec.md, verbatim in intent.
  This file is the single source of truth: it drives the form UI, the Zod
  schema in lib/schema.ts, the scoring rules in lib/scoring.ts, and the
  Supabase column list. Adding a question here is the only edit needed.

  One question per screen, per the spec. Single-selects auto-advance on tap,
  which is what keeps 19 screens inside the promised three minutes on a phone.
*/

export type Answers = Record<string, string | string[] | undefined>;

export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "city"
  | "select"
  | "multiselect"
  | "checkgate"
  | "consent";

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  placeholder?: string;
  options?: readonly string[];
  optional?: boolean;
  /** Question is skipped entirely when this returns false. */
  showIf?: (a: Answers) => boolean;
};

const workedOnUsClients = (a: Answers) =>
  a.us_experience === "Yes, I currently work on US\u00A0clients" ||
  a.us_experience === "Yes, I have in the past";

export const QUESTIONS: readonly Question[] = [
  // Section A. Identity and contact.
  {
    id: "full_name",
    type: "text",
    label: "What's your full name?",
    placeholder: "As it appears on your PAN or professional records",
  },
  {
    id: "email",
    type: "email",
    label: "What's your email address?",
    help: "We send a verification link here. Unverified applications are not reviewed.",
    placeholder: "you@example.com",
  },
  {
    id: "whatsapp",
    type: "tel",
    label: "What's your WhatsApp number?",
    help: "This is how we reach you about your skills assessment.",
    placeholder: "+91 98765 43210",
  },
  {
    id: "city",
    type: "city",
    label: "Which city do you live in?",
    help: "Start typing to search. Employers don't filter on this, we use it to understand where our applicants come from.",
    placeholder: "Search for your city",
  },
  {
    id: "linkedin",
    type: "url",
    label: "Your LinkedIn profile",
    help: "Optional, but a real LinkedIn with accounting history strengthens your profile.",
    placeholder: "linkedin.com/in/yourname",
    optional: true,
  },

  // Section B. Qualification and experience.
  {
    id: "qualification",
    type: "select",
    label: "What's your highest accounting qualification?",
    options: [
      "Chartered Accountant (ICAI member)",
      "CA Final student / CA\u00A0Inter cleared",
      "CMA (ICMAI or US\u00A0CMA)",
      "ACCA",
      "US\u00A0CPA / EA (Enrolled Agent)",
      "M.Com / MBA Finance",
      "B.Com",
      "Other / none of these",
    ],
  },
  {
    id: "experience_years",
    type: "select",
    label: "How many years of professional accounting experience do you have?",
    options: [
      "Less than 1 year",
      "1 to 3 years",
      "3 to 5 years",
      "5 to 10 years",
      "More than 10 years",
    ],
  },
  {
    id: "us_experience",
    type: "select",
    label: "Have you worked on US\u00A0or other foreign-client accounting?",
    options: [
      "Yes, I currently work on US\u00A0clients",
      "Yes, I have in the past",
      "No, but I've been trained on US\u00A0accounting or tax",
      "No",
    ],
  },
  {
    id: "us_experience_setting",
    type: "select",
    label: "In what setting?",
    showIf: workedOnUsClients,
    options: [
      "At an offshore or outsourcing firm (Entigrity, MYCPE, QX, KMK, Datamatics or similar)",
      "As a freelancer (Upwork, Fiverr, direct clients)",
      "As a direct remote employee of a foreign company",
    ],
  },

  // Section C. Role and skills. These become the employer search filters.
  {
    id: "role",
    type: "select",
    label: "Which role best describes what you're applying for?",
    options: [
      "Bookkeeper",
      "Staff Accountant",
      "Tax Preparer",
      "Tax Reviewer / Senior Tax",
      "Audit Support",
      "Payroll Specialist",
      "Accounts Payable / Receivable",
      "Controller / Virtual CFO",
    ],
  },
  {
    id: "accounting_software",
    type: "multiselect",
    label: "Which accounting software can you use confidently today?",
    help: "Confidently means you could start work in it tomorrow. Select all that apply.",
    options: [
      "QuickBooks Online",
      "QuickBooks Desktop",
      "Xero",
      "NetSuite",
      "Sage",
      "Zoho Books",
      "Tally (only)",
      "None of these yet",
    ],
  },
  {
    id: "tax_software",
    type: "multiselect",
    label: "Which US\u00A0tax\u00A0software can you use confidently?",
    help: "Select all that apply. It is fine to select none.",
    options: [
      "Drake",
      "Lacerte",
      "ProConnect",
      "UltraTax CS",
      "CCH Axcess / ProSystem fx",
      "ProSeries",
      "TurboTax only",
      "None yet",
    ],
  },
  {
    id: "tax_forms",
    type: "multiselect",
    label: "Which US\u00A0tax\u00A0forms have you actually prepared?",
    help: "Actually prepared, not just seen. Firms test this in interviews.",
    options: [
      "Form 1040 (individual returns)",
      "Form 1120 (C-corporation)",
      "Form 1120\u2011S (S-corporation)",
      "Form 1065 (partnership)",
      "Form 990 (nonprofit)",
      "Forms 941 and 940 (payroll tax)",
      "US\u00A0sales tax filings",
      "None yet",
    ],
  },

  // Section D. Availability and expectations.
  {
    id: "salary_expectation",
    type: "select",
    label: "What monthly salary are you looking for?",
    help: "In USD, for full-time work.",
    options: [
      "$300 to $500",
      "$500 to $800",
      "$800 to $1,200",
      "$1,200 to $1,800",
      "$1,800 to $2,500",
      "Above $2,500",
    ],
  },
  {
    id: "availability",
    type: "select",
    label: "What's your availability?",
    options: [
      "Full\u2011time (40 hrs/week), this would be my only job",
      "Full\u2011time, but I'd be keeping other clients or work",
      "Part-time (up to 20 hrs/week)",
    ],
  },
  {
    id: "working_hours",
    type: "select",
    label: "Which working hours can you commit to?",
    help: "Answer honestly. Indian hours only is still very sellable, overnight turnaround is a genuine feature.",
    options: [
      "Indian business hours only (US\u00A0firm gets overnight turnaround)",
      "Partial US\u00A0overlap, I can work until about 9 or 10 pm IST",
      "Full US\u00A0hours (night shift in India)",
    ],
  },
  {
    id: "start_date",
    type: "select",
    label: "When could you start?",
    options: [
      "Immediately",
      "Within 15 days",
      "30 days (standard notice period)",
      "60+ days",
    ],
  },
  {
    id: "home_setup",
    type: "checkgate",
    label: "Do you have a reliable work-from-home setup?",
    help: "All three are required to continue. US\u00A0firms ask about this constantly.",
    options: [
      "Own laptop or desktop (not shared, not mobile-only)",
      "Reliable broadband internet",
      "Power backup or backup internet (hotspot)",
    ],
  },

  // Section E. Source tracking and consent.
  {
    id: "source",
    type: "select",
    label: "How did you hear about us?",
    options: [
      "Instagram or Facebook ad",
      "LinkedIn",
      "WhatsApp or Telegram group",
      "Referred by a friend",
      "Reddit",
      "Google search",
      "Other",
    ],
  },
  {
    id: "referrer",
    type: "text",
    label: "Who referred you?",
    help: "Their name or email. We give both of you featured placement at launch.",
    placeholder: "Name or email",
    showIf: (a) => a.source === "Referred by a friend",
  },
  {
    id: "consent",
    type: "consent",
    label: "One last thing.",
    options: [
      "I confirm the information above is accurate. I understand AccountingTalent.in is free for professionals, that employers hire and pay directly, and that misrepresenting skills or qualifications will result in permanent removal.",
    ],
  },
];

export const intro = {
  h1: "Apply to India's US-accounting talent database",
  reassurance: [
    "Free for accountants, permanently. Firms pay, you don't.",
    "Direct hire: US\u00A0firms pay you, with no agency taking a cut.",
    "3 minutes, structured questions, no resume needed.",
  ],
  transition:
    "This takes about 3\u00A0minutes. Shortlisted applicants get a short skills assessment by email. Only verified profiles are shown to US\u00A0firms.",
  start: "Start application",
  belowForm:
    "Shortlisted applicants receive a skills assessment by email within 3 days. Only verified profiles are shown to US\u00A0firms.",
} as const;

export const confirmation = {
  h2: "Application received.",
  lede: "Check your email now to verify your address. Unverified applications are not reviewed.",
  body: "Shortlisted applicants receive a short skills assessment (a writing prompt plus a 10\u2011question US\u00A0accounting quiz) within 3 days. Verified profiles are shown first when US\u00A0firms begin hiring.",
} as const;
