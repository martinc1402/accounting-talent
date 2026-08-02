import Link from "next/link";
import { CaretDown, List } from "@phosphor-icons/react/dist/ssr";
import { navGroups, primaryCta, employerCta } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Cta } from "@/components/firms/Cta";

/*
  One header for the whole site. Two groups, "Employers" and "Accountants", each
  a link to that audience's page whose dropdown holds that page's sections. The
  bar is identical on every route; only the CTA changes.

  NO JAVASCRIPT IN THE MENU. The desktop dropdowns open on group-hover and on
  group-focus-within, both pure CSS. The mobile menu is a native <details>
  disclosure. The only client code in this header is <Cta>, which exists to fire
  a cta_click analytics event and predates this.

  Why focus-within works even though the panel starts at visibility:hidden: the
  trigger link lives inside the same .group wrapper, so tabbing to it satisfies
  group-focus-within, which reveals the panel, which makes the panel's own links
  focusable for the tabs that follow. Keyboard users get the menu in tab order.

  Known limit, accepted: because the panel is visibility:hidden until hover or
  focus, a screen-reader user browsing by links list will not see the section
  anchors at desktop width. They are reachable by tabbing, and the mobile
  <details> panel below carries every link in the DOM unconditionally. Fixing it
  properly means a disclosure button with aria-expanded, which means state, which
  means a client component for the whole header.

  The hover bridge matters. The panel wrapper carries the top padding rather than
  the panel itself, so the gap between the trigger and the card is inside the
  hovered element. Without it the menu closes as the pointer crosses the gap.

  `active` is a prop rather than usePathname() because that hook would make this
  a client component and pull the header's JavaScript back in. It now marks the
  GROUP whose page you are on, not an individual item: "/" lights Employers,
  "/accountants" lights Accountants.

  `audience` drives the CTA only. An accountant shown "Reserve founding access"
  has been handed an employer's action, so this stays split. Consistency in
  structure, not in call to action.

  The header is opaque, not translucent. It used to be bg-white/85 with a
  backdrop blur, which reads fine over the light bands but turns a murky grey
  when it sits over the navy closing CTA and footer. Opaque also drops a
  full-width backdrop-filter, which is the most expensive thing this page could
  have asked a cheap Android phone to repaint on every scroll frame.
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
        {/* The wordmark follows the audience so /accountants does not bounce an
            accountant to the firm pitch. */}
        <Logo compact href={isWorker ? "/accountants" : "/"} />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navGroups.map((group) => {
            const isActive = group.href === active;
            return (
              <div key={group.label} className="group relative">
                <Link
                  href={group.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-1 py-2 text-[16px] transition-colors ${
                    isActive ? "text-navy" : "text-muted hover:text-navy"
                  }`}
                >
                  {group.label}
                  <CaretDown
                    size={12}
                    weight="bold"
                    aria-hidden
                    className="mt-px transition-transform duration-200 group-hover:rotate-180"
                  />
                  {/* The same 1px ledger rule the wordmark carries under
                      "Talent". It is the site's one recurring mark, so it is
                      what marks the current section of the site too. */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-navy/30" />
                  )}
                </Link>

                {/* pt-3 on the wrapper, not the card: the gap between trigger
                    and panel has to be inside the hovered element or the menu
                    closes as the pointer crosses it. */}
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="w-60 rounded-card border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(19,31,91,0.18)]">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link
                          href={item.href}
                          className="block rounded-card px-4 py-2.5 text-[15px] text-muted transition-colors hover:bg-mist hover:text-navy"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
            {/* Flat, with a heading per group. No nested disclosure: two levels
                of tapping to reach a section is worse than a slightly longer
                panel, and every link stays in the DOM for screen readers. */}
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(19,31,91,0.18)]">
              {navGroups.map((group) => (
                <div key={group.label} className="py-1">
                  <p className="px-4 pt-2 pb-1 text-caption font-medium tracking-wide text-subtle uppercase">
                    {group.label}
                  </p>
                  <nav aria-label={group.label}>
                    {group.items.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className="block rounded-card px-4 py-3 text-[16px] text-muted transition-colors hover:bg-mist hover:text-navy"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
