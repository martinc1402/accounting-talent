import type { CapabilityStatus } from "@/content/passport";
import { ICONS, type IconName } from "@/components/marketing/icons";
import { StatusLabel } from "@/components/marketing/StatusLabel";
import { Card, CardTitle, CardBody } from "@/components/ui/Card";

/*
  The icon-led feature grid, extracted from Edges (plain) and WhoWeWant (cards).

  THIS FIXES A REAL BUG. Edges held its icons in a positional array and rendered
  ICONS[i] against the content array, so reordering the copy silently reassigned
  every icon to the wrong item, with nothing in the build to catch it. Items now
  name their icon and this component looks it up. The failure mode is gone rather
  than merely documented.

  Two variants because the page needs two densities. `plain` is icon, title, body
  with no container: four short items do not need elevation, and repeating an
  elevated grid in consecutive sections flattens a page into a card catalogue.
  `card` is the WhoWeWant treatment, for when items are the section rather than a
  supporting list.

  Note Card bakes its padding into the base and this project has no tailwind-merge,
  so a p-* passed through className collides rather than replaces. Do not try it.
*/
export type FeatureItem = {
  title: string;
  body: string;
  icon?: IconName;
  status?: CapabilityStatus;
  /** Marks the one item that carries the section's weight. `card` variant only. */
  feature?: boolean;
};

export function FeatureGrid({
  items,
  columns = 2,
  variant = "plain",
}: {
  items: readonly FeatureItem[];
  columns?: 2 | 3;
  variant?: "plain" | "card";
}) {
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";

  if (variant === "card") {
    return (
      <ul className={`reveal-group grid gap-5 ${cols}`}>
        {items.map((item) => (
          <li key={item.title} className="reveal">
            <Card tone={item.feature ? "feature" : "default"}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <CardTitle>{item.title}</CardTitle>
                {item.status && (
                  <StatusLabel
                    status={item.status}
                    tone={item.feature ? "onNavy" : "light"}
                  />
                )}
              </div>
              <CardBody tone={item.feature ? "feature" : "default"}>
                {item.body}
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`reveal-group grid gap-x-10 gap-y-9 ${cols}`}>
      {items.map((item) => (
        <li key={item.title} className="reveal">
          {item.icon && (
            <span className="text-navy" aria-hidden>
              {ICONS[item.icon]}
            </span>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-body font-medium text-ink">{item.title}</h3>
            {item.status && <StatusLabel status={item.status} />}
          </div>
          <p className="mt-2 max-w-[46ch] text-body text-muted">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
