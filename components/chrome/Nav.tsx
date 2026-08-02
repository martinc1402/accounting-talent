import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr";
import { navGroups, primaryCta, employerCta } from "@/content/site";
import { NavGroup } from "@/components/chrome/NavGroup";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Cta } from "@/components/firms/Cta";

/*
  One header for the whole site. Two groups, "Employers" and "Accountants", each
  a link to that audience's page whose dropdown holds that page's sections. The
  bar is identical on every route; only the CTA changes.

  THIS FILE STAYS A SERVER COMPONENT. The desktop dropdowns needed real
  disclosure semantics (aria-expanded, Escape restoring focus, arrow keys), which
  needs state, so that work lives in the <NavGroup> client leaf rather than here.
  The header shell, the logo, the CTA and the whole mobile menu render on the
  server. Same isolation as <Cta>, which was already the only client code here.

  That replaced a pure-CSS hover menu. It looked cheaper than it was: the panel
  sat at visibility:hidden until :hover or :focus-within, which meant a screen
  reader browsing by links list never saw the section anchors, and there was no
  honest way to express open/closed to assistive tech. See NavGroup.tsx for why
  the trigger is a button and not a link.

  The mobile menu is still a native <details> disclosure and still ships no
  JavaScript.

  `active` is a prop rather than usePathname() because that hook would make this
  file a client component and pull the header's JavaScript back in for real. It
  marks the GROUP whose page you are on: "/" lights Employers, "/accountants"
  lights Accountants, /faq lights Accountants (the worker FAQ lives there), and
  /legal lights neither because it belongs to no audience.

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

        {/* gap-6, not gap-8: the triggers now carry their own horizontal
            padding for the open-state tint, so the visual gap between words is
            unchanged while the hit targets sit closer together. */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {navGroups.map((group) => (
            <NavGroup
              key={group.label}
              label={group.label}
              items={group.items}
              isActive={group.href === active}
            />
          ))}
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
            <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-navy/15 bg-paper p-1">
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
                        className="block px-4 py-3 text-[16px] text-muted transition-colors hover:bg-navy/5 hover:text-navy"
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
