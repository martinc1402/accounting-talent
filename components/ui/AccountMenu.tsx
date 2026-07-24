"use client";

import { useState } from "react";
import Link from "next/link";

/*
  Compact authenticated account control: an avatar button that opens a small menu
  (account name, current plan, dashboard, saved, introductions, sign out). Used in
  the header on both desktop and mobile — it's the single mobile account control.
  Native button + a click-away backdrop; keyboard-closable with Escape.
*/
function initialsOf(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

const ITEM =
  "block rounded-card px-3 py-2 text-small text-ink transition hover:bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

export function AccountMenu({
  label,
  plan,
}: {
  label: string;
  plan?: "free" | "paid";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex size-9 items-center justify-center rounded-full bg-navy text-caption font-semibold text-paper transition hover:bg-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      >
        {initialsOf(label)}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-60 rounded-card border border-line bg-white p-2 shadow-[0_20px_50px_-24px_rgba(19,31,91,0.5)]"
          >
            <div className="px-3 pt-1 pb-2">
              <div className="truncate text-small font-semibold text-ink">{label}</div>
              {plan && (
                <div className="mt-0.5 text-caption text-subtle">
                  Plan: <span className="font-semibold text-ink capitalize">{plan}</span>
                </div>
              )}
            </div>
            <div className="my-1 border-t border-line" />
            <Link href="/employer" className={ITEM} role="menuitem" onClick={() => setOpen(false)}>
              Employer dashboard
            </Link>
            <Link href="/employer/saved" className={ITEM} role="menuitem" onClick={() => setOpen(false)}>
              Saved candidates
            </Link>
            <Link href="/employer/introductions" className={ITEM} role="menuitem" onClick={() => setOpen(false)}>
              Introductions
            </Link>
            <div className="my-1 border-t border-line" />
            <form action="/auth/signout" method="post">
              <button type="submit" role="menuitem" className={`${ITEM} w-full text-left`}>
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
