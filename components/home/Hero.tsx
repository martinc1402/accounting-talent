import { Fragment } from "react";
import Image from "next/image";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { hero } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

/*
  Asymmetric split, never centered.

  The right column carries a photograph AND the product, rather than choosing
  between them: the profile card overlaps the lower edge of the photo. The photo
  gives the page life at the moment of first impression; the card keeps the thing
  we are actually selling visible. A hero with only the card read as lifeless; a
  hero with only the photo said nothing about the product.

  The photograph is editorial, not evidence. It is an accountant at a desk, not a
  customer, not a testimonial, and it is captioned as nothing at all. This site
  has no users yet, and a stock photo posing as social proof is exactly the tell
  this (scam-wary) audience has been trained to spot.

  Four text elements maximum in the copy column: headline, subhead, one CTA, one
  microcopy line. On a 360px viewport the CTA sits above the fold and the photo
  and card stack below it rather than overlapping, which at that width would
  crush both.
*/
export function Hero() {
  const p = hero.sampleProfile;

  return (
    <section className="relative overflow-hidden">
      <Container className="grid grid-cols-1 items-center gap-12 pt-14 pb-16 lg:grid-cols-12 lg:gap-12 lg:pt-24 lg:pb-24">
        {/*
          7/5. Widening this to 8/4 was tried, to buy room for the hand-broken
          headline, and reverted: at 1024px it left the image column only 283px,
          where the profile card covers almost the whole photograph and its own
          text starts wrapping. The headline is made to fit by sizing it (see
          .display-hero-home) rather than by taking width off the photo.
        */}
        <div className="lg:col-span-7">
          {/*
            Manual line breaks from md up. The separating space sits BEFORE the
            <br>, so on desktop it falls at the end of a line and collapses, and
            on mobile, where the <br> is display:none, it is the only thing left
            keeping the words apart.
          */}
          <h1 className="display display-hero-home hero-manual-breaks text-ink">
            {hero.h1Lines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && (
                  <>
                    {" "}
                    <br className="hidden md:inline" aria-hidden />
                  </>
                )}
                {line}
              </Fragment>
            ))}
          </h1>

          <p className="mt-6 max-w-[42ch] text-lede text-muted">{hero.sub}</p>

          <div className="mt-8">
            <Button href="/apply" className="w-full sm:w-auto">
              {hero.cta}
            </Button>
          </div>

          <p className="mt-4 max-w-[46ch] text-caption text-subtle">
            {hero.microcopy}
          </p>
        </div>

        <div className="lg:col-span-5">
          {/*
            The outer box reserves the space the card hangs into. The inner box
            is exactly the photo, and is what the card anchors to.

            That nesting matters: an absolute `bottom-0` resolves against its
            containing block's PADDING box, so anchoring the card to the padded
            wrapper put its bottom edge below the reserve and straight through
            the caption underneath. Anchoring to the photo, and hanging by a fixed
            64px rather than a percentage of the card's own height, makes the
            clearance deterministic instead of dependent on how tall the card
            happens to render.
          */}
          <div className="sm:pb-24">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-mist sm:aspect-[3/2] lg:aspect-[3/4]">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-[70%_center] lg:object-center"
                />
              </div>

              {/* Below sm the card simply sits under the photo: an overlap at
                  360px would crush both. */}
              {/*
                The card is inset to 90% of the photo so it reads as hanging off
                its corner. At the narrow end of lg that inset starves it: at
                1024px the column is 372px, so 90% leaves 271px of content for a
                credential row that needs 289px, and the row wraps.

                A floor rather than a wider percentage, so only the widths that
                actually need it are affected: below ~1091px the card holds at
                360px (still inside the 372px column), and above that the 90%
                takes over again, continuously. The floor is lg-only because on a
                phone a 360px minimum would be wider than the viewport.
              */}
              <div className="mt-6 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:w-[90%] sm:translate-y-16 lg:min-w-[360px]">
                <Card className="shadow-[0_16px_40px_-12px_rgba(19,31,91,0.18)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="display display-figure text-ink">
                        {p.name}
                      </p>
                      <p className="mt-1 text-caption text-muted">
                        {p.credential}
                      </p>
                    </div>

                    <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-caption font-medium text-white">
                      <Check size={13} weight="bold" />
                      {p.verified}
                    </p>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-line px-3 py-1.5 text-caption text-muted"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 border-t border-line pt-5 text-small text-ink">
                    {p.expectation}
                  </p>
                </Card>
              </div>
            </div>
          </div>

          <p className="mt-4 text-caption text-subtle">{p.caption}</p>
        </div>
      </Container>
    </section>
  );
}
