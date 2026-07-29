"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, WarningCircle } from "@phosphor-icons/react";
import {
  adminConfirmField,
  adminSetProfileStatus,
  adminVerifyCheck,
} from "@/app/actions";
import type { AdminReadiness } from "./CandidateProfile";

/*
  Admin-only readiness controls. Presentation + confirm toggles only — this never
  edits applicant content, it records candidate confirmations and AccountingTalent
  checks (each a timestamp) and moves the publication status. Publishing is gated
  server-side by publicationRequirements(); the button is also disabled here when
  the profile isn't publishable, but the server is the real guard.

  Rendered ONLY for admins (the parent gates on viewer.isAdmin and never sends the
  `admin` prop to anyone else), so these mutating controls are never in a public or
  employer response.
*/

// checklist item key → how to toggle it. Employment history and any unknown key
// are read-only (no action) because they're captured from data, not confirmed.
const CONFIRM_KEYS = new Set([
  "role",
  "experience",
  "compensation_basis",
  "availability",
  "software",
  "education",
  "candidate_publication",
]);
const CHECK_KEYS = new Set(["identity", "english", "qualification"]);

const PROFILE_STATUSES = [
  "draft",
  "needs_candidate_confirmation",
  "under_assessment",
  "approved",
  "published",
  "paused",
] as const;

export function AdminReadinessControls({
  candidateId,
  admin,
}: {
  candidateId: string;
  admin: AdminReadiness;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [englishLevel, setEnglishLevel] = useState("Advanced");

  const published = admin.status === "published";

  function run(key: string, fn: () => Promise<{ status: string; message?: string }>) {
    setError(null);
    setBusyKey(key);
    startTransition(async () => {
      const res = await fn();
      setBusyKey(null);
      if (res.status === "error") setError(res.message ?? "Action failed.");
      else router.refresh();
    });
  }

  function toggle(item: AdminReadiness["checklist"][number]) {
    const confirmed = item.state === "confirmed";
    if (CHECK_KEYS.has(item.key)) {
      run(item.key, () =>
        adminVerifyCheck(candidateId, item.key, {
          confirmed: !confirmed,
          englishLevel: item.key === "english" ? englishLevel : undefined,
        }),
      );
    } else if (CONFIRM_KEYS.has(item.key)) {
      run(item.key, () => adminConfirmField(candidateId, item.key, !confirmed));
    }
  }

  const stateIcon = {
    confirmed: <CheckCircle size={16} weight="fill" className="text-verified-deep" aria-hidden />,
    needs_confirmation: <WarningCircle size={16} weight="fill" className="text-amber-500" aria-hidden />,
    missing: <Circle size={16} className="text-line" aria-hidden />,
  };

  return (
    <div className="mb-4 rounded-card border border-dashed border-navy/25 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption font-semibold tracking-wide text-subtle uppercase">
          Admin · profile readiness
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-caption font-semibold ${
            published ? "bg-verified/10 text-verified-deep" : "border border-line text-subtle"
          }`}
        >
          {published ? "Published" : `Draft — ${admin.status.replace(/_/g, " ")}`}
        </span>
      </div>

      {!admin.publication.met && (
        <p className="mt-2 text-caption text-muted">
          Not publishable yet. Missing: {admin.publication.missing.join(", ")}.
        </p>
      )}
      {error && <p className="mt-2 text-caption text-red-600">{error}</p>}

      <ul className="mt-3 divide-y divide-line/70">
        {admin.checklist.map((item) => {
          const actionable = CONFIRM_KEYS.has(item.key) || CHECK_KEYS.has(item.key);
          const confirmed = item.state === "confirmed";
          const busy = pending && busyKey === item.key;
          return (
            <li key={item.key} className="flex items-center justify-between gap-3 py-2 text-caption">
              <span className="flex items-center gap-2 text-ink">
                {stateIcon[item.state]}
                {item.label}
              </span>
              <span className="flex items-center gap-2">
                {item.key === "english" && !confirmed && (
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="rounded border border-line bg-white px-1.5 py-0.5 text-caption text-ink"
                    aria-label="English level"
                  >
                    <option>Basic</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Fluent</option>
                  </select>
                )}
                {actionable ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(item)}
                    className="rounded border border-line px-2 py-0.5 text-caption font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
                  >
                    {busy ? "…" : confirmed ? "Clear" : CHECK_KEYS.has(item.key) ? "Mark verified" : "Confirm"}
                  </button>
                ) : (
                  <span className="text-subtle">from data</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <label className="text-caption text-subtle" htmlFor="profile-status">
          Status
        </label>
        <select
          id="profile-status"
          value={admin.status}
          disabled={pending}
          onChange={(e) => run("__status", () => adminSetProfileStatus(candidateId, e.target.value))}
          className="rounded border border-line bg-white px-2 py-1 text-caption text-ink disabled:opacity-50"
        >
          {PROFILE_STATUSES.map((s) => (
            <option key={s} value={s} disabled={s === "published" && !admin.publication.met}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {!published && (
          <button
            type="button"
            disabled={pending || !admin.publication.met}
            onClick={() => run("__status", () => adminSetProfileStatus(candidateId, "published"))}
            className="rounded bg-navy px-3 py-1 text-caption font-semibold text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
}
