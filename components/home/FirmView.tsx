import { Check, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { firmView } from "@/content/home";
import { Card } from "@/components/ui/Card";

/*
  What a US firm sees when it searches the database.

  The hero shows one profile. This shows the search that profile turns up in,
  which is the literal answer to the question step three is asking: "US firms
  search the database, contact you directly, and hire you." Showing the search is
  more persuasive than describing it, and it is honest, because it is the product
  rather than a claim about traction.

  Sample data, and it says so. The names are realistic Indian names rather than
  placeholders, because "Jane Doe" in a product shot reads as a mock-up of
  something that does not exist.
*/
export function FirmView() {
  return (
    <div className="reveal">
      <Card>
        <div className="flex items-center gap-2 text-small font-medium text-ink">
          <MagnifyingGlass size={16} weight="light" className="text-subtle" />
          {firmView.heading}
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {firmView.filters.map((f) => (
            <li
              key={f}
              className="rounded-full bg-mist px-3 py-1 text-caption text-muted"
            >
              {f}
            </li>
          ))}
        </ul>

        <ul className="mt-5 divide-y divide-line border-t border-line">
          {firmView.results.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-small font-medium text-ink">{r.name}</p>
                <p className="text-caption text-subtle">{r.credential}</p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-caption font-medium text-white">
                <Check size={11} weight="bold" />
                {firmView.verified}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-3 text-caption text-subtle">{firmView.caption}</p>
    </div>
  );
}
