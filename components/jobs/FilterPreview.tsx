import { Check } from "@phosphor-icons/react/dist/ssr";
import { filters } from "@/content/jobs";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusLabel } from "@/components/marketing/StatusLabel";

/*
  A picture of the search, not the search. The chips are spans, not buttons or
  checkboxes: nothing here is interactive because nothing behind it exists, and a
  control that does nothing on tap is worse than no control. The panel is
  labelled "Launching soon" for the same reason.

  Some chips render "selected" to show a realistic query (Gulf roles that mention
  sponsorship, audit, mid-level, posted recently). That is the one example
  combination; it is not a claim about what is popular.
*/
export function FilterPreview() {
  return (
    <section id="filters" className="scroll-mt-24 bg-paper py-16 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <SectionHeading>{filters.heading}</SectionHeading>
            </div>
            <p className="mt-5 max-w-[44ch] text-body text-muted">{filters.sub}</p>
            <p className="mt-6 max-w-[44ch] text-small text-subtle">
              {filters.footnote}
            </p>
          </div>

          <div
            className="rounded-card border border-line bg-mist p-5 sm:p-7 lg:col-span-7"
            aria-label="Preview of the planned job filters"
            role="figure"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-small font-medium text-ink">Filters</p>
              <StatusLabel status="planned" />
            </div>

            <dl className="mt-5 space-y-5">
              {filters.groups.map((group) => (
                <div key={group.label}>
                  <dt className="text-caption font-medium text-subtle">
                    {group.label}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const on = (group.selected as readonly string[]).includes(opt);
                      return (
                        <span
                          key={opt}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption ${
                            on
                              ? "border-navy bg-navy text-white"
                              : "border-line bg-white text-muted"
                          }`}
                        >
                          {on && <Check size={12} weight="bold" aria-hidden />}
                          {opt}
                          {on && <span className="sr-only"> (selected)</span>}
                        </span>
                      );
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
