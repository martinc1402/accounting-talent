import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Container } from "@/components/ui/Container";
import { ReserveMembership } from "@/components/jobs/ReserveMembership";
import { pageMetadata } from "@/lib/seo";
import { getAccess } from "@/content/jobs";

/*
  "Reserve a founding membership". Where every job-seeker pricing CTA lands.

  Payments are not built. This page collects a reservation (who, where they want
  to work, role, experience, the plan they'd pick) into membership_reservations
  via the reserveMembership server action, and says plainly that nothing is
  charged. TODO(payments): Razorpay / Stripe checkout goes here.

  Static, like "/": the ?plan= and ?currency= a homepage CTA carries are read on
  the client (components/jobs/currency.ts), never through searchParams.
*/
export const metadata: Metadata = pageMetadata({
  title: "Reserve a Founding Membership | AccountingTalent",
  description:
    "Reserve a founding membership for remote and overseas accounting jobs. Nothing is charged today; founding members get a launch discount.",
  path: "/get-access",
  ogTitle: "Reserve a founding membership",
  ogDescription:
    "Remote and overseas accounting jobs, straight from employers' career pages. Nothing is charged today; founding members get a launch discount.",
  locale: "en_IN",
});

export default function GetAccessPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-mist">
        <Container className="pt-12 pb-16 lg:pt-20 lg:pb-28">
          <div className="max-w-[820px]">
            <p className="text-caption font-medium tracking-wide text-subtle uppercase">
              {getAccess.eyebrow}
            </p>
            <h1 className="display display-page mt-3 text-ink">{getAccess.h1}</h1>
            <ul className="mt-6 space-y-2.5">
              {getAccess.points.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Check size={18} weight="bold" aria-hidden className="mt-1 shrink-0 text-navy" />
                  <span className="text-body text-muted">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 lg:mt-16">
            <ReserveMembership />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
