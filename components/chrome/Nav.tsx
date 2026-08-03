import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr";
import { navItems, primaryCta, employerCta } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Cta } from "@/components/firms/Cta";

/*
  One header for the whole site. Four flat items, identical on every route; only
  the CTA changes with the audience.

  THIS FILE IS A SERVER COMPONENT AGAIN, and the whole header now ships no
  JavaScript of its own. The disclosure state for the old audience dropdowns was
  the only thing that needed a client leaf; with a flat list there is nothing to
  open, so components/chrome/NavGroup.tsx is gone. See content/site.ts for why the
  groups were retired and where to find them if they come back. <Cta> is still a
  client component, but that is one button, not the navigation.

  The mobile menu is a native <details> disclosure and always has been. It is now
  a single flat list rather than two captioned groups, which is what the desktop
  nav collapses to anyway.

  `active` is a prop rather than usePathname() because that hook would make this a
  client component and pull the header's JavaScript back in for real. It marks the
  item whose page you are on. With a flat nav the only whole-page item is
  "/accountants": the other three are sections of "/", and lighting one of them up
  based on route alone would mark "Find Talent" as current the entire time a
  reader is on the homepage, including while they are reading the pricing.

  `audience` drives the CTA only. An accountant shown "Post a role free" has been
  handed an employer's action, so this stays split. Consistency in structure, not
  in call to action.

  The header is opaque, not translucent. It used to be bg-white/85 with a backdrop
  blur, which reads fine over the light bands but turns a murky grey when it sits
  over the navy closing CTA and footer. Opaque also drops a full-width
  backdrop-filter, which is the most expensive thing this page could ask a cheap
  Android phone to repaint on every scroll frame.
*/
export function Nav({
  active,
  audience = "firm",
}: {
  active?: string;
  audience?: "firm" | "worker";
}) {
  const isWorker = audience === "worker";
  const cta = isWorker ? primaryCta : employerCta;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* px-4 and gap-2 at base: at 360px the logo, the CTA and the hamburger
          have to share 328px of usable width, which is why the logo drops to the
          mark alone below sm. */}
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 lg:h-[72px] lg:px-8">
        {/* The logo always goes to "/". The old header pointed it at
            /accountants for worker pages, which made the wordmark mean two
            different things depending on where you already were. */}
        <Logo compact href="/" />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navItems.map((item) => {
            const isActive = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-2 text-small transition-colors hover:text-navy ${
                  isActive ? "text-navy" : "text-muted"
                }`}
              >
                {item.label}
                {/* The ledger hairline that marked an active group in the
                    dropdown nav, kept: it is the site's existing vocabulary for
                    "you are here" and does not shift layout. */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-navy/30"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {/* On firm pages the nav CTA is the top-of-page ("hero") founding CTA,
              so it fires cta_click{position:hero}; on worker pages it's the plain
              application CTA. Same button styling either way. */}
          {isWorker ? (
            <Button href={cta.href}>{cta.label}</Button>
          ) : (
            <Cta position="hero" />
          )}

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
