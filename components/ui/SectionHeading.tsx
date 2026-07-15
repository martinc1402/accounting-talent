/*
  Every section headline on the site goes through here. Before this, each one
  carried its own hand-copied `display text-[2.1rem] lg:text-[3rem]`, so the
  five of them drifted apart whenever one was touched.

  It also matters for "the flip": when the homepage swaps to the employer pitch,
  the headings come along without anyone having to re-derive the scale.
*/

// flip to add small-caps chapter labels above section headings
const SHOW_SECTION_KICKERS = false;

export function SectionHeading({
  children,
  as: Tag = "h2",
  tone = "ink",
  kicker,
  className = "",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2";
  tone?: "ink" | "navy" | "white";
  // A small-caps "chapter" label above the heading, e.g. "The math". Only
  // rendered when SHOW_SECTION_KICKERS is on; off, the component's output is
  // identical to a bare heading whether or not a kicker was passed.
  kicker?: string;
  className?: string;
}) {
  const toneClass = {
    ink: "text-ink",
    navy: "text-navy",
    white: "text-white",
  }[tone];

  return (
    <>
      {SHOW_SECTION_KICKERS && kicker && (
        <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">
          {kicker}
        </p>
      )}
      <Tag className={`display display-section ${toneClass} ${className}`}>
        {children}
      </Tag>
    </>
  );
}
