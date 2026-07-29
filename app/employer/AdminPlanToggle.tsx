"use client";

import { useTransition, useState } from "react";
import { adminSetEmployerPlan } from "@/app/actions";

/*
  Admin-only LOCAL dev control: flip the test employer between free and paid to
  exercise entitlements. Deliberately styled as a dev tool, not a billing flow.
  The server action re-checks admin before writing.
*/
export function AdminPlanToggle({
  accountId,
  name,
  email,
  plan,
}: {
  accountId: string;
  name: string;
  email: string;
  plan: "free" | "paid";
}) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const set = (next: "free" | "paid") => {
    if (next === plan) return;
    setError("");
    start(async () => {
      const res = await adminSetEmployerPlan(accountId, next);
      if (res.status === "error") setError(res.message ?? "Failed.");
      else window.location.reload();
    });
  };

  const btn = (value: "free" | "paid") =>
    `rounded-full px-4 py-1.5 text-caption font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
      plan === value ? "bg-navy text-paper" : "bg-mist text-muted hover:bg-line"
    } disabled:opacity-60`;

  return (
    <div className="mt-6 rounded-card border border-dashed border-line bg-white p-6">
      <p className="text-caption font-semibold tracking-wide text-subtle uppercase">
        Admin · local dev
      </p>
      <h2 className="mt-1 font-display text-[1.2rem] font-medium text-navy">
        Test employer plan
      </h2>
      <p className="mt-1 text-caption text-muted">
        {name} ({email}) — not a billing workflow; for exercising entitlements locally.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" disabled={pending} onClick={() => set("free")} className={btn("free")}>
          Free
        </button>
        <button type="button" disabled={pending} onClick={() => set("paid")} className={btn("paid")}>
          Paid
        </button>
        <span className="ml-2 text-caption text-subtle">
          Current: <span className="font-semibold text-ink capitalize">{plan}</span>
        </span>
      </div>
      {error && <p className="mt-3 text-caption text-navy">{error}</p>}
    </div>
  );
}
