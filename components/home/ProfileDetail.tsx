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
  A sample profile, opened. This replaced a full-bleed photograph of a firm
  partner, which broke the scroll but made no argument. This breaks the scroll
  AND makes the argument, because it is the product rather than atmosphere.

  It is the hero card at detail scale: same shell, same tokens, same Row and
  PillGroup components, imported rather than copied. What it is NOT is the same
  person. The hero card and the search results are Arjun; this is Priya. Two faces
  on a page recruiting both, and the heading was never about him anyway ("what a
  firm sees when it opens YOUR profile"). So the components are shared and the
  content is hers.

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

/*
  The top of the card: photo, name, verified line, the three icon rows. Shared by
  both variants unchanged, so the teaser and the full record are provably the same
  object down to the pixel rather than two things that happen to look alike.
*/
function ProfileHeader({ p }: { p: typeof profileDetail }) {
  return (
    <div className="flex flex-col gap-5 border-b border-paper/20 p-6 sm:flex-row sm:items-start sm:gap-7 lg:p-10">
            {/*
              A different photograph from the hero card's, and it needs a
              different mechanism. Not a preference: the hero's does not reach.

              The hero card pans a 1.9x stage with object-position. Run that on
              this 3:4 source and the reachable range runs out. With the stage
              anchored at the top, object-position y can only place the frame's
              top edge between 0% and 10% of the image height, because the cover
              overflow of a 3:4 image in a 5:6 stage is only 13.3% of the stage.
              Her hair starts at 12.5%. Even object-position 100% still lands
              above her head, so NO value produces the crop we need.

              So the stage matches the image's own aspect (making object-cover a
              no-op, and a safe fallback) and the pan is done with a transform.
              Transform percentages resolve against the element's OWN box;
              top/left percentages resolve against the PARENT's. That difference
              is the whole reason this works and `top: -11%` would quietly mean
              something else.

              The algebra. Tile is w x 1.2w, stage is k*w wide and 1.333*k*w tall,
              so the visible band is 1.2w / 1.333kw = 0.9/k of the image height.
              k = 2.571 gives a 35% band; translating it up by 10.8% of the stage
              height puts that band at 10.8% to 45.8% of the photograph, which is
              headroom above the hair (12.6%), the whole face (chin at 33.2%), and
              a landing past the shoulder line (41.8%) rather than on it. Cutting
              AT the shoulder line is what read as an abrupt crop on the hero card.

              The horizontal figure is measured, not derived: her face does not sit
              where the geometry would like it to. 25.4% was found by bracketing,
              and puts the band at 25.4% to 64.3%, centred on 44.8%.

              Her head fills ~59% of the tile against the hero's 64%. Her head is
              proportionally smaller in frame and her shoulders lower, so head size
              and settled shoulders cannot both be matched: tightening to a 64%
              head lands the bottom edge within 2% of her shoulder line. Shoulders
              win, for the reason above.

              sizes describes the STAGE, not the tile: a 144px tile holds a 370px
              image box, and quoting the tile width would fetch a variant 2.5x too
              small and rasterise the face soft.

              No sepia. On the hero card that was a colour-temperature correction
              measured against its cool near-white wall sitting next to a warm
              cream tile. This photograph's background is a different problem
              entirely and sepia does nothing useful for it.
            */}
            <div className="relative aspect-[5/6] w-28 shrink-0 overflow-hidden rounded-card bg-paper sm:w-32 lg:w-36">
              <div className="absolute top-0 left-0 aspect-[3/4] w-[257.1%] -translate-x-[25.4%] -translate-y-[10.8%]">
                <Image
                  src={p.photo.src}
                  alt={p.photo.alt}
                  fill
                  sizes="(max-width: 640px) 290px, 380px"
                  className="object-cover"
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
  );
}

/*
  The card shell, shared by both variants. overflow-hidden + rounded-card trace one
  continuous edge across the photo and the navy body. No .reveal on it: the reveal
  animation is `linear both`, so before its scroll range opens fill-mode pins the
  element at opacity 0.4, which on a 1240x1500 navy slab over white composites to a
  pale lavender bar rising out of the fold. The card is a hard block, not an
  entrance.
*/
const CARD_SHELL =
  "overflow-hidden rounded-card border border-line bg-navy";

/*
  The teaser fade. A mask fades the card's OWN pixels to transparent over the last
  96px, so whatever band sits behind it shows through: it is background-agnostic,
  which is the point (no hardcoded white that breaks if the band changes). Inline
  style, not a utility, so Lightning CSS cannot strip it and it stays scoped to the
  teaser. The shadow is dropped in the teaser because a box-shadow paints outside
  the mask and would leave a faint edge under the fade.
*/
const TEASER_MASK =
  "linear-gradient(to bottom, #000 0, #000 calc(100% - 96px), transparent 100%)";

export function ProfileDetail({
  variant = "full",
}: {
  variant?: "full" | "teaser";
}) {
  const p = profileDetail;

  if (variant === "teaser") {
    return (
      <section className="py-16 lg:py-28">
        <Container>
          <div className="reveal">
            <SectionHeading kicker="The record">{p.heading}</SectionHeading>
            <p className="mt-5 max-w-[52ch] text-lede text-muted">{p.lede}</p>
          </div>

          {/*
            Only the top of the card, faded out. The body grid is not rendered at
            all, so the Contact / Save controls do not exist in the teaser rather
            than being hidden: there is nothing for a job-seeker to tap and nothing
            for the keyboard to reach.
          */}
          {/*
            Taller cap on mobile than desktop, because the card fundamentally has
            two shapes. Below sm the header stacks (photo ABOVE the text, not
            beside it) and runs ~500px on its own, so the ~380px that lands neatly
            on the quote at desktop width would fade out mid-way through the icon
            rows on a phone. 590px clears the header and fades through the quote at
            375, which is the whole point of the teaser: her writing is the hook.
          */}
          <div
            className={`mt-12 max-h-[590px] sm:max-h-[380px] ${CARD_SHELL}`}
            style={{ maskImage: TEASER_MASK, WebkitMaskImage: TEASER_MASK }}
          >
            <ProfileHeader p={p} />
            <div className="p-6 lg:p-10 lg:pt-8">
              <Label>{p.quote.label}</Label>
              <blockquote className="mt-3 border-l-2 border-paper/25 pl-5">
                <p className="text-body text-paper/90">{p.quote.text}</p>
              </blockquote>
            </div>
          </div>

          <p className="mt-5 max-w-[62ch] text-caption text-subtle">
            {p.captionTeaser}
          </p>
        </Container>
      </section>
    );
  }

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

        <div
          className={`mt-12 ${CARD_SHELL} shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]`}
        >
          <ProfileHeader p={p} />

          {/*
            Explicit grid placement rather than order-*, so the intent is legible.

            On a phone the reader gets header, then the panels, then the evidence,
            then the buttons. Two reasons. The salary is what this audience came
            for and it must not sit two thousand pixels down the card. And the
            inert buttons have to be TERMINAL: a full-width cream "Contact Priya"
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
                  the entire worth of this paragraph is that it is HER voice: the
                  one thing on the card a middleman cannot supply for her. So the
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
                Pills, like software, because Priya's scope items are tags rather
                than key/value facts: "AP & AR" has no number to sit on the right,
                so the divide-y rows used for Arjun's return volumes would leave
                half of each row empty here. The reasoning lives in full in the
                content/home.ts returns comment.
              */}
              <div className="mt-8">
                <PillGroup label={p.returnsLabel} items={p.returns} />
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
