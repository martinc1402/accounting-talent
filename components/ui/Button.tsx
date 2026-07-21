import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/*
  Shape system: buttons are always full-pill, cards and inputs are 0.5rem.
  Navy on white and white on navy both clear WCAG AA comfortably
  (#131F5B on #FFFFFF is 14.2:1).
*/
// 18px, matching Spark. Buttons were the most under-scaled element on the site
// after the lede, and a small CTA reads as an apologetic one.
const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-3 text-[18px] font-medium transition-all duration-200 active:translate-y-px sm:px-6";

const variants = {
  primary: "bg-navy text-white hover:bg-navy-deep",
  inverse: "bg-white text-navy hover:bg-mist",
  outline: "border border-navy/25 bg-transparent text-navy hover:bg-mist",
  // Secondary CTA on a navy band: white outline, no fill.
  outlineInverse:
    "border border-white/40 bg-transparent text-white hover:bg-white/10",
} as const;

type Variant = keyof typeof variants;

export function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ButtonAction({
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
