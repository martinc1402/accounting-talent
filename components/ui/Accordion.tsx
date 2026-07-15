import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { FaqItem } from "@/content/faq";

/*
  Native <details> disclosure. No JavaScript, works before hydration, and the
  browser handles keyboard and screen-reader semantics for free. The plus icon
  rotates 135deg into an x via a CSS rule in globals.css.

  The icon sits in a fixed-size box rather than being a bare glyph. A text "+"
  is as wide as the font decides, so its right edge drifted between rows; a
  size-6 box pins every icon to the same x and gives the rotation a stable
  centre. min-h-[44px] keeps the row a real tap target on a phone.
*/
export function Accordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details
          key={item.q}
          id={item.id}
          // scroll-mt clears the 72px sticky header when an item is an anchor
          // target, for both native #hash jumps and the /faq deep-link script's
          // scrollIntoView. Inert where no id is set (homepage, employer FAQ).
          className="group scroll-mt-24 border-b border-line first:border-t"
        >
          <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-body font-medium text-ink transition-colors group-hover:text-navy">
              {item.q}
            </h3>
            <span
              aria-hidden
              className="chevron flex size-6 shrink-0 items-center justify-center text-navy transition-transform duration-300"
            >
              <Plus size={18} weight="light" />
            </span>
          </summary>

          <div className="pb-7">
            {item.a.map((para) => (
              <p
                key={para}
                className="mt-3 max-w-[64ch] text-body text-muted first:mt-0"
              >
                {para}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
