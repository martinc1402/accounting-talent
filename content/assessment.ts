/*
  Display copy for the Stage 2 assessment page, verbatim from
  stage2-assessment-package.md Parts 1 and 2. This is client-safe: it holds the
  prompt and instructions only. The quiz questions and answer key live in
  lib/assessment/questions.ts (server-only) and never reach the browser.

  Word-count bounds: the spec asks for 80-200 words; we accept a 60-250 margin
  and only hard-block below the floor, so a strong-but-terse answer is not lost.
*/
export const WRITING_MIN = 60;
export const WRITING_MAX = 250;
export const WRITING_TARGET_MIN = 80;
export const WRITING_TARGET_MAX = 200;

export const assessment = {
  header: "Skills assessment",
  intro: [
    "Answer the written question and the 10 multiple-choice questions below. Most people finish in 20–30 minutes. There's no timer — take the time to do it properly.",
  ],

  writing: {
    heading: "Tell us about a real accounting problem you solved.",
    body: "Describe one specific problem from your own work — a reconciliation that wouldn't balance, books that were behind, a tax return complication, a cleanup project — and how you solved it, step by step.",
    lengthNote:
      "Write 80–200 words, in your own words. Be specific: real numbers, real software, real steps. You don't need perfect English — you need clear English.",
    thingsToKnowLabel: "Two things to know before you write:",
    thingsToKnow: [
      "If you pass, this answer appears on your profile, word for word, under “In their own words.” US firms will read it when deciding whether to contact you. Write it for them.",
      "Write it yourself. Generic or AI-written answers are easy to recognize and are rejected regardless of your quiz score — and firms verify these stories in interviews.",
    ],
    placeholder: "Describe the problem, what you did, and how it turned out…",
  },

  quiz: {
    heading: "10 questions on US accounting and tax",
    intro:
      "Answer from your own knowledge. You'll be asked about these topics in interviews with US firms.",
  },

  submit: "Submit assessment",

  confirmation: {
    heading: "Received.",
    body: "A person reviews every assessment; you'll have your result by email within 3 days.",
  },

  expired: {
    heading: "This assessment link has expired.",
    body: "Reply to your invitation email and we'll send a fresh one.",
  },

  alreadyDone: {
    heading: "Your assessment is in.",
    // {date} filled in by the page.
    bodyTemplate:
      "Your assessment was received on {date} and is being reviewed. You'll have your result by email within 3 days.",
  },
} as const;
