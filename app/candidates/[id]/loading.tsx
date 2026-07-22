import { Logo } from "@/components/ui/Logo";

/*
  Skeleton shown while the profile row loads (App Router streams this in place of
  the page). Shapes mirror the loaded layout: hero, then a 2fr/1fr split of stacked
  cards and the decision panel. animate-pulse only — no infinite bespoke motion.
*/
function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-line/70 ${className}`} />;
}

export default function CandidateProfileLoading() {
  return (
    <div className="flex min-h-full flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-5 pt-6 pb-16 lg:px-8">
        <Block className="mb-5 h-4 w-64" />
        <Block className="h-72" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <Block className="h-36" />
            <Block className="h-48" />
            <Block className="h-40" />
          </div>
          <Block className="order-1 h-80 lg:order-2" />
        </div>
      </main>
    </div>
  );
}
