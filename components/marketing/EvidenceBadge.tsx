import {
  Briefcase,
  ChartLineUp,
  FileText,
  SealCheck,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

/*
  One badge for all five kinds of Passport evidence, and one colour rule.

  ONE COMPONENT, NOT THREE. A VerificationBadge, a WorkProofBadge and a
  VouchBadge would each have to re-derive the contrast pairing below, and the
  third one written would get it wrong. There is one place to be right.

  THE COLOUR RULE. globals.css records that the verified green "exists for exactly
  one thing: the Verified state... It appears nowhere else." So only
  kind="verified" renders green. Work proof, vouches, capability and reputation
  render in the card's own ink. Five pillars in five colours would spend the one
  piece of meaning the palette carries on decoration, and a firm scanning a card
  would no longer know what green means.

  THE CONTRAST PAIRING is measured, not guessed, and it is why `tone` is a
  required decision rather than a default that mostly works. From globals.css:

    --color-verified       #22c55e   6.70:1 on navy    2.28:1 on white  <- fails
    --color-verified-deep  #15803d   3.05:1 on navy    5.02:1 on white

  Getting this backwards produces green-on-white at 2.28:1, which is unreadable
  and is the exact mistake three separate badge components would have made.
*/
export type EvidenceKind =
  | "verified"
  | "work-proof"
  | "vouch"
  | "capability"
  | "reputation";

const GLYPHS: Record<EvidenceKind, ReactNode> = {
  verified: <SealCheck size={15} weight="fill" />,
  "work-proof": <FileText size={15} weight="light" />,
  vouch: <Users size={15} weight="light" />,
  capability: <Briefcase size={15} weight="light" />,
  reputation: <ChartLineUp size={15} weight="light" />,
};

export function EvidenceBadge({
  kind,
  label,
  tone = "onNavy",
}: {
  kind: EvidenceKind;
  label: string;
  tone?: "onNavy" | "onLight";
}) {
  const onNavy = tone === "onNavy";

  const colour =
    kind === "verified"
      ? onNavy
        ? "text-verified"
        : "text-verified-deep"
      : onNavy
        ? "text-paper/80"
        : "text-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-caption font-medium ${colour}`}
    >
      <span className="shrink-0" aria-hidden>
        {GLYPHS[kind]}
      </span>
      {label}
    </span>
  );
}
