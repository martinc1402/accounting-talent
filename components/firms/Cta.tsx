"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { firms } from "@/content/firms";
import { trackCta, type CtaPosition } from "@/lib/analytics";

/*
  The repeated "Become a founding firm" CTA. One mechanism everywhere: a hash
  link to the #founding form (which already carries scroll-mt to clear the sticky
  header), with an onClick that fires the cta_click event so the smoke test can
  see which position converts. `variant="button"` for the section CTAs (tone
  switches to the inverse white-on-navy button on the final band); `variant="link"`
  for the quiet inline CTA under the pool grid.
*/
export function Cta({
  position,
  variant = "button",
  tone = "primary",
  className = "",
}: {
  position: CtaPosition;
  variant?: "button" | "link";
  tone?: "primary" | "inverse";
  className?: string;
}) {
  const onClick = () => trackCta(position);

  if (variant === "link") {
    return (
      <a
        href="#founding"
        onClick={onClick}
        className={`group inline-flex items-center gap-1.5 text-body font-medium text-navy transition-colors hover:text-navy-deep ${className}`}
      >
        {firms.founding.cta}
        <ArrowRight
          size={16}
          weight="light"
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </a>
    );
  }

  return (
    <Button href="#founding" variant={tone} onClick={onClick} className={className}>
      {firms.founding.cta}
    </Button>
  );
}
