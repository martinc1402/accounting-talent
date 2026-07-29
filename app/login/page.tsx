import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { safeNext } from "@/lib/auth/accounts";
import { LoginForm } from "./LoginForm";

/*
  One sign-in page for everyone. The email address is the identity; whether it
  belongs to an accountant or to a firm is resolved server-side after the link is
  clicked (app/auth/callback), so nothing here asks the visitor to pick a side.

  `absolute` on the title escapes the root template's "| AccountingTalent.in"
  suffix (app/layout.tsx).
*/
export const metadata: Metadata = {
  title: { absolute: "Sign in — AccountingTalent" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 py-12">
        <LoginForm next={safeNext(next) ?? undefined} linkFailed={error === "1"} />
        {/* Both ways in, offered once, without implying which one the reader
            belongs to. Stacked rather than inline: side by side they read as one
            run-on sentence, and the second label breaks mid-phrase at 420px.
            Applying is the common case, so it leads at body size; the employer
            line sits well under it, quieter and at regular weight. The gap
            between the two lines is wider than the gap above them on purpose:
            set 6px apart at similar weight they read as one two-line block, and
            the employer route is a separate offer, not a continuation.

            No rest-state underline — two underlined runs this close together
            read as noise. Weight and colour carry the affordance, underline
            comes back on hover and on keyboard focus. The native focus outline
            is left alone so it stays visible for keyboard nav. */}
        <p className="mt-3 text-center text-small text-muted">
          New here?{" "}
          <Link
            href="/apply"
            className="font-semibold whitespace-nowrap text-navy no-underline underline-offset-2 hover:underline focus-visible:underline"
          >
            Apply as an accountant →
          </Link>
        </p>
        <p className="mt-5 text-center text-caption text-subtle">
          <Link
            href="/employers"
            className="whitespace-nowrap text-navy no-underline underline-offset-2 hover:underline focus-visible:underline"
          >
            Hiring? Learn about employer access
          </Link>
        </p>
      </main>
    </div>
  );
}
