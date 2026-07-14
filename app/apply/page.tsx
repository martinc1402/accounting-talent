import type { Metadata } from "next";
import Link from "next/link";
import { intro } from "@/content/form";
import { Logo } from "@/components/ui/Logo";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { footer } from "@/content/site";

/*
  The ad landing page. Deliberately stripped: logo only, no nav, one thing to
  do. Ad traffic should not be given an exit.
*/
export const metadata: Metadata = {
  title: "Apply free",
  // Page-level robots fully replaces the layout's, which is what we want here.
  robots: { index: false, follow: false },
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const utm = {
    source: first("utm_source"),
    medium: first("utm_medium"),
    campaign: first("utm_campaign"),
  };

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[820px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="flex-1 bg-paper py-12 lg:py-20">
        <div className="mx-auto max-w-[820px] px-5 lg:px-8">
          <h1 className="display display-page max-w-[18ch] text-ink">
            {intro.h1}
          </h1>

          <div className="mt-10">
            <ApplyForm utm={utm} />
          </div>

          <p className="mt-8 max-w-[62ch] text-caption text-subtle">
            {intro.belowForm} Questions?{" "}
            <Link href="/faq" className="text-navy underline underline-offset-4">
              See the FAQ
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-[820px] px-5 lg:px-8">
          <p className="text-caption text-subtle">
            {footer.disclosure}
          </p>
        </div>
      </footer>
    </>
  );
}
