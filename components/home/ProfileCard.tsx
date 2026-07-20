import Image from "next/image";
import {
  Briefcase,
  Clock,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { hero } from "@/content/home";
import { LogoMark } from "@/components/ui/LogoMark";

/*
  The sample verified profile. This is the product, so it gets built like the
  product rather than like an illustration of one: every row is a field the
  application form actually asks for.

  Navy body, cream type. "Cream" is the existing --color-paper token (#f5f4f1),
  not a new colour: the card is warm-on-dark rather than stark white-on-dark, and
  it shares that warmth with the logo tile on the seam.

  Not built on components/ui/Card: that bakes padding into the base, and the
  photo panel has to run to the card's edges.

  Parameterized so /employers can render a grid of these. It defaults to the
  homepage hero profile (so <ProfileCard /> is unchanged), but the employer pool
  passes its own `profile` and `sample`. `sample` only changes the image
  treatment (framing tuned for the pool portraits, and lazy loading since the
  grid is below the fold); it does not gate the photo. The silhouette is a
  fallback for any profile that has no photo yet.
*/

export type ProfileCardData = {
  name: string;
  photo?: { src: string; alt: string };
  verified: string;
  role: string;
  location: string;
  // Optional: the homepage card carries an availability row; the pool samples
  // omit it, so the Clock row only renders when present.
  availability?: string;
  softwareLabel: string;
  software: readonly string[];
  returnsLabel: string;
  returns: readonly string[];
  salaryLabel: string;
  salary: string;
  salarySuffix: string;
};

/*
  Row, PillGroup and Label are exported because ProfileDetail is the same KIND of
  card at a bigger scale (a different person, but the same navy shell, the same
  icon rows, the same software pills). Sharing the components rather than copying
  them is the only thing that actually guarantees the two cards cannot drift into
  lookalikes.
*/
export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-caption font-medium tracking-wide text-paper/65 uppercase">
      {children}
    </p>
  );
}

export function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-paper/55">{icon}</span>
      <span className="text-small text-paper/80">{children}</span>
    </li>
  );
}

export function PillGroup({
  label,
  items,
}: {
  label: string;
  items: readonly string[];
}) {
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

/*
  A head-and-shoulders silhouette for the sample profiles. Not a face: putting an
  invented face on a fictional person is exactly the overstatement this site
  avoids, so the sample cards carry a neutral placeholder and the caption says
  "sample". A muted navy glyph on the cream panel reads as "photo goes here"
  rather than as a real photograph.
*/
function Silhouette() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-end justify-center bg-paper"
    >
      <svg
        viewBox="0 0 64 48"
        className="h-[85%] text-navy/15"
        fill="currentColor"
        role="presentation"
      >
        <circle cx="32" cy="18" r="11" />
        <path d="M11 48c0-11.6 9.4-21 21-21s21 9.4 21 21z" />
      </svg>
    </div>
  );
}

export function ProfileCard({
  profile = hero.sampleProfile,
  sample = false,
}: {
  profile?: ProfileCardData;
  sample?: boolean;
}) {
  const p = profile;

  return (
    /*
      border-line is what gives the card an edge. overflow-hidden + the radius on
      this container (not on the children) means the border traces one continuous
      rounded rectangle across both the photo and the navy body.
    */
    <div className="overflow-hidden rounded-card border border-line bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      <div className="relative aspect-[8/5] bg-paper">
        {p.photo ? (
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            fill
            // The hero card is above the fold on the homepage; the pool grid is
            // below the fold on /employers, so those load lazily.
            priority={!sample}
            sizes={
              sample
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                : "(max-width: 1024px) 100vw, 42vw"
            }
            // Hero headshot is a 2:3 portrait tuned with object-[53%_15%] and a
            // warmth correction. The pool portraits are 4:3, face-centred, so
            // they sit on object-[center_35%] with no sepia.
            className={`object-cover ${
              sample ? "object-[center_35%]" : "object-[53%_15%] sepia-[10%]"
            }`}
          />
        ) : (
          <Silhouette />
        )}

        {/*
          Cream tile, navy glyph. LogoMark strokes currentColor, so the glyph
          just follows text-navy. It reads against both halves of the seam.
        */}
        <div className="absolute -bottom-5 left-6 flex size-11 items-center justify-center rounded-card bg-paper text-navy ring-1 ring-line">
          <LogoMark className="size-7" />
        </div>
      </div>

      <div className="px-6 pt-9 pb-6 lg:px-7">
        <p className="display display-figure text-paper">{p.name}</p>

        {/*
          The one place on this site that is not navy. Verified is what US firms
          filter for first, so the colour carries meaning rather than decorating.
        */}
        <p className="mt-1.5 flex items-center gap-1.5 text-small font-medium text-verified">
          <SealCheck size={17} weight="fill" className="shrink-0" aria-hidden />
          {p.verified}
        </p>

        <ul className="mt-5 space-y-2.5">
          <Row icon={<Briefcase size={16} weight="light" />}>{p.role}</Row>
          <Row icon={<MapPin size={16} weight="light" />}>{p.location}</Row>
          {p.availability && (
            <Row icon={<Clock size={16} weight="light" />}>
              {p.availability}
            </Row>
          )}
        </ul>

        <div className="mt-6 space-y-4">
          <PillGroup label={p.softwareLabel} items={p.software} />
          <PillGroup label={p.returnsLabel} items={p.returns} />
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-paper/25 pt-5">
          <Label>{p.salaryLabel}</Label>

          {/* The suffix is smaller and muted so the figure still reads as the
              figure, but "per month" is no longer left to be guessed at. */}
          <p className="display display-figure whitespace-nowrap text-paper">
            {p.salary}
            <span className="text-small text-paper/65">{p.salarySuffix}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
