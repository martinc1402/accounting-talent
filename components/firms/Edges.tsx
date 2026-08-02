import {
  FileText,
  ShieldCheck,
  Handshake,
  Bank,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 6: the paperwork around a cross-border hire.

  [TODO: LEGAL REVIEW] REQUIRED BEFORE THIS SHIPS. Every string this renders
  describes a document we say we supply, and touches client-consent and
  cross-border payment. The copy lives in `firms.edges` (content/firms.ts) and
  needs sign-off there, not here. content/legal.ts carries the same flag.

  A 2x2 grid with a leading icon, not the bordered rows the vetting section uses
  and not cards. Four items with one-line-ish bodies do not need elevation, and
  repeating the ledger layout twice in four sections would flatten the page. The
  icons carry the variation instead.

  The disclaimer keeps its boxed treatment. It is the one paragraph on this page
  that a reader should be able to find without reading around it.
*/

const ICONS: ReactNode[] = [
  <FileText key="agreement" size={22} weight="light" />,
  <ShieldCheck key="confidentiality" size={22} weight="light" />,
  <Handshake key="consent" size={22} weight="light" />,
  <Bank key="payment" size={22} weight="light" />,
];

export function Edges() {
  const { edges } = firms;

  return (
    <section className="bg-paper py-16 lg:py-28">
      <Container>
        <div className="max-w-[900px]">
          <SectionHeading className="reveal">{edges.heading}</SectionHeading>
          <p className="reveal mt-5 max-w-[64ch] text-body text-muted">
            {edges.intro}
          </p>

          <ul className="reveal-group mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {edges.items.map((item, i) => (
              <li key={item.title} className="reveal">
                <span className="text-navy" aria-hidden>
                  {ICONS[i]}
                </span>
                <h3 className="mt-3 text-body font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[46ch] text-body text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <p className="reveal mt-10 max-w-[72ch] rounded-card border border-line bg-white p-5 text-small text-subtle">
            {edges.disclaimer}
          </p>
        </div>
      </Container>
    </section>
  );
}
