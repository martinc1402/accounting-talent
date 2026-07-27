"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Plus, Trash } from "@phosphor-icons/react";
import {
  candidateConfirmAvailability,
  candidateSetSoftwareDepth,
  candidateConfirmEducation,
  candidateConfirmCompensationBasis,
  candidateApprovePublication,
} from "@/app/actions";

/*
  Candidate self-service dashboard (/candidates/me). Owner-scoped: every action
  re-authorizes ownership server-side. Candidates provide/confirm ONLY their own
  candidate-provided data + the candidate-confirmation timestamps the readiness
  model reads. No AccountingTalent checks, no publication status, no photo-public
  toggle. Mirrors the app's useTransition + run() form pattern (EmployerPanel /
  AdminReadinessControls).
*/

export type DashboardData = {
  id: string;
  fullName: string;
  profileStatus: string;
  availDays: string[];
  availStart: string;
  availFinish: string;
  timezone: string;
  availMaxHours: number | null;
  busySeasonFlexible: boolean;
  availabilityConfirmed: boolean;
  software: { name: string; level: string; years: number | null; last_used: string }[];
  softwareConfirmed: boolean;
  education: { degree: string; field_of_study: string; institution: string; year: string; completion_status: string }[];
  educationConfirmed: boolean;
  compLine?: string;
  compBasis?: string;
  compBasisConfirmed: boolean;
  publicationApproved: boolean;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const LEVELS = ["Basic", "Intermediate", "Advanced", "Expert"] as const;
const COMPLETION = ["Completed", "In progress"] as const;

const LABEL = "block text-caption font-semibold text-ink";
const INPUT =
  "mt-2 w-full rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
const BTN =
  "rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

function Confirmed() {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-verified-deep">
      <CheckCircle size={15} weight="fill" aria-hidden /> Confirmed
    </span>
  );
}

function Section({
  title,
  hint,
  confirmed,
  children,
}: {
  title: string;
  hint?: string;
  confirmed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6 lg:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[1.15rem] font-medium text-ink">{title}</h2>
        {confirmed ? <Confirmed /> : <span className="text-caption text-amber-600">Needs your confirmation</span>}
      </div>
      {hint && <p className="mt-1 text-caption text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CandidateDashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Editable state, seeded from the current values.
  const [days, setDays] = useState<string[]>(data.availDays);
  const [startTime, setStartTime] = useState(data.availStart);
  const [finishTime, setFinishTime] = useState(data.availFinish);
  const [timezone, setTimezone] = useState(data.timezone);
  const [maxHours, setMaxHours] = useState(data.availMaxHours?.toString() ?? "");
  const [busySeason, setBusySeason] = useState(data.busySeasonFlexible);
  const [software, setSoftware] = useState(data.software.length ? data.software : [{ name: "", level: "", years: null, last_used: "" }]);
  const [education, setEducation] = useState(
    data.education.length ? data.education : [{ degree: "", field_of_study: "", institution: "", year: "", completion_status: "" }],
  );

  function run(key: string, fn: () => Promise<{ status: string; message?: string }>, ok: string) {
    setError(null);
    setNote(null);
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (res.status === "error") setError(res.message ?? "Something went wrong.");
      else {
        setNote(ok);
        router.refresh();
      }
    });
  }

  const toggleDay = (d: string) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.7rem] font-medium text-navy">Your profile</h1>
          <p className="mt-1 text-small text-muted">
            Keep your details accurate — this is what US firms see. Status:{" "}
            <span className="font-semibold text-ink">{data.profileStatus.replace(/_/g, " ")}</span>.
          </p>
        </div>
        <Link href={`/candidates/${data.id}`} className="text-caption font-semibold text-navy underline underline-offset-2">
          View how employers see it →
        </Link>
      </div>

      {(error || note) && (
        <p className={`mt-4 text-small ${error ? "text-red-700" : "text-verified-deep"}`} role="status" aria-live="polite">
          {error ?? note}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {/* Availability */}
        <Section
          title="Availability"
          hint="Your working days and hours. Start/finish times let us show your US (ET) overlap."
          confirmed={data.availabilityConfirmed}
        >
          <fieldset>
            <legend className={LABEL}>Available days</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  aria-pressed={days.includes(d)}
                  className={`rounded-card border px-3 py-1.5 text-caption font-medium transition ${
                    days.includes(d) ? "border-navy bg-navy text-paper" : "border-line text-ink hover:border-navy/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="start">Preferred start (IST)</label>
              <input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL} htmlFor="finish">Preferred finish (IST)</label>
              <input id="finish" type="time" value={finishTime} onChange={(e) => setFinishTime(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL} htmlFor="tz">Timezone</label>
              <input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Kolkata" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} htmlFor="hours">Max hours / week</label>
              <input id="hours" type="number" min={1} max={80} value={maxHours} onChange={(e) => setMaxHours(e.target.value)} className={INPUT} />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-small text-ink">
            <input type="checkbox" checked={busySeason} onChange={(e) => setBusySeason(e.target.checked)} className="size-4" />
            I can flex up during US busy season
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                "avail",
                () =>
                  candidateConfirmAvailability(data.id, {
                    days: days.length ? (days as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[]) : undefined,
                    startTime: startTime || undefined,
                    finishTime: finishTime || undefined,
                    timezone: timezone.trim() || undefined,
                    maxHours: maxHours ? Number(maxHours) : undefined,
                    busySeasonFlexible: busySeason,
                  }),
                "Availability confirmed.",
              )
            }
            className={`mt-5 ${BTN}`}
          >
            {busy === "avail" ? "Saving…" : "Confirm availability"}
          </button>
        </Section>

        {/* Software */}
        <Section title="Software" hint="Add the tax/accounting software you use, with your level and years where you can." confirmed={data.softwareConfirmed}>
          <div className="flex flex-col gap-3">
            {software.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_90px_110px_auto] sm:items-end">
                <div>
                  {i === 0 && <label className={LABEL}>Product</label>}
                  <input value={s.name} onChange={(e) => setSoftware((c) => c.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="CCH Axcess Tax" className={INPUT} />
                </div>
                <div>
                  {i === 0 && <label className={LABEL}>Level</label>}
                  <select value={s.level} onChange={(e) => setSoftware((c) => c.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))} className={INPUT}>
                    <option value="">—</option>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label className={LABEL}>Years</label>}
                  <input type="number" min={0} max={50} value={s.years ?? ""} onChange={(e) => setSoftware((c) => c.map((x, j) => (j === i ? { ...x, years: e.target.value ? Number(e.target.value) : null } : x)))} className={INPUT} />
                </div>
                <div>
                  {i === 0 && <label className={LABEL}>Last used</label>}
                  <input value={s.last_used} onChange={(e) => setSoftware((c) => c.map((x, j) => (j === i ? { ...x, last_used: e.target.value } : x)))} placeholder="2026" className={INPUT} />
                </div>
                <button type="button" aria-label="Remove" onClick={() => setSoftware((c) => c.filter((_, j) => j !== i))} className="mb-1 inline-flex size-10 items-center justify-center rounded-card border border-line text-subtle hover:border-navy/40">
                  <Trash size={16} aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSoftware((c) => [...c, { name: "", level: "", years: null, last_used: "" }])} className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-navy">
            <Plus size={14} weight="bold" aria-hidden /> Add software
          </button>
          <div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  "sw",
                  () =>
                    candidateSetSoftwareDepth(
                      data.id,
                      software
                        .filter((s) => s.name.trim())
                        .map((s) => ({
                          name: s.name.trim(),
                          level: (s.level || undefined) as "Basic" | "Intermediate" | "Advanced" | "Expert" | undefined,
                          years: s.years ?? undefined,
                          last_used: s.last_used.trim() || undefined,
                        })),
                    ),
                  "Software saved.",
                )
              }
              className={`mt-5 ${BTN}`}
            >
              {busy === "sw" ? "Saving…" : "Save software"}
            </button>
          </div>
        </Section>

        {/* Education */}
        <Section title="Education" hint="Your degree(s). Completion, institution and year appear to verified firms once confirmed." confirmed={data.educationConfirmed}>
          <div className="flex flex-col gap-4">
            {education.map((e, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className={LABEL}>Degree</label>
                  <input value={e.degree} onChange={(ev) => setEducation((c) => c.map((x, j) => (j === i ? { ...x, degree: ev.target.value } : x)))} placeholder="B.Com" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Field of study</label>
                  <input value={e.field_of_study} onChange={(ev) => setEducation((c) => c.map((x, j) => (j === i ? { ...x, field_of_study: ev.target.value } : x)))} placeholder="Commerce" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Institution</label>
                  <input value={e.institution} onChange={(ev) => setEducation((c) => c.map((x, j) => (j === i ? { ...x, institution: ev.target.value } : x)))} className={INPUT} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Year</label>
                    <input value={e.year} onChange={(ev) => setEducation((c) => c.map((x, j) => (j === i ? { ...x, year: ev.target.value } : x)))} placeholder="2019" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Status</label>
                    <select value={e.completion_status} onChange={(ev) => setEducation((c) => c.map((x, j) => (j === i ? { ...x, completion_status: ev.target.value } : x)))} className={INPUT}>
                      <option value="">—</option>
                      {COMPLETION.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                "edu",
                () =>
                  candidateConfirmEducation(
                    data.id,
                    education
                      .filter((e) => e.degree.trim())
                      .map((e) => ({
                        degree: e.degree.trim(),
                        field_of_study: e.field_of_study.trim() || undefined,
                        institution: e.institution.trim() || undefined,
                        year: e.year.trim() || undefined,
                        completion_status: (e.completion_status || undefined) as "Completed" | "In progress" | undefined,
                      })),
                  ),
                "Education saved.",
              )
            }
            className={`mt-5 ${BTN}`}
          >
            {busy === "edu" ? "Saving…" : "Save education"}
          </button>
        </Section>

        {/* Compensation basis */}
        <Section title="Compensation" hint="Confirm the monthly range and the weekly-hours it's based on." confirmed={data.compBasisConfirmed}>
          {data.compLine ? (
            <p className="text-body text-ink">
              <span className="font-semibold">{data.compLine}</span>
              {data.compBasis ? <span className="text-muted"> · {data.compBasis}</span> : null}
            </p>
          ) : (
            <p className="text-small text-muted">No compensation range on file yet — AccountingTalent will add this from your application.</p>
          )}
          <button type="button" disabled={pending || !data.compLine} onClick={() => run("comp", () => candidateConfirmCompensationBasis(data.id), "Compensation basis confirmed.")} className={`mt-5 ${BTN}`}>
            {busy === "comp" ? "Saving…" : "Confirm this is correct"}
          </button>
        </Section>

        {/* Approve for publication */}
        <Section title="Approve for publication" hint="When your details are right, approve your profile to be shown to firms." confirmed={data.publicationApproved}>
          <p className="text-small text-muted">
            Your profile is only listed once AccountingTalent completes its checks — approving here records your consent to be shown (anonymously) to employers.
          </p>
          <button type="button" disabled={pending || data.publicationApproved} onClick={() => run("pub", () => candidateApprovePublication(data.id), "Thanks — publication approved.")} className={`mt-5 ${BTN}`}>
            {data.publicationApproved ? "Approved" : busy === "pub" ? "Saving…" : "Approve my profile"}
          </button>
        </Section>
      </div>
    </div>
  );
}
