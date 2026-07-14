import { Fragment } from "react";
import { software } from "@/content/home";
import { Container } from "@/components/ui/Container";

/*
  The tools this audience already works in, sitting directly under the hero the
  way a logo wall would.

  Typographic, not logos, and that is a deliberate call rather than a shortcut.
  Four of the six (Drake, Lacerte, CCH, UltraTax) have no mark in any open icon
  library, so a "logo wall" would have been two real logos and four hand-drawn
  approximations. More importantly, putting Intuit and Wolters Kluwer trademarks
  on the page to illustrate what our candidates can do, rather than an
  integration we have actually built, implies a partnership that does not exist.
  On a site whose entire pitch is that it does not overstate things, that is the
  wrong trade for some visual texture.

  A line of prose, not a row of chips. The chips were outlined and padded and
  looked exactly like filter buttons, so they promised an interaction that does
  not exist. Nothing here is clickable, focusable, or hoverable, and it is now
  built that way rather than merely failing to be a button.

  No bottom padding. The gap to the next section is owned by TheMath's top
  padding, the way every other section on the page works. Paying for it twice is
  what made this gap ~1.8x the rhythm of the other in-band gaps.
*/
export function SoftwareStrip() {
  return (
    <section>
      <Container>
        <div className="reveal border-t border-line pt-8">
          <p className="text-caption text-subtle">{software.intro}</p>

          {/*
            Each name is nowrap so no product name ever splits across lines. The
            line itself is free to wrap between names, which is what it does on a
            phone.
          */}
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
