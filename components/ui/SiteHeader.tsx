import Link from "next/link";
import { User } from "@phosphor-icons/react/dist/ssr";
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
  /** Rendered for fidelity but fully inert (the owner previewing as an employer).
   *  Every control is disabled; the yellow preview banner is the only live chrome. */
  preview?: boolean;
};

const LINK =
  "text-caption font-semibold text-muted transition hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-card px-1 py-1";
const INERT = "text-caption font-semibold text-muted rounded-card px-1 py-1 opacity-50 cursor-not-allowed";
const PREVIEW_TITLE = "Shown for preview only";

// A header that renders EXACTLY what the previewed viewer sees, but every control
// is inert (no navigation, no menu) — for the owner's "Preview as employer".
function PreviewHeader({ nav }: { nav: SiteHeaderNav }) {
  return (
    <nav className="flex items-center gap-3 sm:gap-5" aria-label="Account (preview)">
      {nav.authenticated ? (
        <>
          <span className={`hidden sm:inline-block ${INERT}`} aria-disabled title={PREVIEW_TITLE}>
            Saved candidates
          </span>
          <span className={`hidden sm:inline-block ${INERT}`} aria-disabled title={PREVIEW_TITLE}>
            Introductions
          </span>
          <span
            aria-disabled
            title={PREVIEW_TITLE}
            className="flex size-9 items-center justify-center rounded-full bg-navy text-paper opacity-50"
          >
            <User size={18} weight="fill" aria-hidden />
          </span>
        </>
      ) : (
        <>
          <span className={`hidden sm:inline-block ${INERT}`} aria-disabled title={PREVIEW_TITLE}>
            For employers
          </span>
          <span
            aria-disabled
            title={PREVIEW_TITLE}
            className="rounded-card bg-navy px-4 py-2 text-caption font-semibold text-paper opacity-50 cursor-not-allowed"
          >
            Sign in
          </span>
        </>
      )}
    </nav>
  );
}

export function SiteHeader({ nav }: { nav: SiteHeaderNav }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5 lg:h-[72px] lg:px-8">
        {/* Candidates get the accountant homepage, everyone else gets "/". Since
            the homepage became the firm pitch, a signed-in accountant clicking
            the wordmark would otherwise land on a page selling their own labor
            to somebody else. */}
        <Logo href={nav.role === "candidate" ? "/accountants" : "/"} />
        {nav.preview ? (
          <PreviewHeader nav={nav} />
        ) : nav.authenticated ? (
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
            <Link href="/" className={`hidden sm:inline-block ${LINK}`}>
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
