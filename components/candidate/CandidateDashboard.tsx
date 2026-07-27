"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock, Plus, Trash } from "@phosphor-icons/react";
import {
  candidateConfirmAvailability,
  candidateSetSoftwareDepth,
  candidateConfirmEducation,
  candidateConfirmCompensationBasis,
  candidateApprovePublication,
  candidateSetPublished,
  candidateUploadPhoto,
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
  hasPhoto: boolean;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "")).toUpperCase();
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const LEVELS = ["Basic", "Intermediate", "Advanced", "Expert"] as const;
const COMPLETION = ["Completed", "In progress"] as const;

const LABEL = "block text-caption font-semibold text-ink";
const INPUT =
  "mt-2 w-full rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
const BTN =
  "rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
const ERR = "mt-1.5 text-caption font-medium text-red-700";

function Confirmed({ label = "Confirmed" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-verified-deep">
      <CheckCircle size={15} weight="fill" aria-hidden /> {label}
    </span>
  );
}

function Section({
  title,
  hint,
  confirmed,
  badge,
  children,
}: {
  title: string;
  hint?: string;
  confirmed?: boolean;
  // Overrides the default confirmed / needs-confirmation status pill in the header.
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6 lg:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[1.15rem] font-medium text-ink">{title}</h2>
        {badge ?? (confirmed ? <Confirmed /> : <span className="text-caption text-amber-600">Needs your confirmation</span>)}
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
  // Per-field validation errors — a section can't be confirmed with required fields empty.
  const [availErr, setAvailErr] = useState<Record<string, string>>({});
  const [swErr, setSwErr] = useState<Record<number, string>>({});
  const [software, setSoftware] = useState(data.software.length ? data.software : [{ name: "", level: "", years: null, last_used: "" }]);
  const [education, setEducation] = useState(
    data.education.length ? data.education : [{ degree: "", field_of_study: "", institution: "", year: "", completion_status: "" }],
  );

  // Profile photo: a local object-URL preview shows the picked/uploaded image
  // immediately; otherwise the current photo is served (owner-authorized) from the
  // signing endpoint. Object URLs are revoked to avoid leaks.
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

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

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after an error
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError("Please choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("That image is too large — please use one under 5 MB.");
      return;
    }
    setPhotoPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    const fd = new FormData();
    fd.append("photo", file);
    run("photo", () => candidateUploadPhoto(data.id, fd), "Photo updated.");
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
        <Link href={`/candidates/${data.id}?viewAs=employer`} className="text-caption font-semibold text-navy underline underline-offset-2">
          Preview as employer →
        </Link>
      </div>

      {(error || note) && (
        <p className={`mt-4 text-small ${error ? "text-red-700" : "text-verified-deep"}`} role="status" aria-live="polite">
          {error ?? note}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {/* Profile photo */}
        <Section
          title="Profile photo"
          badge={
            <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-subtle">
              <Lock size={14} weight="fill" aria-hidden /> Private
            </span>
          }
        >
          <div className="flex items-center gap-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-mist ring-1 ring-line">
              {photoPreview || data.hasPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview ?? `/api/candidates/${data.id}/photo`}
                  alt="Your profile photo"
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-navy text-lede font-semibold text-paper">
                  {initialsOf(data.fullName)}
                </span>
              )}
            </div>
            <div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={onPickPhoto}
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => photoInputRef.current?.click()}
                className="rounded-card border border-navy px-4 py-2.5 text-small font-semibold text-navy transition hover:bg-navy hover:text-paper disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                {busy === "photo" ? "Uploading…" : data.hasPhoto ? "Change photo" : "Upload photo"}
              </button>
              <p className="mt-2 max-w-[42ch] text-caption text-muted">
                PNG, JPEG, or WebP, up to 5 MB. Only you, AccountingTalent, and an employer whose introduction
                you&rsquo;ve accepted can see it — verified employers see a blurred version until then, and the
                public never sees it.
              </p>
            </div>
          </div>
        </Section>

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
            {availErr.days && <p className={ERR}>{availErr.days}</p>}
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="start">Preferred start (IST)</label>
              <input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={INPUT} />
              {availErr.startTime && <p className={ERR}>{availErr.startTime}</p>}
            </div>
            <div>
              <label className={LABEL} htmlFor="finish">Preferred finish (IST)</label>
              <input id="finish" type="time" value={finishTime} onChange={(e) => setFinishTime(e.target.value)} className={INPUT} />
              {availErr.finishTime && <p className={ERR}>{availErr.finishTime}</p>}
            </div>
            <div>
              <label className={LABEL} htmlFor="tz">Timezone</label>
              <input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Kolkata" className={INPUT} />
              {availErr.timezone && <p className={ERR}>{availErr.timezone}</p>}
            </div>
            <div>
              <label className={LABEL} htmlFor="hours">Max hours / week</label>
              <input id="hours" type="number" min={1} max={80} value={maxHours} onChange={(e) => setMaxHours(e.target.value)} className={INPUT} />
              {availErr.maxHours && <p className={ERR}>{availErr.maxHours}</p>}
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-small text-ink">
            <input type="checkbox" checked={busySeason} onChange={(e) => setBusySeason(e.target.checked)} className="size-4" />
            I can flex up during US busy season
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const errs: Record<string, string> = {};
              if (days.length === 0) errs.days = "Select at least one available day.";
              if (!startTime) errs.startTime = "Enter a preferred start time.";
              if (!finishTime) errs.finishTime = "Enter a preferred finish time.";
              if (!timezone.trim()) errs.timezone = "Enter your timezone.";
              if (!maxHours || Number(maxHours) < 1) errs.maxHours = "Enter your max hours per week.";
              setAvailErr(errs);
              if (Object.keys(errs).length) return;
              run(
                "avail",
                () =>
                  candidateConfirmAvailability(data.id, {
                    days: days as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[],
                    startTime,
                    finishTime,
                    timezone: timezone.trim(),
                    maxHours: Number(maxHours),
                    busySeasonFlexible: busySeason,
                  }),
                "Availability confirmed.",
              );
            }}
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
                {swErr[i] && <p className={`sm:col-span-5 ${ERR}`}>{swErr[i]}</p>}
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
              onClick={() => {
                const named = software.filter((s) => s.name.trim());
                if (named.length === 0) {
                  setSwErr({});
                  setError("Add at least one software product with a level and years.");
                  return;
                }
                const errs: Record<number, string> = {};
                software.forEach((s, i) => {
                  if (!s.name.trim()) return;
                  if (!s.level) errs[i] = "Choose a level.";
                  else if (s.years == null || Number.isNaN(s.years)) errs[i] = "Enter years of experience.";
                });
                setSwErr(errs);
                if (Object.keys(errs).length) return;
                run(
                  "sw",
                  () =>
                    candidateSetSoftwareDepth(
                      data.id,
                      named.map((s) => ({
                        name: s.name.trim(),
                        level: s.level as "Basic" | "Intermediate" | "Advanced" | "Expert",
                        years: s.years as number,
                        last_used: s.last_used.trim() || undefined,
                      })),
                    ),
                  "Software saved.",
                );
              }}
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

        {/* Publication. Two phases:
            1. Pre-review — the candidate records consent (Approve my profile). AT
               then runs its checks and moves the profile to "approved".
            2. Post-review — once AT has approved (status approved/published/paused),
               the candidate owns a live on/off switch (publish <-> pause). */}
        <PublicationSection data={data} busy={busy} pending={pending} run={run} />
      </div>
    </div>
  );
}

const AT_APPROVED = new Set(["approved", "published", "paused"]);

function PublicationSection({
  data,
  busy,
  pending,
  run,
}: {
  data: DashboardData;
  busy: string | null;
  pending: boolean;
  run: (key: string, fn: () => Promise<{ status: string; message?: string }>, ok: string) => void;
}) {
  const canToggle = AT_APPROVED.has(data.profileStatus);
  const isLive = data.profileStatus === "published";

  // Phase 2: AT has approved — the candidate flips their own live listing.
  if (canToggle) {
    return (
      <Section
        title="Publication"
        badge={
          isLive ? (
            <Confirmed label="Published" />
          ) : (
            <span className="text-caption font-semibold text-amber-600">Unpublished</span>
          )
        }
      >
        <div className="flex items-center justify-between gap-4 rounded-card border border-line p-4">
          <div>
            <p className="text-small font-semibold text-ink">
              {isLive ? "Your profile is live" : "Your profile is hidden"}
            </p>
            <p className="mt-0.5 text-caption text-muted">
              {isLive
                ? "Verified employers can find it and request an introduction. Switch off any time to take it down."
                : "Publish to let verified employers find your profile. You can switch it off again whenever you like."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isLive}
            aria-label="List my profile to employers"
            disabled={pending}
            onClick={() =>
              run(
                "pub",
                () => candidateSetPublished(data.id, !isLive),
                isLive ? "Your profile is now unpublished." : "Your profile is now live.",
              )
            }
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
              isLive ? "bg-navy" : "bg-line"
            }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow transition ${
                isLive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Section>
    );
  }

  // Phase 1: pre-review consent.
  return (
    <Section
      title="Approve for publication"
      hint="When your details are right, approve your profile to be shown to firms."
      confirmed={data.publicationApproved}
    >
      <p className="text-small text-muted">
        {data.publicationApproved
          ? "Approved — AccountingTalent is completing its checks. Once it's done you'll be able to publish your profile here and switch it on or off any time."
          : "Your profile is only listed once AccountingTalent completes its checks — approving here records your consent to be shown (anonymously) to employers."}
      </p>
      {!data.publicationApproved && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("pub", () => candidateApprovePublication(data.id), "Thanks — publication approved.")}
          className={`mt-5 ${BTN}`}
        >
          {busy === "pub" ? "Saving…" : "Approve my profile"}
        </button>
      )}
    </Section>
  );
}
