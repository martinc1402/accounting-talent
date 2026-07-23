import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getViewer } from "@/lib/authz/viewer";
import { EmployerPanel } from "./EmployerPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employer account",
  robots: { index: false, follow: false },
};

export default async function EmployerPage() {
  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login?next=/employer");

  const account = viewer.account
    ? {
        name: viewer.account.name,
        verificationState: viewer.account.verificationState,
        plan: viewer.account.plan,
      }
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <header className="flex items-center justify-between border-b border-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between px-5 lg:h-[72px] lg:px-8">
          <Logo />
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-caption font-semibold text-muted hover:text-navy">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[520px] flex-1 px-5 py-12">
        <EmployerPanel account={account} />
      </main>
    </div>
  );
}
