import type { CapabilityStatus } from "@/content/passport";
import { statusLabels } from "@/content/passport";

/*
  The one way the site says "this is not built yet".

  Returns null for "live". A working feature does not announce that it works, and
  a page where every item carries a label is a page where the labels stop being
  read, which defeats the entire purpose of having them.

  Deliberately quiet: this is a factual note, not a warning. It sits at caption
  size on a mist (or, on navy, a translucent white) pill, in the same family as
  the PillGroup treatment on ProfileCard. It is not orange, not a badge with an
  exclamation, and not the verified green.

  --color-verified is off limits here. globals.css records that the green "exists
  for exactly one thing: the Verified state. It appears nowhere else." A green
  "Launching soon" would be the one colour on the site that carries meaning,
  attached to the one thing that has not happened.
*/
export function StatusLabel({
  status,
  tone = "light",
}: {
  status: CapabilityStatus;
  tone?: "light" | "onNavy";
}) {
  if (status === "live") return null;

  const toneClass =
    tone === "onNavy"
      ? "bg-white/15 text-paper/85"
      : "bg-mist text-subtle";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-fine font-medium tracking-wide uppercase ${toneClass}`}
    >
      {statusLabels[status]}
    </span>
  );
}
