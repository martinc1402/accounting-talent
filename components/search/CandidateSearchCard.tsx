"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BookmarkSimple,
  Clock,
  GraduationCap,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/ui/LogoMark";
import type { Candidate } from "@/lib/search/candidate";

/*
  The employer search-result card, ported from the AccountingTalentCards design.
  Same navy/paper/verified shell as the homepage ProfileCard (so a firm that saw
  the sample recognises it), carrying the richer search fields: target role,
  qualification + experience, verification badges, timezone overlap, role-specific
  evidence, expected compensation, and the two employer actions.

  Client component because Save holds local state and the whole card is clickable.
  The card is a clickable affordance; the real controls are the two buttons, which
  stay individually keyboard-focusable (mirroring the design's a11y note). No data
  is invented — every field the candidate lacks is omitted or falls back upstream
  in lib/search/candidate.ts.

  Assessment is not shown yet (see SHOW_ASSESSMENT in lib/search/candidate.ts);
  when it returns it renders as one more verification badge, no card change needed.
*/

// Label / Row / PillGroup mirror the homepage card's primitives so the two cards
// share one visual language. Kept local to keep this client leaf self-contained.
function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-caption font-medium tracking-wide text-paper/65 uppercase">
      {children}
    </p>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-paper/55">{icon}</span>
      <span className="text-small text-paper/80">{children}</span>
    </li>
  );
}

function PillGroup({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-paper/30 px-3 py-1 text-caption text-paper/85"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Neutral placeholder for a candidate with no photo yet: a muted glyph, never an
// invented face. Matches the homepage card's silhouette treatment.
function Silhouette() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-end justify-center bg-paper"
    >
      <svg viewBox="0 0 64 48" className="h-[85%] text-navy/15" fill="currentColor">
        <circle cx="32" cy="18" r="11" />
        <path d="M11 48c0-11.6 9.4-21 21-21s21 9.4 21 21z" />
      </svg>
    </div>
  );
}

// Visible focus on the navy shell: the global focus ring is navy, which would be
// invisible here, so buttons get a paper ring instead.
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy";

export function CandidateSearchCard({
  candidate,
  onViewProfile,
  onToggleSave,
}: {
  candidate: Candidate;
  onViewProfile?: (id: string) => void;
  onToggleSave?: (id: string, saved: boolean) => void;
}) {
  const c = candidate;
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  // Default destination is the profile page; an explicit onViewProfile overrides
  // it (e.g. a future search grid that opens a drawer instead of navigating).
  const view = () =>
    onViewProfile ? onViewProfile(c.id) : router.push(`/candidates/${c.id}`);
  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    onToggleSave?.(c.id, next);
  };

  return (
    <article
      aria-label={`${c.name}, ${c.role}`}
      onClick={view}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)] transition-transform duration-200 hover:-translate-y-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-navy"
    >
      {/* Photo panel with the logo tile straddling the seam. */}
      <div className="relative aspect-[3/2] bg-paper">
        {c.photo ? (
          <Image
            src={c.photo.src}
            alt={c.photo.alt}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-[center_35%]"
          />
        ) : (
          <Silhouette />
        )}
        <div className="absolute -bottom-5 left-6 flex size-11 items-center justify-center rounded-card bg-paper text-navy ring-1 ring-line">
          <LogoMark className="size-7" />
        </div>
      </div>

      {/* Navy body. flex-1 + the spacer below keep compensation and actions
          bottom-aligned so a grid of cards has even footers. */}
      <div className="flex flex-1 flex-col px-6 pt-9 pb-6 lg:px-7">
        <h3 className="display display-figure text-paper">{c.name}</h3>
        <p className="mt-1.5 font-display text-body leading-snug text-paper/85">
          {c.role}
        </p>

        {c.qualLine && (
          <ul className="mt-4">
            <Row icon={<GraduationCap size={16} weight="light" />}>
              {c.qualLine}
            </Row>
          </ul>
        )}

        {c.verifications.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {c.verifications.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1.5 text-caption font-medium text-verified"
              >
                <SealCheck size={15} weight="fill" className="shrink-0" aria-hidden />
                {v}
              </span>
            ))}
          </div>
        )}

        <ul className="mt-3.5 space-y-2">
          {c.locationLine && (
            <Row icon={<MapPin size={16} weight="light" />}>{c.locationLine}</Row>
          )}
          {c.availability && (
            <Row icon={<Clock size={16} weight="light" />}>{c.availability}</Row>
          )}
        </ul>

        <div className="mt-6 space-y-4">
          {c.software.length > 0 && (
            <PillGroup label="Software" items={c.software} />
          )}
          {c.evidence.items.length > 0 && (
            <PillGroup label={c.evidence.label} items={c.evidence.items} />
          )}
        </div>

        <div className="min-h-5 flex-1" />

        {c.compensation && (
          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-paper/25 pt-5">
            <Label>Expected compensation</Label>
            {/* Value on its own line (display-figure overflows a two-ended range in
                a grid card), unit beneath, right-aligned — matching the design. */}
            <div className="text-right">
              <p className="font-display text-[clamp(1.5rem,1.4rem+0.9vw,1.85rem)] leading-none tracking-[-0.01em] whitespace-nowrap text-paper">
                {c.compensation.value}
              </p>
              {c.compensation.unit && (
                <p className="mt-1.5 text-caption text-paper/60">
                  {c.compensation.unit}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              view();
            }}
            className={`flex-1 rounded-card bg-paper px-4 py-3 text-small font-semibold text-navy transition hover:bg-mist active:translate-y-px ${FOCUS}`}
          >
            View profile
          </button>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `Saved ${c.name}` : `Save ${c.name}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-card border px-4 py-3 text-small font-semibold text-paper transition ${
              saved
                ? "border-verified bg-verified/10"
                : "border-paper/30 hover:border-paper/60"
            } ${FOCUS}`}
          >
            <BookmarkSimple
              size={16}
              weight={saved ? "fill" : "regular"}
              className={saved ? "text-verified" : ""}
              aria-hidden
            />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
