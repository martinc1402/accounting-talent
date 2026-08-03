import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

/*
  Label + optional helper + error, shared by every field on the employer intake
  form. Lifted out of EmployerBrief, where it was a local unexported function, so
  the new fields on that form and any future form use one wrapper rather than
  three that slowly diverge.

  `group` renders the label as a span carrying the id that chip groups reference
  via aria-labelledby; otherwise it is a real <label htmlFor>. A chip group is not
  a single form control, so a <label> pointing at it would be pointing at nothing.

  NO "use client" HERE. It has no hooks and no handlers, so it renders in whatever
  context imports it. EmployerBrief is a client component and this becomes part of
  that tree; a server-rendered form could use the same component unchanged.

  The label is above the control and the error below it, always. Placeholder text
  is never the label: it disappears on focus, it fails contrast in most designs,
  and a screen reader treats it as a hint rather than a name.
*/
export function Field({
  id,
  label,
  required = false,
  help,
  error,
  group = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  group?: boolean;
  children: ReactNode;
}) {
  const labelContent = (
    <>
      {label}
      {required && (
        <span className="text-navy" aria-hidden>
          {" "}
          *
        </span>
      )}
    </>
  );

  return (
    <div>
      {group ? (
        <span id={`${id}-label`} className="block text-caption font-medium text-ink">
          {labelContent}
        </span>
      ) : (
        <label htmlFor={id} className="block text-caption font-medium text-ink">
          {labelContent}
        </label>
      )}
      {help && <p className="mt-1 text-fine text-subtle">{help}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-small text-red-800"
        >
          <WarningCircle size={16} weight="light" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
