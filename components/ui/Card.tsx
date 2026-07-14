import type { ReactNode } from "react";

/*
  The one card system. The profile cells, the rate card and the hero's sample
  profile are all this component, so they cannot drift into three lookalikes
  with slightly different padding and borders.

  Two tones only:
  - default  white with a hairline. The neutral card.
  - feature  navy with light text. Exactly one card on the page uses this, and
             it carries a badge saying why, so the colour encodes meaning rather
             than decorating.

  Padding lives in the base rather than being overridable: the project has no
  tailwind-merge, so a `p-*` passed through className would collide with the
  base class instead of replacing it.
*/
const tones = {
  default: "border-line bg-white text-ink",
  feature: "border-navy bg-navy text-white",
} as const;

export function Card({
  tone = "default",
  className = "",
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`h-full rounded-card border p-7 lg:p-8 ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`text-body font-medium ${className}`}>{children}</h3>;
}

/*
  The body colour has to follow the tone: text-muted is a dark grey that
  disappears on navy, so the feature card gets white/80 instead.
*/
export function CardBody({
  tone = "default",
  children,
  className = "",
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mt-2 text-small ${
        tone === "feature" ? "text-white/80" : "text-muted"
      } ${className}`}
    >
      {children}
    </p>
  );
}
