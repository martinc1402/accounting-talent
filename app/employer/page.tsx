import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader, navFromViewer } from "@/components/ui/SiteHeader";
import { getViewer } from "@/lib/authz/viewer";
import { getLocalTestEmployer } from "@/lib/authz/testEmployer";
import { EmployerPanel } from "./EmployerPanel";
import { AdminPlanToggle } from "./AdminPlanToggle";

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

  // Admin-only local dev control for the test employer's plan.
  const testEmployer = viewer.isAdmin ? await getLocalTestEmployer() : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mist">
      <SiteHeader nav={navFromViewer(viewer)} />
      <main className="mx-auto w-full max-w-[520px] flex-1 px-5 py-12">
        <EmployerPanel account={account} />
        {testEmployer && (
          <AdminPlanToggle
            accountId={testEmployer.accountId}
            name={testEmployer.name}
            email={testEmployer.email}
            plan={testEmployer.plan}
          />
        )}
      </main>
    </div>
  );
}
