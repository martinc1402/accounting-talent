import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr";
import { nav, workerNav, primaryCta, employerCta } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Cta } from "@/components/firms/Cta";

/*
  The mobile menu is a native <details> disclosure, so the whole nav ships with
  zero JavaScript. <summary> has to be the first child of <details>, which is
  why the panel is an absolutely positioned dropdown hanging off the hamburger
  rather than a full-width drawer.

  The Apply button stays visible at every breakpoint. It is the only thing on
  this page that matters.

  The header is opaque, not translucent. It used to be bg-white/85 with a
  backdrop blur, which reads fine over the light bands but turns a murky grey
  when it sits over the navy closing CTA and footer. Opaque also drops a
  full-width backdrop-filter, which is the most expensive thing this page could
  have asked a cheap Android phone to repaint on every scroll frame.

  `active` is a prop rather than usePathname() because that hook would make this
  a client component and pull the nav's JavaScript back in. Every page already
  renders <Nav /> itself, so the caller knows the route.

  `audience` is separate from `active` on purpose. `active` says which item gets
  the ledger rule; `audience` says which list and which CTA to show at all. They
  are not the same question: /legal is firm-facing chrome but highlights nothing,
  and /faq is the worker FAQ, so it takes the worker nav while its own item is
  the active one.

  This used to infer everything from `active === "/employers"` and rebuild hrefs
  by string-matching "/#how-it-works". The rewrite broke the moment content/site
  changed. Picking a list is the same amount of code and cannot go stale.

  The two lists in content/site.ts are deliberately the same length and the same
  shape (two section anchors, FAQ, then the other audience's page). That is what
  makes the two homepages read as one product rather than as two sites sharing a
  wordmark. The CTA is the only thing that differs by design: an accountant shown
  "Reserve founding access" has been handed an employer's action. Consistency in
  structure, not in call to action. Do not equalise the CTAs, and do not let the
  lists drift to different lengths.
*/
export function Nav({
  active,
  audience = "firm",
}: {
  active?: string;
  audience?: "firm" | "worker";
}) {
  const isWorker = audience === "worker";
  const items = isWorker ? workerNav : nav;
  const cta = isWorker ? primaryCta : employerCta;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* px-4 and gap-2 at base: at 360px the logo, the CTA and the hamburger
          have to share 328px of usable width, which is why the logo drops to the
          mark alone below sm. */}
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 lg:h-[72px] lg:px-8">
        {/* The wordmark follows the audience for the same reason the nav items
            do: on /accountants it must not bounce the reader to the firm pitch. */}
        <Logo compact href={isWorker ? "/accountants" : "/"} />

        <nav className="hidden items-center gap-8 lg:flex">
          {items.map((item) => {
            const isActive = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative text-[16px] transition-colors ${
                  isActive ? "text-navy" : "text-muted hover:text-navy"
                }`}
              >
                {item.label}
                {/* The same 1px ledger rule the wordmark carries under "Talent".
                    It is the site's one recurring mark, so it is what marks the
                    current page too. */}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-navy/30" />
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
            <nav className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(19,31,91,0.18)]">
              {items.map((item) => {
                const isActive = item.href === active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-card px-4 py-3 text-[16px] transition-colors ${
                      isActive
                        ? "bg-mist font-medium text-navy"
                        : "text-muted hover:bg-mist hover:text-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
