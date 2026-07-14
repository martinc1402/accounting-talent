import { z } from "zod";
import { QUESTIONS, type Answers, type Question } from "@/content/form";

/**
 * A question only applies if its showIf predicate passes against the answers
 * actually submitted. The client hides skipped questions; the server derives
 * the same set independently so a hand-crafted POST cannot bypass a gate.
 */
export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

const email = z.email();
const url = z.url();

/** Indian mobile numbers, tolerant of spaces, dashes and a +91 or 0 prefix. */
const PHONE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

function asArray(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v;
  return v ? [v] : [];
}

export function validateQuestion(
  q: Question,
  answers: Answers,
): string | null {
  const raw = answers[q.id];
  const text = typeof raw === "string" ? raw.trim() : "";
  const list = asArray(raw).filter(Boolean);

  if (q.optional && !text && list.length === 0) return null;

  switch (q.type) {
    case "text":
      if (!text) return "This field is required.";
      if (text.length < 2) return "Please enter at least 2 characters.";
      return null;

    case "email":
      if (!text) return "Please enter your email address.";
      return email.safeParse(text).success
        ? null
        : "That doesn't look like a valid email address.";

    case "tel":
      if (!text) return "Please enter your WhatsApp number.";
      return PHONE.test(text.replace(/[\s-]/g, ""))
        ? null
        : "Please enter a valid 10-digit Indian mobile number.";

    case "url": {
      if (!text) return "This field is required.";
      const normalised = /^https?:\/\//i.test(text) ? text : `https://${text}`;
      return url.safeParse(normalised).success
        ? null
        : "Please enter a valid URL.";
    }

    case "city":
    case "select":
      if (!text) return "Please choose one option.";
      return q.options && !q.options.includes(text) && q.type === "select"
        ? "Please choose one of the listed options."
        : null;

    case "multiselect":
      return list.length === 0 ? "Please select at least one option." : null;

    // Spec: "must check to proceed". At least one box, because the scoring
    // rules explicitly route applicants who lack their own computer to the
    // waitlist rather than blocking them.
    case "checkgate":
      return list.length === 0
        ? "Select every item that applies to you before continuing."
        : null;

    case "consent":
      return list.length === 0 ? "You must agree before submitting." : null;
  }
}

export function validateAll(answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of visibleQuestions(answers)) {
    const err = validateQuestion(q, answers);
    if (err) errors[q.id] = err;
  }
  return errors;
}
