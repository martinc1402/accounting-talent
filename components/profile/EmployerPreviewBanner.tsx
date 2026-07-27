"use client";

import { useRouter } from "next/navigation";

/*
  Fixed top banner shown only when the OWNER is previewing their own profile as an
  employer/public sees it. Deliberately amber (never navy) so it can't be mistaken
  for normal page chrome. Toggling re-renders through the real profile path at a
  different viewer level; Exit returns to the owner view with scroll preserved.
*/
const MODES = [
  { value: "public", label: "Public (logged out)" },
  { value: "employer", label: "Before introduction" },
  { value: "introduced", label: "After accepted introduction" },
] as const;

export function EmployerPreviewBanner({
  candidateId,
  mode,
}: {
  candidateId: string;
  mode: "public" | "employer" | "introduced";
}) {
  const router = useRouter();
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-600/40 bg-amber-400 text-amber-950 shadow-sm">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 lg:px-8">
        <span className="text-small font-semibold">
          You&rsquo;re previewing how employers see your profile
        </span>
        <label className="ml-auto flex items-center gap-2 text-caption font-medium">
          <span className="sr-only">Preview stage</span>
          <select
            value={mode}
            onChange={(e) => router.push(`/candidates/${candidateId}?viewAs=${e.target.value}`, { scroll: false })}
            className="rounded-card border border-amber-700/40 bg-amber-50 px-2.5 py-1 text-caption font-semibold text-amber-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => router.push(`/candidates/${candidateId}`, { scroll: false })}
          className="rounded-card border border-amber-800/50 px-3 py-1 text-caption font-semibold text-amber-950 hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
        >
          Exit preview
        </button>
      </div>
    </div>
  );
}
