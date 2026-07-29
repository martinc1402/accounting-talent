"use client";

import { useState, useTransition } from "react";
import { createEmployerAccount, requestEmployerVerification } from "@/app/actions";
import { EMPLOYER_SIGNUP_OPEN } from "@/lib/authz/employerSignup";

type Props = {
  account: { name: string; verificationState: string; plan: string } | null;
};

const STATE_COPY: Record<string, string> = {
  unverified: "Not yet verified. Start verification to request introductions.",
  pending: "Verification in progress. We'll confirm your firm shortly.",
  verified: "Verified. You can request candidate introductions.",
  rejected: "Verification was not approved. Contact support.",
};

export function EmployerPanel({ account }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ status: string; message?: string }>) => {
    setError("");
    start(async () => {
      const res = await fn();
      if (res.status === "error") setError(res.message ?? "Something went wrong.");
      else window.location.reload();
    });
  };

  // Signed in, no employer account, and signup is closed. Say so plainly and
  // point at the one route in: the brief on /employers. Matches the "no account"
  // sign-in email, which sends firms to the same place.
  if (!account && !EMPLOYER_SIGNUP_OPEN) {
    return (
      <div className="rounded-card border border-line bg-white p-7">
        <h1 className="font-display text-[1.5rem] font-medium text-navy">
          Employer accounts aren&rsquo;t open yet
        </h1>
        <p className="mt-2 text-small text-muted">
          We&rsquo;re matching firms to candidates by hand for now. Tell us who you&rsquo;re hiring
          and we&rsquo;ll come back with a shortlist, usually within 72 hours.
        </p>
        <a
          href="/employers"
          className="mt-5 inline-block rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          Tell us who you need
        </a>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-card border border-line bg-white p-7">
        <h1 className="font-display text-[1.5rem] font-medium text-navy">Create your employer account</h1>
        <p className="mt-2 text-small text-muted">
          One account per firm. You&rsquo;ll be the owner and can request candidate introductions
          once verified.
        </p>
        <label htmlFor="firm" className="mt-5 block text-caption font-semibold text-ink">
          Firm name
        </label>
        <input
          id="firm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Northgate CPA"
          className="mt-2 w-full rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        />
        {error && <p className="mt-3 text-caption text-navy">{error}</p>}
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() => run(() => createEmployerAccount(name))}
          className="mt-5 rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          {pending ? "Creating." : "Create account"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-white p-7">
      <h1 className="font-display text-[1.5rem] font-medium text-navy">{account.name}</h1>
      <dl className="mt-4 divide-y divide-line">
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-caption tracking-wide text-subtle uppercase">Verification</dt>
          <dd className="text-small font-semibold text-ink capitalize">{account.verificationState}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-caption tracking-wide text-subtle uppercase">Plan</dt>
          <dd className="text-small font-semibold text-ink capitalize">{account.plan}</dd>
        </div>
      </dl>
      <p className="mt-3 text-small text-muted">{STATE_COPY[account.verificationState]}</p>
      {error && <p className="mt-3 text-caption text-navy">{error}</p>}
      {account.verificationState === "unverified" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => requestEmployerVerification())}
          className="mt-5 rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          {pending ? "Starting." : "Start verification"}
        </button>
      )}
    </div>
  );
}
