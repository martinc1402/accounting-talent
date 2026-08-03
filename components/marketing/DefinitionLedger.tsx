/*
  The two-column ledger: term on the left, a real paragraph on the right, one
  hairline per row.

  Extracted from Vetting, where it was the right answer to a problem three other
  sections also have: each item carries a paragraph, and a checkmark grid or a
  card grid cannot hold a paragraph without turning into a wall.

  ONE HAIRLINE PER ROW. `rule="top"` puts a border-t on every row; `rule="bottom"`
  puts a border-b. Never both. A list carrying border-t AND border-b doubles every
  internal rule, which is the spec-sheet look this site avoids. The two variants
  exist because the promise list in the honest section reads better closed at the
  bottom, and the vetting list reads better opened at the top.

  `stacked` drops the 4/8 column split and puts the body under the term. The
  Passport pillars need that: their bodies are long enough that a 4/8 split leaves
  the term column mostly empty.
*/
export type LedgerRow = {
  term: string;
  body: string;
};

export function DefinitionLedger({
  rows,
  rule = "top",
  stacked = false,
}: {
  rows: readonly LedgerRow[];
  rule?: "top" | "bottom";
  stacked?: boolean;
}) {
  const ruleClass = rule === "top" ? "border-t border-line" : "border-b border-line";

  return (
    <dl className="reveal-group">
      {rows.map((row) => (
        <div
          key={row.term}
          className={
            stacked
              ? `reveal ${ruleClass} py-6`
              : `reveal grid gap-y-2 ${ruleClass} py-7 lg:grid-cols-12 lg:gap-x-10`
          }
        >
          <dt
            className={
              stacked
                ? "text-body font-medium text-navy"
                : "text-body font-medium text-navy lg:col-span-4"
            }
          >
            {row.term}
          </dt>
          <dd
            className={
              stacked
                ? "mt-2 max-w-[68ch] text-body text-muted"
                : "max-w-[62ch] text-body text-muted lg:col-span-8"
            }
          >
            {row.body}
          </dd>
        </div>
      ))}
    </dl>
  );
}
