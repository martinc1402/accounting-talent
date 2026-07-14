import Image from "next/image";
import {
  Briefcase,
  CheckCircle,
  GraduationCap,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { profileDetail } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Label, PillGroup, Row } from "@/components/home/ProfileCard";

/*
  The sample profile, opened. This replaced a full-bleed photograph of a firm
  partner, which broke the scroll but made no argument. This breaks the scroll
  AND makes the argument, because it is the product rather than atmosphere.

  It is the hero card at detail scale: same shell, same tokens, same person, same
  Row and PillGroup components, imported rather than copied. A reader who saw the
  hero recognises this as the same object, which is the entire point.

  Not built on components/ui/Card, for the same reason ProfileCard is not: Card
  bakes its padding into the base, and with no tailwind-merge in the project a
  passed-in p-* would collide with it rather than replace it.

  Read the profileDetail comment in content/home.ts before editing the copy. The
  short version: this card shows fields the application form does not yet ask for,
  so the heading above it and the caption below it are the only things keeping it
  a sample rather than a claim. They are not decoration and they do not come off.
*/

/*
  A firm's controls, rendered for a reader who is not a firm.

  Not a <button>, not an <a>, no tabIndex: there is nothing here to press, so
  there is nothing to focus. pointer-events-none kills the text caret and any
  chance of a stray :hover. It keeps the shape of Button (rounded-full, the same
  18px medium label) but drops transition-all and active:translate-y-px, because
  a press animation on something that cannot be pressed is a small lie.

  Deliberately NOT aria-hidden. With no role it is announced as plain text, which
  tells a screen-reader user exactly what a firm sees without offering them a
  control that does not exist.

  Navy on navy would vanish, so the primary inverts to cream-on-navy: the same
  pairing as the logo tile on the hero card, at 13.8:1.
*/
const inertButton =
  "flex items-center justify-center rounded-full px-5 py-3 text-[18px] font-medium";

function InertAction({
  tone,
  children,
}: {
  tone: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <div
      className={`${inertButton} ${
        tone === "primary"
          ? "bg-paper text-navy"
          : "border border-paper/40 text-paper"
      }`}
    >
      {children}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  /*
    navy-deep (#0d1642) is the existing "navy, one step down" token, already in
    use as the primary button's hover. The luminance step from navy is small, so
    without the hairline ring these panels read as a smudge on the card rather
    than as insets in it.
  */
  return (
    <div className="rounded-card bg-navy-deep p-5 ring-1 ring-paper/10">
      {children}
    </div>
  );
}

export function ProfileDetail() {
  const p = profileDetail;

  return (
    /*
      No background class. The page spends its bands deliberately (white / paper /
      white / mist / navy) and this section takes none: paper (WhoWeWant) runs into
      white here and stays white through TheHonestPart. White is also the ground
      the reader already met this card on, and the shadow below is tuned against it.
    */
    <section className="py-16 lg:py-28">
      <Container>
        <div className="reveal">
          <SectionHeading>{p.heading}</SectionHeading>
          <p className="mt-5 max-w-[52ch] text-lede text-muted">{p.lede}</p>
        </div>

        {/*
          No .reveal on the card, and that is a fix rather than an omission. The
          reveal animation is `linear both`, so before its scroll range opens,
          fill-mode pins the element at the `from` keyframe: opacity 0.4. On a
          paragraph that is an unnoticed ghost. On a 1240x1500 navy slab over
          white it composites to a pale lavender bar rising out of the fold,
          which is the exact colour-bug artefact that keyframe's 0.4 (rather than
          0) was introduced to kill. The card is a hard navy block replacing a
          full-bleed photograph: it IS the punctuation, and it does not need an
          entrance.
        */}
        <div className="mt-12 overflow-hidden rounded-card border border-line bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
          <div className="flex flex-col gap-5 border-b border-paper/20 p-6 sm:flex-row sm:items-start sm:gap-7 lg:p-10">
            {/*
              The same face as the hero card, cropped to the same framing, and it
              takes a stage to do it.

              The source is 2:3. Under object-cover the width binds (a 5:6 tile of
              width w renders the image 1.5w tall in a 1.2w frame), so the tile
              shows 1.2/1.5 = 80% of the image height NO MATTER WHAT
              object-position says. Head-and-shoulders is 9% to 51%, a 42% band,
              and a 42% band does not fit an 80% window: object-position only
              chooses WHICH 80% you see. Every possible value drags in the
              waistband and the hands, leaving the head at ~34% of the tile. That
              is a standing shot shrunk into an avatar slot, not the hero's face.

              So the image is rendered into a stage 1.9x the tile and clipped by
              it. The tile then shows 1/1.9 = 52.6% of the stage's 80% band =
              42.1%, which is the band we actually need. Putting its top edge at
              the hero's 9% needs object-position y = 9 / (0.8 / 1.9 * 100 / 42.1)
              ... in the simple form the algebra reduces to: y = f / 0.2 with the
              stage's own overflow, so f = 9% gives y = 45%. Visible band 9% to
              51.1%: the hero card's crop, to the pixel. The head lands at 64% of
              the tile height against the hero panel's 65%.

              sizes accounts for the 1.9x. A 144px tile holds a 274px-wide image
              box, so quoting the tile width here would fetch a variant one step
              too small and soften the face.

              sepia-[10%] is kept from the hero card. The correction was
              calibrated against a cream tile rather than this navy one, so it is
              not strictly needed here, but rendering the same face at a different
              colour temperature four screens apart is precisely what would break
              the "same person" illusion.
            */}
            <div className="relative aspect-[5/6] w-28 shrink-0 overflow-hidden rounded-card bg-paper sm:w-32 lg:w-36">
              <div className="absolute top-0 left-1/2 h-[190%] w-[190%] -translate-x-1/2">
                <Image
                  src={p.photo.src}
                  alt={p.photo.alt}
                  fill
                  sizes="(max-width: 640px) 220px, 280px"
                  className="object-cover object-[50%_45%] sepia-[10%]"
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="display display-figure text-paper">{p.name}</p>

              {/*
                Green carries the state, not the sentence. #22c55e means Verified;
                it does not mean "everything to do with verification", and three
                wrapped lines of solid green on a phone would shout. The exam
                result is a fact, so it sits in paper at 6.6:1.
              */}
              <p className="mt-2 flex items-start gap-1.5 text-small font-medium text-verified">
                <SealCheck
                  size={17}
                  weight="fill"
                  className="mt-0.5 shrink-0"
                  aria-hidden
                />
                <span>
                  {p.verified.state}{" "}
                  <span className="font-normal text-paper/70">
                    {p.verified.detail}
                  </span>
                </span>
              </p>

              <ul className="mt-5 grid gap-2.5 lg:gap-x-8 xl:grid-cols-2">
                <Row icon={<Briefcase size={16} weight="light" />}>
                  {p.rows.role}
                </Row>
                <Row icon={<GraduationCap size={16} weight="light" />}>
                  {p.rows.education}
                </Row>
                <Row icon={<MapPin size={16} weight="light" />}>
                  {p.rows.location}
                </Row>
              </ul>
            </div>
          </div>

          {/*
            Explicit grid placement rather than order-*, so the intent is legible.

            On a phone the reader gets header, then the panels, then the evidence,
            then the buttons. Two reasons. The salary is what this audience came
            for and it must not sit two thousand pixels down the card. And the
            inert buttons have to be TERMINAL: a full-width cream "Contact Arjun"
            pill halfway down a long card will be tapped, and nothing will happen.
            Last, directly above "you hire and pay directly", they read as the
            card's closing chrome, which is where a real product puts them anyway.

            Reordering is free here precisely because nothing in the card is
            focusable, so there is no focus order to desynchronise. The DOM order
            IS the mobile order, so screen readers and phones agree.

            grid-rows-[auto_1fr] + self-start is load-bearing: it lets row one hug
            the panels and row two absorb the taller main column's leftover height,
            so the actions sit under the panels instead of floating in the middle
            of a stretched row.
          */}
          <div className="grid gap-8 p-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6 lg:p-10">
            <div className="space-y-4 lg:col-span-4 lg:col-start-9 lg:row-start-1">
              <Panel>
                <Label>{p.salary.label}</Label>
                <p className="display display-figure mt-2 whitespace-nowrap text-paper">
                  {p.salary.figure}
                  <span className="text-small text-paper/65">
                    {p.salary.suffix}
                  </span>
                </p>
                <dl className="mt-4 space-y-2.5 border-t border-paper/15 pt-4">
                  {p.salary.facts.map((f) => (
                    <div
                      key={f.term}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <dt className="text-caption text-paper/55">{f.term}</dt>
                      <dd className="text-right text-small text-paper/85">
                        {f.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>

              <Panel>
                <Label>{p.activity.label}</Label>
                <p className="mt-2 text-small text-paper/85">
                  {p.activity.joined}
                </p>
                {/* Green again, and again because it is a state rather than a
                    sentence: this profile is live. */}
                <p className="mt-1.5 flex items-center gap-2 text-small font-medium text-verified">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full bg-verified"
                  />
                  {p.activity.active}
                </p>
              </Panel>

              <Panel>
                <Label>{p.setupLabel}</Label>
                <ul className="mt-3 space-y-2">
                  {p.setup.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      {/*
                        Not green, and light rather than filled. `fill` is the
                        SealCheck's weight across this whole codebase, so a green
                        filled check here would read as a second Verified seal on
                        a laptop and a broadband line.
                      */}
                      <CheckCircle
                        size={16}
                        weight="light"
                        className="mt-0.5 shrink-0 text-paper/55"
                        aria-hidden
                      />
                      <span className="text-small text-paper/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <div className="lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div>
                <Label>{p.quote.label}</Label>
                {/*
                  Sans, not the display serif. The serif is the brand's voice, and
                  the entire worth of this paragraph is that it is HIS voice: the
                  one thing on the card a middleman cannot supply for him. So the
                  brand stays out of it. (The serif is also 300-weight at 0.95
                  leading, which is wrong for ninety words of running text.)
                */}
                <blockquote className="mt-3 border-l-2 border-paper/25 pl-5">
                  <p className="max-w-[62ch] text-body text-paper/90">
                    {p.quote.text}
                  </p>
                  <footer className="mt-3 text-caption text-paper/55">
                    {p.quote.attribution}
                  </footer>
                </blockquote>
              </div>

              <div className="mt-8">
                <PillGroup label={p.softwareLabel} items={p.software} />
              </div>

              {/*
                Rows, not pills, and the distinction is the point: pills are for
                tags (software, which you either have or you do not), rows are for
                measured facts (volumes, which have a number on the right). As
                pills these were key/value pairs in a tag's clothes, twice the
                width of a real tag, and they burst their own container.
              */}
              <div className="mt-8">
                <Label>{p.returnsLabel}</Label>
                <ul className="mt-3 divide-y divide-paper/15 border-y border-paper/15">
                  {p.returns.map((r) => (
                    <li
                      key={r.form}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <span className="text-small text-paper/85">{r.form}</span>
                      <span className="text-caption whitespace-nowrap text-paper/60 tabular-nums">
                        {r.volume}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Label>{p.experienceLabel}</Label>
                <ul className="mt-4 space-y-6">
                  {p.experience.map((e) => (
                    <li key={e.title}>
                      <p className="text-body font-medium text-paper">
                        {e.title}
                      </p>
                      <p className="mt-1 text-caption text-paper/55">{e.meta}</p>
                      <p className="mt-2 max-w-[62ch] text-small text-paper/80">
                        {e.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="self-start lg:col-span-4 lg:col-start-9 lg:row-start-2">
              <div className="grid gap-3 pointer-events-none select-none">
                <InertAction tone="primary">{p.actions.primary}</InertAction>
                <InertAction tone="secondary">{p.actions.secondary}</InertAction>
              </div>
              {/* paper/55 is the floor: paper/50 measures 4.47:1 on navy and
                  fails AA, and this is 12px. */}
              <p className="mt-4 text-center text-fine text-paper/55">
                {p.footnote}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-[80ch] text-caption text-subtle">{p.caption}</p>
      </Container>
    </section>
  );
}
