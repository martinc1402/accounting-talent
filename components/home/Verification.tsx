import { verification } from "@/content/home";
import {
  verificationChecks,
  verificationGaps,
  checkStateLabels,
} from "@/lib/marketing/verificationLevels";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DefinitionLedger } from "@/components/marketing/DefinitionLedger";

/*
  What verification means, accountant-facing.

  The per-check copy comes from lib/marketing/verificationLevels.ts rather than
  from content/, and that is the one documented exception to the "strings live in
  content" rule. The reason is the test file next to it: verification copy makes
  claims about what the product checks, and the only way to stop it drifting ahead
  of the product is to assert it against lib/candidate/checks.ts on every run.
  The vitest include glob does not reach content/, so testable copy has to live in
  lib/.

  THE GAPS LIST IS THE POINT OF THIS SECTION, not an afterthought at the bottom.
  A verification section that lists only what we do invites the reader to assume
  the rest is covered, and migration 0013 removed reference checking on purpose
  with the note that "no surface implies references are ever checked". The test
  asserts this list still mentions references.

  Four states, not a binary. "Verification unavailable" exists because some
  qualifications cannot be confirmed against any register we can reach, and
  leaving that check permanently blank reads as a failed check rather than an
  absent one.
*/
export function Verification() {
  return (
    <section id="verification" className="scroll-mt-24 py-16 lg:py-28">
      <Container>
        <div className="max-w-[820px]">
          <SectionHeading className="reveal">{verification.h2}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-lede text-ink">
            {verification.sub}
          </p>
        </div>

        <div className="mt-12 max-w-[900px]">
          <DefinitionLedger
            rows={verificationChecks.map((check) => ({
              term: check.label,
              body: check.accountant,
            }))}
          />
        </div>

        {/* The four states a check can be in. A plain wrapped list of pills: it
            is a vocabulary, not a process, so it gets no rail and no numbering. */}
        <div className="reveal mt-12 max-w-[900px]">
          <p className="text-body font-medium text-ink">
            {verification.statusIntro}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {Object.values(checkStateLabels).map((label) => (
              <li
                key={label}
                className="rounded-full border border-line px-3.5 py-1.5 text-caption text-muted"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal mt-12 max-w-[900px]">
          <p className="text-body font-medium text-ink">
            {verification.gapsIntro}
          </p>
          <div className="mt-4">
            <DefinitionLedger
              rows={verificationGaps.map((gap) => ({
                term: gap.label,
                body: gap.body,
              }))}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
