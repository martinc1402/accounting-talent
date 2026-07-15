import "server-only";

/*
  The Stage 2 quiz, verbatim from stage2-assessment-package.md Part 2.

  server-only: importing this from a client component is a build error. The
  correct-answer key must never reach the browser. The page and the API send
  only what getPublicQuestions() returns, which strips `answer`.

  Versioned banks so v2 variants (spec Part 2 leakage plan, ~200+ assessments)
  slot in beside v1 without touching the schema: add BANKS.v2 with the same
  slots and switch which bank an assessment draws from.
*/

export type OptionKey = "A" | "B" | "C" | "D";

type Question = {
  id: string;
  prompt: string;
  options: { key: OptionKey; text: string }[];
  answer: OptionKey;
};

const V1: Question[] = [
  {
    id: "q1",
    prompt:
      "Which form does an S corporation file for its annual US federal income tax return?",
    options: [
      { key: "A", text: "Form 1040" },
      { key: "B", text: "Form 1120" },
      { key: "C", text: "Form 1120-S" },
      { key: "D", text: "Form 1065" },
    ],
    answer: "C",
  },
  {
    id: "q2",
    prompt:
      "A US partnership reports each partner's share of income and deductions on:",
    options: [
      { key: "A", text: "Form W-2" },
      { key: "B", text: "Schedule K-1 (Form 1065)" },
      { key: "C", text: "Form 1099-NEC" },
      { key: "D", text: "Schedule C" },
    ],
    answer: "B",
  },
  {
    id: "q3",
    prompt: "In QuickBooks Online, the Undeposited Funds account is used to:",
    options: [
      { key: "A", text: "Record owner draws" },
      {
        key: "B",
        text: "Hold customer payments until they are grouped into a bank deposit",
      },
      { key: "C", text: "Track unpaid vendor bills" },
      { key: "D", text: "Record payroll tax liabilities" },
    ],
    answer: "B",
  },
  {
    id: "q4",
    prompt:
      "While reconciling a bank account, you find a check recorded in the books that has not yet cleared the bank. This is:",
    options: [
      { key: "A", text: "A bank error" },
      { key: "B", text: "An outstanding check" },
      { key: "C", text: "A deposit in transit" },
      { key: "D", text: "An NSF check" },
    ],
    answer: "B",
  },
  {
    id: "q5",
    prompt: "Under accrual accounting, revenue is recognized when:",
    options: [
      { key: "A", text: "Cash is received" },
      { key: "B", text: "The invoice is paid" },
      { key: "C", text: "It is earned, regardless of when cash is received" },
      { key: "D", text: "The bank statement shows the deposit" },
    ],
    answer: "C",
  },
  {
    id: "q6",
    prompt: "Form 941 is filed to report:",
    options: [
      { key: "A", text: "Annual corporate income tax" },
      {
        key: "B",
        text: "Quarterly federal payroll taxes withheld and employer FICA",
      },
      { key: "C", text: "State sales tax" },
      { key: "D", text: "Partner distributions" },
    ],
    answer: "B",
  },
  {
    id: "q7",
    prompt: "Form 1099-NEC is used to report:",
    options: [
      { key: "A", text: "Wages paid to employees" },
      { key: "B", text: "Payments to independent contractors" },
      { key: "C", text: "Interest income" },
      { key: "D", text: "Dividend income" },
    ],
    answer: "B",
  },
  {
    id: "q8",
    prompt:
      "The standard filing deadline for a calendar-year S corporation return (Form 1120-S), without extension, is:",
    options: [
      { key: "A", text: "April 15" },
      { key: "B", text: "March 15" },
      { key: "C", text: "June 30" },
      { key: "D", text: "January 31" },
    ],
    answer: "B",
  },
  {
    id: "q9",
    prompt: "Accounts Payable appears on the:",
    options: [
      { key: "A", text: "Income statement, as an expense" },
      { key: "B", text: "Balance sheet, as a liability" },
      { key: "C", text: "Balance sheet, as an asset" },
      { key: "D", text: "Cash flow statement only" },
    ],
    answer: "B",
  },
  {
    id: "q10",
    prompt: "In the United States, sales tax is:",
    options: [
      { key: "A", text: "A federal tax filed with the IRS" },
      {
        key: "B",
        text: "Levied by states and localities and filed with state authorities",
      },
      { key: "C", text: "Equivalent to GST and filed monthly with the IRS" },
      { key: "D", text: "Included in the federal income tax return" },
    ],
    answer: "B",
  },
];

const BANKS = { v1: V1 } as const;
export type BankVersion = keyof typeof BANKS;

export const QUESTION_COUNT = V1.length;
export const QUIZ_INTRO =
  "Answer from your own knowledge. You'll be asked about these topics in interviews with US firms.";

/** Per-question shuffle of the option keys, persisted on the assessment row as
 *  option_order so a refresh renders the same order. Fisher-Yates. */
export function makeOptionOrder(
  bank: BankVersion = "v1",
): Record<string, OptionKey[]> {
  const order: Record<string, OptionKey[]> = {};
  for (const q of BANKS[bank]) {
    const keys = q.options.map((o) => o.key);
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j]!, keys[i]!];
    }
    order[q.id] = keys;
  }
  return order;
}

export type PublicQuestion = {
  id: string;
  prompt: string;
  // Options in the respondent's shuffled display order. `value` is the option's
  // stable key, which the client submits back; it says nothing about which is
  // correct (that never leaves this module).
  options: { value: OptionKey; text: string }[];
};

/** The only question shape that reaches the page/client: no answer field, options
 *  in the persisted shuffle order. */
export function getPublicQuestions(
  optionOrder: Record<string, OptionKey[]> | null,
  bank: BankVersion = "v1",
): PublicQuestion[] {
  return BANKS[bank].map((q) => {
    const order = optionOrder?.[q.id] ?? q.options.map((o) => o.key);
    const byKey = new Map(q.options.map((o) => [o.key, o.text]));
    return {
      id: q.id,
      prompt: q.prompt,
      options: order
        .filter((k) => byKey.has(k))
        .map((k) => ({ value: k, text: byKey.get(k)! })),
    };
  });
}

/** Server-side scoring. Compares submitted option keys to the answer key.
 *  Unknown/missing answers score 0 for that question. */
export function scoreQuiz(
  answers: Record<string, string> | null | undefined,
  bank: BankVersion = "v1",
): number {
  if (!answers) return 0;
  let score = 0;
  for (const q of BANKS[bank]) {
    if (answers[q.id] === q.answer) score++;
  }
  return score;
}

/** All question ids for the bank, so the API can require a complete answer set. */
export function questionIds(bank: BankVersion = "v1"): string[] {
  return BANKS[bank].map((q) => q.id);
}
