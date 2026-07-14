import type { ReactNode } from "react";

/*
  The one content grid. Every section's left edge resolves from here, so the
  page has a single alignment spine rather than five copies of the same string
  that happen to agree today and drift tomorrow.
*/
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1240px] px-5 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
