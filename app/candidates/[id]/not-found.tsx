import Link from "next/link";
import { Prohibit } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui/Logo";

/*
  Rendered by notFound() from the profile route: unknown id, or a profile this
  viewer may not see. Deliberately gives no "wrong id" hint — a withdrawn,
  filled, unauthorized, or never-valid profile all read the same, matching the
  assessment route's caution.

  This only renders because the gate lives in page.tsx. Do not add a loading.tsx
  to this segment and do not move the gate into a layout: a route-level
  loading.tsx flushes the shell (locking the status at 200) before the page can
  call notFound(), and a gate in a layout bubbles past this boundary to the bare
  framework 404. Either change silently costs the 404 status or this page.
*/
export default function CandidateNotFound() {
  return (
    <div className="flex min-h-full flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-[520px] rounded-card border border-line bg-white p-9 text-center shadow-[0_14px_34px_-22px_rgba(19,31,91,0.4)] lg:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-card bg-mist">
            <Prohibit size={26} className="text-subtle" aria-hidden />
          </div>
          <h1 className="mt-5 font-display text-[1.6rem] font-medium text-navy">
            Profile not available
          </h1>
          <p className="mx-auto mt-3 max-w-[42ch] text-small text-muted">
            This candidate profile may have been withdrawn, filled, or the link is no
            longer valid.
          </p>
          <Link
            href="/employers"
            className="mt-6 inline-flex items-center justify-center rounded-card bg-navy px-5 py-3 text-small font-semibold text-white transition hover:bg-navy-deep active:translate-y-px"
          >
            Back to candidate results
          </Link>
        </div>
      </main>
    </div>
  );
}
