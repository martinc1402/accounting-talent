/*
  The mark: an "A" drawn as a peak crossed by two horizontal rules. It is the
  same ledger motif as the 1px rule under "Talent" in the wordmark, which is why
  the two sit together without arguing.

  Two changes from the supplied asset:

  - The source strokes #1A2456, which is not this site's navy (#131F5B). Left as
    supplied it would sit 8px from a wordmark in text-navy and read as two
    slightly different blues. It strokes currentColor instead, so it takes navy
    in the nav and white in the footer from whatever it is nested in. This is
    also why the mark is inlined rather than served as an <img>: an <img> cannot
    inherit currentColor, and the footer logo would be invisible on the navy band.

  - The source carries role="img" and a <title>. The <Link> in Logo already has
    aria-label="AccountingTalent.in home", so keeping them would announce the
    logo twice. It is decorative here.
*/
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M12.5 52 C 17.8 37, 23 23, 28.6 13.2 C 29.6 12.35, 30.8 11.9, 32 11.9 C 33.2 11.9, 34.4 12.35, 35.4 13.2 C 41 23, 46.2 37, 51.5 52" />
        <path d="M27.5 35 L36.5 35" />
        <path d="M27.5 44.5 L36.5 44.5" />
      </g>
    </svg>
  );
}
