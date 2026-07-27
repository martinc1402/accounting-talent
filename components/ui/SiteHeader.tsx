import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AccountMenu } from "@/components/ui/AccountMenu";

/*
  The minimal site header, viewer-aware. Authenticated employers get understated
  account controls (Saved candidates, Introductions, account menu with plan);
  anonymous visitors get For-employers + Sign-in. Presentational: the caller
  resolves the viewer and passes `nav`. Kept to a single line, <= 72px tall.
*/
export type SiteHeaderNav = {
  authenticated: boolean;
  label?: string; // account name, candidate name, or email
  plan?: "free" | "paid";
  /** "employer" → employer controls; "candidate" → their own profile; otherwise a
   *  bare signed-in state (account menu with Sign out only). */
  role?: "employer" | "candidate";
};

const LINK =
  "text-caption font-semibold text-muted transition hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-card px-1 py-1";

export function SiteHeader({ nav }: { nav: SiteHeaderNav }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5 lg:h-[72px] lg:px-8">
        <Logo />
        {nav.authenticated ? (
          <nav className="flex items-center gap-3 sm:gap-5" aria-label="Account">
            {/* Inline links on desktop; the account menu carries them on mobile.
                Employers get shortlist controls; candidates get their own profile. */}
            {nav.role === "employer" && (
              <>
                <Link href="/employer/saved" className={`hidden sm:inline-block ${LINK}`}>
                  Saved candidates
                </Link>
                <Link href="/employer/introductions" className={`hidden sm:inline-block ${LINK}`}>
                  Introductions
                </Link>
              </>
            )}
            {nav.role === "candidate" && (
              <Link href="/candidates/me" className={`hidden sm:inline-block ${LINK}`}>
                Your profile
              </Link>
            )}
            <AccountMenu label={nav.label ?? "Account"} plan={nav.plan} role={nav.role} />
          </nav>
        ) : (
          <nav className="flex items-center gap-4" aria-label="Account">
            <Link href="/employers" className={`hidden sm:inline-block ${LINK}`}>
              For employers
            </Link>
            <Link
              href="/login"
              className="rounded-card bg-navy px-4 py-2 text-caption font-semibold text-paper transition hover:bg-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

/** Build the header nav summary from a resolved Viewer. Role-aware: employers get
 *  employer controls, candidates get their own profile. */
export function navFromViewer(viewer: {
  kind: "anonymous" | "user";
  email?: string;
  account?: { name: string; plan: "free" | "paid" } | null;
  candidate?: { name: string } | null;
}): SiteHeaderNav {
  if (viewer.kind !== "user") return { authenticated: false };
  if (viewer.account) {
    return { authenticated: true, label: viewer.account.name, plan: viewer.account.plan, role: "employer" };
  }
  if (viewer.candidate) {
    return { authenticated: true, label: viewer.candidate.name, role: "candidate" };
  }
  return { authenticated: true, label: viewer.email ?? "Account" };
}
