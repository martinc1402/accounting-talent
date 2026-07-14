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
*/

/*
  Shrinks the photo panel by 20% (8:5 -> 2:1). Flip this one const to try it.

  It does not clip the head: at 2:1 the frame top lands at 10% of the photograph
  and the hair starts at 11%, so it survives on a 1% margin. What it loses is the
  shoulders, cropping at ~43% instead of ~51%. That is exactly the framing the
  card had before, and the reason it was changed: cutting at 40-43% lands on the
  shoulder line itself, which reads as an abrupt cut rather than as a crop.

  Off by default.
*/
const COMPACT_HERO_CARD = false;

/*
  Row, PillGroup and Label are exported because ProfileDetail is the same object
  at a bigger scale, and it renders the same icon rows and the same software
  pills. Sharing the components rather than copying them is the only thing that
  actually guarantees the two cards cannot drift into lookalikes, which is the
  same argument components/ui/Card.tsx makes about the white cards.
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

export function ProfileCard() {
  const p = hero.sampleProfile;

  return (
    /*
      border-line is what gives the card an edge. Without it the photo half is a
      near-white wall sitting on a white page, so the top of the card simply had
      no boundary. overflow-hidden + the radius on this container (not on the
      children) means the border traces one continuous rounded rectangle across
      both the photo and the navy body.
    */
    <div className="overflow-hidden rounded-card border border-line bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      {/*
        bg-paper here is a fallback, not a visual: the photograph is an opaque
        JPEG that covers the whole panel, so a background behind it is painted
        over. It only shows if the image fails to load.

        8:5, not 2:1. A row-by-row scan of the photograph puts the hair at 11%,
        the chin at 38%, the shoulder line at 40.5% and the shirt filling the
        frame by 48%. A 2:1 panel shows only 33% of the image height, and its
        crop landed at 40.7% — within 0.2% of the shoulder line itself, cutting
        the subject exactly where the shoulders begin. That is what read as an
        abrupt cut rather than as a crop. Head-and-shoulders spans 11%-50%, which
        simply does not fit a 2:1 panel.

        object-[53%_15%] holds at every breakpoint. The source is 2:3 portrait, so
        under object-cover the WIDTH binds: for a card of width W the image
        renders 1.5W tall in a 0.625W panel, so the scroll range is 0.875W. Putting
        the frame's top edge at 9% of the image needs an offset of
        0.09 x 1.5W = 0.135W, and 0.135W / 0.875W = 15%. The W cancels, so one
        value works at 1440 and at 375. The frame runs 9% to 51%: headroom above
        the hair, and the shoulders fully settled.
      */}
      <div
        className={`relative bg-paper ${
          COMPACT_HERO_CARD ? "aspect-[2/1]" : "aspect-[8/5]"
        }`}
      >
        {/*
          A 10% sepia, which is a colour-temperature correction rather than an
          effect. The photograph's wall is cool: sampled at rgb(238,247,247), so
          R minus B = -9, i.e. cyan-leaning, sitting right next to a warm cream
          tile (+4). At 10% the wall lands on +2 and matches the cream; the skin
          moves by 3 points and is imperceptible. A cream overlay was tried first
          and does nothing at low alpha (cream is barely warm) and washes the face
          at high alpha. Anything above ~15% clips the wall to pure white.
        */}
        <Image
          src={p.photo.src}
          alt={p.photo.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover object-[53%_15%] sepia-[10%]"
        />

        {/*
          Cream tile, navy glyph: the reverse of what it was. As a navy tile it
          measured 1.14:1 against the navy body it half sits on, which is to say
          it vanished. Cream reads against both halves of the seam: 13.9:1 on the
          navy body, and the hairline ring holds its edge against the near-white
          wall in the photograph.

          LogoMark strokes currentColor, so the glyph just follows text-navy.
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
          #22c55e at its rendered 17px measures 6.70:1 on navy: comfortably past
          AA, so it stays as it is.
        */}
        <p className="mt-1.5 flex items-center gap-1.5 text-small font-medium text-verified">
          <SealCheck size={17} weight="fill" className="shrink-0" aria-hidden />
          {p.verified}
        </p>

        <ul className="mt-5 space-y-2.5">
          <Row icon={<Briefcase size={16} weight="light" />}>{p.role}</Row>
          <Row icon={<MapPin size={16} weight="light" />}>{p.location}</Row>
          <Row icon={<Clock size={16} weight="light" />}>{p.availability}</Row>
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
