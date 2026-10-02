import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr";
import { navItems, memberCta } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

/*
  One header for every public page. Three items and one CTA, identical
  everywhere: the site sells one thing now, so the audience-specific variants
  (firm, worker, job seeker) collapsed into this. See content/site.ts.

  A server component that ships no JavaScript. The mobile menu is a native
  <details> disclosure.

  The header is opaque, not translucent: bg-white/85 with a backdrop blur turned
  murky over the navy closing band, and a full-width backdrop-filter is the most
  expensive thing this page could ask a cheap Android phone to repaint on every
  scroll frame.
*/
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* px-4 and gap-2 at base: at 360px the logo, the CTA and the hamburger
          have to share 328px of usable width, which is why the logo drops to the
          mark alone below sm. */}
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 lg:h-[72px] lg:px-8">
        <Logo compact href="/" />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-2 text-small text-muted transition-colors hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button href={memberCta.href}>{memberCta.label}</Button>

          <details className="relative lg:hidden">
            <summary
              aria-label="Open menu"
              className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-navy transition-colors hover:bg-mist [&::-webkit-details-marker]:hidden"
            >
              <List size={22} weight="light" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-navy/15 bg-paper p-1">
              <nav aria-label="Main">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-[16px] text-muted transition-colors hover:bg-navy/5 hover:text-navy"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
