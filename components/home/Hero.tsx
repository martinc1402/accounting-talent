import { Fragment } from "react";
import { hero, software } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { ProfileCard } from "@/components/home/ProfileCard";
import { JoinCtas } from "@/components/home/JoinCtas";

/*
  Asymmetric split, never centered.

  The right column is the product: a sample verified profile, which is the most
  literal way to make "US firms find your profile and hire you" concrete.

  It used to be a photograph with the card hanging off its corner. The card is
  now a full credential card and is simply too tall to share a column with the
  photo (~615px against the photo's 616px, so it covered the thing it was
  supposed to sit on). The page keeps its photography in the mid-page band; the
  hero keeps the argument.

  Five text elements in the copy column now: eyebrow, headline, subhead, CTAs,
  microcopy. The eyebrow ("Build your AccountingTalent Passport") is what names
  the thing the rest of the page is about, and it is the only eyebrow rendered on
  either page (SectionHeading's kickers are dark-launched off), so the page is
  nowhere near the point where these stop being read.

  Two CTAs now, not one. "See what employers see" goes to the real preview
  profile, and it exists because the primary ask (build a profile) is easier to
  say yes to once you have seen the thing you would be building.

  On a 360px viewport the primary CTA sits above the fold and the card follows
  below it.
*/
export function Hero() {
  const p = hero.sampleProfile;

  return (
    // The band's bottom padding lives on the section now, below the software
    // strip, so the strip sits inside the hero band rather than in a section of
    // its own. Bands are adjacent (padding, not margins), so the cream money
    // band that follows starts flush against this one.
    <section className="relative overflow-hidden pb-16 lg:pb-24">
      {/*
        lg:items-start, not items-center. The credential card is around 800px
        tall against a ~470px copy column, so centering pushed the eyebrow to
        y=398 on a 900px viewport: the headline sat below the vertical midpoint
        under a screen-height band of nothing, which reads as a layout bug rather
        than as whitespace. Top-aligned, the headline sits near the top of the
        viewport and the card runs past the fold, which also invites the scroll.
        The employer hero was corrected the same way at the same time.
      */}
      <Container className="grid grid-cols-1 items-center gap-12 pt-14 lg:grid-cols-12 lg:items-start lg:gap-12 lg:pt-20">
        {/*
          7/5. Widening this to 8/4 was tried, to buy room for the hand-broken
          headline, and reverted: at 1024px it left the image column only 283px,
          where the card's own text starts wrapping. The headline is made to fit
          by sizing it (see .display-hero-home) rather than by taking width off
          the card.
        */}
        <div className="lg:col-span-7">
          {/*
            Manual line breaks from md up. The separating space sits BEFORE the
            <br>, so on desktop it falls at the end of a line and collapses, and
            on mobile, where the <br> is display:none, it is the only thing left
            keeping the words apart.
          */}
          <p className="mb-3 text-caption font-medium tracking-wide text-subtle uppercase">
            {hero.eyebrow}
          </p>
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
            <JoinCtas surface="hero" />
          </div>

          <p className="mt-4 max-w-[46ch] text-caption text-subtle">
            {hero.microcopy}
          </p>
        </div>

        <div className="lg:col-span-5">
          <ProfileCard example={{ chip: p.exampleChip }} />

          <p className="mt-4 text-caption text-subtle">{p.caption}</p>
          {/* Its own line at the same size, not folded into the caption above.
              The card shows a face over a Verified badge, so what that face is
              has to be findable without parsing a clause. Matches the employer
              page, which discloses the same thing the same way. */}
          <p className="mt-2 max-w-[52ch] text-caption text-subtle">
            {p.imageNote}
          </p>
        </div>
      </Container>

      {/*
        The tools this audience already works in, folded into the foot of the
        hero band instead of floating as its own section. A hairline divider and
        modest padding set it apart from the hero copy; sharing the band is what
        stops it reading as an orphan strip between two sections.

        Typographic, not a logo wall, and that is deliberate. Four of the six
        (Drake, Lacerte, CCH, UltraTax) have no mark in any open icon library, and
        putting Intuit / Wolters Kluwer trademarks on the page to illustrate what
        our candidates can do (rather than an integration we have built) would
        imply a partnership that does not exist. It is also inert: a line of
        prose, nothing clickable, focusable, or hoverable.
      */}
      <Container>
        <div className="reveal mt-8 border-t border-line pt-5">
          <p className="text-caption text-subtle">{software.intro}</p>

          {/* Each name is nowrap so no product name splits across lines; the line
              itself wraps between names on a phone. */}
          <p className="mt-4 text-small text-subtle">
            {software.tools.map((tool, i) => (
              <Fragment key={tool}>
                {i > 0 && <span aria-hidden> · </span>}
                <span className="whitespace-nowrap">{tool}</span>
              </Fragment>
            ))}
          </p>

          <p className="mt-3 text-fine text-subtle/80">{software.note}</p>
        </div>
      </Container>
    </section>
  );
}
