import { MagnifyingGlass, SealCheck, User } from "@phosphor-icons/react/dist/ssr";
import { firmView } from "@/content/home";
import { Card } from "@/components/ui/Card";

/*
  What a US firm sees when it searches the database.

  The hero shows one profile. This shows the search that profile turns up in,
  which is the literal answer to the question step three is asking: "US firms
  search the database, contact you directly, and hire you." Showing the search is
  more persuasive than describing it, and it is honest, because it is the product
  rather than a claim about traction.

  Same visual language as the hero's ProfileCard, at search-result scale: the
  anonymous avatar, the sealed Verified check, the name-then-credentials
  hierarchy. A reader who saw the hero card recognises these as the same object.

  The panel itself stays white. Two navy cards in one viewport would fight, and
  this is a search result, not the thing being sold.

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
            <li key={r.name} className="flex items-center gap-3 py-3">
              {/* The same empty avatar the hero card uses: a firm sees the work
                  before it sees the face. */}
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mist text-subtle/60"
              >
                <User size={18} weight="light" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-small font-medium text-ink">
                  {r.name}
                  {/*
                    The deep green, not the bright one. The bright green that
                    clears AA on the navy card manages only 2.28:1 on white;
                    this one is 5.02:1. Same hue, different surface.
                  */}
                  <SealCheck
                    size={15}
                    weight="fill"
                    className="shrink-0 text-verified-deep"
                    aria-label={firmView.verified}
                  />
                </p>
                <p className="truncate text-caption text-subtle">
                  {r.role} · {r.credential}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-3 text-caption text-subtle">{firmView.caption}</p>
    </div>
  );
}
