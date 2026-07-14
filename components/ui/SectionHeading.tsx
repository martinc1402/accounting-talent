/*
  Every section headline on the site goes through here. Before this, each one
  carried its own hand-copied `display text-[2.1rem] lg:text-[3rem]`, so the
  five of them drifted apart whenever one was touched.

  It also matters for "the flip": when the homepage swaps to the employer pitch,
  the headings come along without anyone having to re-derive the scale.
*/
export function SectionHeading({
  children,
  as: Tag = "h2",
  tone = "ink",
  className = "",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2";
  tone?: "ink" | "navy" | "white";
  className?: string;
}) {
  const toneClass = {
    ink: "text-ink",
    navy: "text-navy",
    white: "text-white",
  }[tone];

  return (
    <Tag className={`display display-section ${toneClass} ${className}`}>
      {children}
    </Tag>
  );
}
