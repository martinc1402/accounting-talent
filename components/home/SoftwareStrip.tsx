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

  It lives inside the hero's white band. It is a strip, not a section, and the
  page's band budget is already spent.
*/
export function SoftwareStrip() {
  return (
    <section className="pb-16 lg:pb-20">
      <Container>
        <div className="reveal border-t border-line pt-8">
          <p className="text-caption text-subtle">{software.intro}</p>

          <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3">
            {software.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-card border border-line px-4 py-2.5 text-small font-medium text-muted"
              >
                {tool}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-caption text-subtle/80">{software.note}</p>
        </div>
      </Container>
    </section>
  );
}
