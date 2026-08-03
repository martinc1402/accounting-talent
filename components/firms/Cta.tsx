"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { firms } from "@/content/firms";
import { trackCta, type CtaPosition } from "@/lib/analytics";

/*
  The repeated primary CTA. One mechanism everywhere: a hash link to the
  #reserve brief (which carries scroll-mt to clear the sticky header), with an
  onClick that fires cta_click so the smoke test can see which position converts.
  `variant="button"` for section CTAs (tone switches to white-on-navy on the final
  band); `variant="link"` for a quiet inline CTA. Label and target come from
  firms.reserve.
*/
export function Cta({
  position,
  variant = "button",
  tone = "primary",
  className = "",
}: {
  position: CtaPosition;
  variant?: "button" | "link";
  /* outlineInverse for the navy closing band, where this is now the SECONDARY
     action beside "Explore talent". A second solid white button next to the
     first would give two equal-weight doors on the one band where the page is
     supposed to be pointing at one. */
  tone?: "primary" | "inverse" | "outlineInverse";
  className?: string;
}) {
  const { label, href } = firms.reserve;
  const onClick = () => trackCta(position);

  if (variant === "link") {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`group inline-flex items-center gap-1.5 text-body font-medium text-navy transition-colors hover:text-navy-deep ${className}`}
      >
        {label}
        <ArrowRight
          size={16}
          weight="light"
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </a>
    );
  }

  return (
    <Button href={href} variant={tone} onClick={onClick} className={className}>
      {label}
    </Button>
  );
}
