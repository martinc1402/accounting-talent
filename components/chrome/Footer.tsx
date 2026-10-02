import Link from "next/link";
import { footer } from "@/content/site";
import { Logo } from "@/components/ui/Logo";

/*
  Navy, so that on the homepage it reads as one continuous block with the final
  CTA above it. That is the single deliberate color-block moment on the site.
*/
export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 border-b border-white/15 pb-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo tone="white" />
            <p className="mt-3 max-w-[30ch] text-small text-white/70">
              {footer.tagline}
            </p>
          </div>

          <nav className="flex flex-col gap-3 md:items-end">
            {footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-small text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${footer.email}`}
              className="text-small text-white/80 transition-colors hover:text-white"
            >
              {footer.email}
            </a>
          </nav>
        </div>

        <p className="mt-8 max-w-[70ch] text-caption text-white/55">
          {footer.disclosure}
        </p>
      </div>
    </footer>
  );
}
