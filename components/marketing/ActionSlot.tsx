import type { Action } from "@/content/passport";
import { Button } from "@/components/ui/Button";

/*
  Renders whatever a capability's Action allows, and nothing more.

  The "planned" branch renders a <p>. Not a <button>, not an <a>, no tabIndex,
  no disabled attribute. components/home/ProfileDetail.tsx already settled this
  argument for the inert profile controls and the reasoning transfers exactly:

    "Not a <button>, not an <a>, no tabIndex: there is nothing here to press, so
     there is nothing to focus... Deliberately NOT aria-hidden. With no role it is
     announced as plain text... a press animation on something that cannot be
     pressed is a small lie."

  DO NOT "improve" this into <button disabled>. A disabled button is still an
  interactive element in the accessibility tree. A keyboard user tabs to it, a
  screen reader announces a button, and both are told there is an action here
  when there is not. The <p> is the honest control, and it is also less code.

  The Action union is what makes this safe rather than merely careful: a "planned"
  action carries no href and no label, so this component could not render a link
  for one even if someone asked it to.
*/
export function ActionSlot({
  action,
  tone = "primary",
}: {
  action: Action;
  tone?: "primary" | "inverse";
}) {
  if (action.status === "planned") {
    return (
      <p className="max-w-[46ch] text-small text-subtle">{action.note}</p>
    );
  }

  return (
    <div>
      <Button href={action.href} variant={tone}>
        {action.label}
      </Button>
      {action.status === "early-access" && (
        <p className="mt-3 max-w-[46ch] text-caption text-subtle">
          {action.note}
        </p>
      )}
    </div>
  );
}
