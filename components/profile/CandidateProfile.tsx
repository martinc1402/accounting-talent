import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  GraduationCap,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/ui/LogoMark";
import { Card } from "@/components/ui/Card";
import { SiteHeader, type SiteHeaderNav } from "@/components/ui/SiteHeader";
import { CandidateActions, type SaveMode } from "@/components/profile/CandidateActions";
import type {
  CandidateProfile as CandidateProfileData,
  ProfileAccess,
  ProfileEducationEntry,
  ProfileHistoryEntry,
  ProfileVerification,
  VerificationBadge,
} from "@/lib/profile/candidate";

// Save behaviour by viewer: verified employers persist (toggle); anon/unverified
// are prompted; admin/preview have no shortlist.
function saveModeOf(access?: ProfileAccess): SaveMode {
  if (!access || access.isPreview) return "hidden";
  switch (access.level) {
    case "anonymous":
      return "signin";
    case "unverified_employer":
      return "verify";
    case "free_verified_employer":
    case "paid_verified_employer":
    case "accepted_introduction":
      return "toggle";
    default:
      return "hidden"; // admin
  }
}

/*
  The full candidate profile page, ported from the CandidateProfile design.
  Navy hero + white section cards + a sticky navy decision panel, in the house
  navy/paper/verified system (same tokens as ProfileCard/ProfileDetail).

  Server component; every section renders only when its data is present, so a
  sparse real candidate (before the 0008 fields are curated) still reads cleanly.
  The one interactive island is CandidateActions (Save + the intro modal), reused
  in the hero, the decision panel, and the mobile action bar. Contact details are
  never shown here — they are released only after an accepted introduction.

  "In their own words" is an addition beyond the imported design: the candidate's
  assessment writing sample, the one thing on the page a middleman cannot supply.
*/

// --- shared bits -----------------------------------------------------------

function SectionCard({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <h2 id={id} className="scroll-mt-24 font-display text-[1.35rem] font-medium text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-card border border-line bg-mist/50 px-3 py-1.5 text-small text-ink">
      {children}
    </span>
  );
}

function VerifiedBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-verified/10 px-2.5 py-0.5 text-caption font-semibold text-verified-deep">
      {children}
    </span>
  );
}

// The only two verification badge labels: "Verified" (binary pass) or the level.
function verificationBadgeLabel(badge: VerificationBadge): string {
  return badge.kind === "verified" ? "Verified" : badge.level;
}

// --- hero ------------------------------------------------------------------

function Hero({ p }: { p: CandidateProfileData }) {
  return (
    <section className="overflow-hidden rounded-card bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      <div className="relative flex flex-col items-stretch sm:flex-row">
        {/* Portrait / initials. On desktop the column self-stretches to the full
            card height with a fill + object-cover image (no fixed height that can
            underrun the card), so it always bleeds to top/left/bottom edges. */}
        <div className="relative aspect-[3/2] self-stretch bg-navy-deep sm:aspect-auto sm:w-56 sm:flex-none">
          {p.photo ? (
            <>
              <Image
                src={p.photo.src}
                alt={p.photo.alt}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 224px"
                // The authorizing photo endpoint returns a per-viewer, short-lived
                // redirect; don't run it through the image optimizer/cache.
                unoptimized={p.photo.src.startsWith("/api/")}
                style={{ objectPosition: p.photo.focal ?? "center 22%" }}
                className="object-cover"
              />
              {/* Navy-tinted inset scrim blends the photo edge into the hero panel
                  (bottom seam on mobile, right seam on desktop) so it reads as one
                  surface, not a pasted-in card. A tinted shadow, not a gradient. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 shadow-[inset_0_-44px_48px_-30px_rgba(13,22,66,0.9)] sm:shadow-[inset_-44px_0_48px_-30px_rgba(13,22,66,0.9)]"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[3.75rem] leading-none text-paper/70">
                {p.initials}
              </span>
            </div>
          )}
          {/* Logo tile straddling the seam: bottom edge on mobile, right edge on desktop */}
          <div className="absolute left-6 -bottom-6 z-10 flex size-13 items-center justify-center rounded-card bg-paper text-navy ring-1 ring-line sm:left-auto sm:-right-6 sm:bottom-auto sm:top-9">
            <LogoMark className="size-8" />
          </div>
        </div>

        {/* Info. Extra left padding on desktop clears the seam tile. */}
        <div className="min-w-0 flex-1 px-6 pt-12 pb-7 sm:py-8 sm:pr-8 sm:pl-12 lg:py-9 lg:pr-9 lg:pl-14">
          <p className="text-caption font-semibold tracking-wide text-paper/70 uppercase">
            {p.eyebrow}
          </p>
          <h1 className="mt-2 display display-figure text-paper">{p.name}</h1>
          <p className="mt-1.5 font-display text-lede leading-snug text-paper/90">{p.role}</p>

          {p.qualLine && (
            <p className="mt-4 flex items-start gap-2.5 text-small text-paper/85">
              <GraduationCap size={16} weight="light" className="mt-0.5 shrink-0 text-paper/70" />
              {p.qualLine}
            </p>
          )}

          {p.heroVerifications.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {p.heroVerifications.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1.5 text-caption font-medium text-verified"
                >
                  <SealCheck size={15} weight="fill" className="shrink-0" aria-hidden />
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Anchors to the full verification section further down the page. */}
          <a
            href="#verified"
            className="mt-3 inline-flex items-center gap-1.5 py-0.5 text-caption font-medium text-paper/75 underline-offset-4 hover:text-paper hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            What we checked
            <CaretRight size={11} weight="bold" aria-hidden className="shrink-0" />
          </a>

          {p.evidence && p.evidence.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              {p.evidence.map((e) => (
                <div
                  key={e.label}
                  className="border-l border-paper/20 pl-4 first:border-l-0 first:pl-0"
                >
                  <dd className="font-display text-[1.55rem] leading-none text-paper">
                    {e.value}
                  </dd>
                  <dt className="mt-1.5 text-caption text-paper/75">{e.label}</dt>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-small text-paper/85">
            {p.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} weight="light" className="shrink-0 text-paper/70" />
                {p.location}
              </span>
            )}
            {p.availability && (
              <span className="inline-flex items-center gap-2">
                <CalendarBlank size={15} weight="light" className="shrink-0 text-paper/70" />
                {p.availability}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-paper/15 pt-5">
            {p.compensation ? (
              <div>
                <p className="text-caption font-semibold tracking-wide text-paper/70 uppercase">
                  Expected compensation
                </p>
                <p className="mt-1.5 font-display text-[clamp(1.6rem,1.4rem+1vw,2rem)] leading-none tracking-[-0.01em] whitespace-nowrap text-paper">
                  {p.compensation.value}
                </p>
                {p.compensation.unit && (
                  <p className="mt-1 text-caption text-paper/75">{p.compensation.unit}</p>
                )}
              </div>
            ) : p.access?.compensationLocked ? (
              <div className="max-w-[16rem]">
                <p className="text-caption font-semibold tracking-wide text-paper/70 uppercase">
                  Expected compensation
                </p>
                <p className="mt-1.5 text-small text-paper/85">
                  Create a free employer account to view expected compensation.
                </p>
              </div>
            ) : null}
            <CandidateActions
              candidateId={p.id}
              candidateName={p.name}
              variant="hero"
              cta={p.access?.cta}
              saveMode={saveModeOf(p.access)}
              initialSaved={p.saved}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// --- main-column sections --------------------------------------------------

function Capabilities({ p }: { p: CandidateProfileData }) {
  if (!p.capabilities) return null;
  const { title, subtitle, primary, extra } = p.capabilities;
  return (
    <SectionCard title={title}>
      {subtitle && <p className="-mt-2 mb-4 text-caption text-muted">{subtitle}</p>}
      <div className="flex flex-wrap gap-2.5">
        {[...primary, ...extra].map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>
    </SectionCard>
  );
}

function VerifiedChecks({ items }: { items: ProfileVerification[] }) {
  if (!items.length) return null;
  return (
    <SectionCard title="Verified by AccountingTalent" id="verified">
      <p className="-mt-2 mb-3 max-w-[64ch] text-caption text-muted">
        Independently verified by AccountingTalent. Employment history, achievements
        and other profile information are provided by the candidate. Only completed
        checks are shown.
      </p>
      <div className="divide-y divide-line">
        {items.map((v) => (
          <div key={v.label} className="flex items-start gap-3 py-3.5">
            <SealCheck
              size={20}
              weight="fill"
              className="mt-0.5 shrink-0 text-verified-deep"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-small font-semibold text-ink">{v.label}</span>
                <VerifiedBadge>{verificationBadgeLabel(v.badge)}</VerifiedBadge>
                {v.date && <span className="text-caption text-subtle">{v.date}</span>}
              </div>
              <p className="mt-0.5 text-caption text-muted">{v.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function EmploymentHistory({ items }: { items: ProfileHistoryEntry[] }) {
  if (!items.length) return null;
  return (
    <SectionCard title="Employment history">
      <div className="flex flex-col">
        {items.map((j, i) => (
          <div key={`${j.title}-${i}`} className="grid grid-cols-[14px_1fr] gap-x-4">
            <div className="flex flex-col items-center">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-navy" />
              {i < items.length - 1 && <span className="w-px flex-1 bg-line" />}
            </div>
            <div className="pb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-small font-semibold text-ink">{j.title}</h3>
                {j.dates && (
                  <span className="text-caption text-subtle whitespace-nowrap">{j.dates}</span>
                )}
              </div>
              {j.meta && <p className="mt-0.5 text-caption text-muted">{j.meta}</p>}
              {j.bullets.length > 0 && (
                <ul className="mt-2.5 list-disc space-y-1.5 pl-5">
                  {j.bullets.map((b) => (
                    <li key={b} className="text-small text-muted">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {j.exposure && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-card bg-verified/10 px-2.5 py-1 text-caption font-semibold text-verified-deep">
                  <span aria-hidden className="size-1.5 rounded-full bg-verified-deep" />
                  {j.exposure}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function EducationCredentials({ items }: { items: ProfileEducationEntry[] }) {
  if (!items.length) return null;
  return (
    <SectionCard title="Education & credentials">
      <div className="divide-y divide-line">
        {items.map((e) => (
          <div
            key={e.qualification}
            className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3.5 first:pt-0"
          >
            <div className="min-w-0">
              <div className="text-small font-semibold text-ink">{e.qualification}</div>
              {e.meta && <div className="mt-0.5 text-caption text-muted">{e.meta}</div>}
              {e.note && <div className="mt-1 text-caption text-subtle italic">{e.note}</div>}
            </div>
            {e.status &&
              (e.completed === false ? (
                <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-caption font-semibold text-subtle">
                  {e.status}
                </span>
              ) : (
                <VerifiedBadge>{e.status}</VerifiedBadge>
              ))}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// --- paid-tier tools (entitlement-gated; honest empty states) --------------

function PaidFeatures({ p }: { p: CandidateProfileData }) {
  const f = p.access?.paidFeatures;
  if (!f || (!f.assessmentBreakdown && !f.resumeDownload)) return null;
  const rows: { on: boolean; label: string; note: string }[] = [
    {
      on: f.assessmentBreakdown,
      label: "Detailed assessment breakdown",
      note: "Section-by-section scoring — added once this candidate's assessment is reviewed.",
    },
    {
      on: f.resumeDownload,
      label: "AccountingTalent résumé (PDF)",
      note: "Branded, anonymised résumé — generated on request.",
    },
  ].filter((r) => r.on);
  return (
    <SectionCard title="Plan tools">
      <p className="-mt-2 mb-3 text-caption text-muted">
        Included with your plan. Identity and contact remain gated until an introduction is
        accepted.
      </p>
      <div className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <div className="min-w-0">
              <div className="text-small font-semibold text-ink">{r.label}</div>
              <div className="mt-0.5 text-caption text-muted">{r.note}</div>
            </div>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-caption font-semibold text-subtle">
              On request
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// --- decision panel --------------------------------------------------------

function DecisionPanel({ p }: { p: CandidateProfileData }) {
  return (
    <div className="rounded-card bg-navy p-6 text-paper shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      <p className="text-caption font-semibold tracking-wide text-paper/70 uppercase">
        Decision summary
      </p>
      <dl className="mt-3 divide-y divide-paper/15">
        {p.decision.map((d) => (
          <div key={d.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-caption tracking-wide text-paper/65 uppercase">{d.label}</dt>
            <dd
              className={`max-w-[62%] text-right text-small font-semibold text-paper ${
                d.label === "Compensation" ? "whitespace-nowrap" : ""
              }`}
            >
              {d.value}
            </dd>
          </div>
        ))}
      </dl>
      {p.availabilityConfirmed && (
        <p className="mt-2 text-fine text-paper/60">{p.availabilityConfirmed}</p>
      )}
      <div className="mt-5">
        <CandidateActions
          candidateId={p.id}
          candidateName={p.name}
          variant="panel"
          cta={p.access?.cta}
          saveMode={saveModeOf(p.access)}
          initialSaved={p.saved}
        />
      </div>
      <a
        href="#how-it-works"
        className="mt-3.5 inline-flex items-center gap-1.5 py-0.5 text-caption font-medium text-paper/75 underline-offset-4 hover:text-paper hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      >
        What happens next?
        <CaretRight size={11} weight="bold" aria-hidden />
      </a>
      <p className="mt-4 text-fine text-paper/70">
        Contact details are shared only after an introduction is accepted.
      </p>
    </div>
  );
}

// --- process ---------------------------------------------------------------

function HowItWorks({ p }: { p: CandidateProfileData }) {
  const steps = [
    {
      title: "Request an introduction",
      body: "Tell us about the role. Your firm's details are shared with the candidate.",
    },
    {
      title: "We confirm availability and fit",
      body: "AccountingTalent checks interest and timing before anything is shared.",
    },
    {
      title: "Contact details are shared",
      body: "Once the candidate accepts, you receive their details and take it from there.",
    },
  ];
  return (
    <section id="how-it-works" className="mt-6 scroll-mt-24">
      <Card>
        <h2 className="font-display text-[1.35rem] font-medium text-ink">
          How introductions work
        </h2>
        <ol className="mt-5 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3.5 sm:flex-col sm:gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy font-display text-small text-paper">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-small font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 max-w-[34ch] text-caption leading-relaxed text-muted">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
          <CandidateActions
            candidateId={p.id}
            candidateName={p.name}
            variant="cta"
            cta={p.access?.cta}
          />
          <p className="max-w-[46ch] text-caption text-subtle">
            Contact details stay private until the candidate accepts the introduction.
            Requesting an introduction does not commit you to hiring.
          </p>
        </div>
      </Card>
    </section>
  );
}

// --- access UI (preview banner, admin switcher, contact reveal) ------------

const PREVIEW_LEVELS: { level: string; label: string }[] = [
  { level: "anonymous", label: "Anonymous" },
  { level: "unverified_employer", label: "Unverified" },
  { level: "free_verified_employer", label: "Free verified" },
  { level: "paid_verified_employer", label: "Paid verified" },
  { level: "accepted_introduction", label: "Accepted" },
];

function levelLabel(level: string): string {
  return PREVIEW_LEVELS.find((l) => l.level === level)?.label ?? "Admin";
}

/** Admin-only control that re-renders the profile as another level. Plain anchor
 *  links (GET ?preview=…) — presentation only; it never impersonates a user or
 *  grants that viewer's actions (mutations stay disabled in preview). */
function AdminPreviewSwitcher({ p }: { p: CandidateProfileData }) {
  const access = p.access;
  if (!access?.adminControls) return null;
  const activeLevel = access.isPreview ? access.level : "admin";
  const linkBase =
    "rounded-full px-3 py-1 text-caption font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
  return (
    <div className="mb-4 rounded-card border border-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caption font-semibold tracking-wide text-subtle uppercase">
          Admin preview
        </span>
        {PREVIEW_LEVELS.map((l) => (
          <Link
            key={l.level}
            href={`?preview=${l.level}`}
            className={`${linkBase} ${
              activeLevel === l.level ? "bg-navy text-paper" : "bg-mist text-muted hover:bg-line"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="?"
          className={`${linkBase} ${
            activeLevel === "admin" ? "bg-navy text-paper" : "bg-mist text-muted hover:bg-line"
          }`}
        >
          Admin (full)
        </Link>
      </div>
    </div>
  );
}

function PreviewBanner({ p }: { p: CandidateProfileData }) {
  if (!p.access?.isPreview) return null;
  return (
    <div
      role="status"
      className="mb-4 rounded-card border border-navy/20 bg-navy/[0.04] px-4 py-3 text-caption text-navy"
    >
      <span className="font-semibold">Preview mode</span> — viewing as{" "}
      <span className="font-semibold">{levelLabel(p.access.level)}</span>. This changes only what
      is shown; introduction actions are disabled.
    </div>
  );
}

/** Identity + contact, rendered only when the projection included p.contact
 *  (accepted-introduction or admin). Server decides; this just displays. */
function ContactCard({ p }: { p: CandidateProfileData }) {
  const c = p.contact;
  if (!c) return null;
  const rows: { label: string; value: string; href?: string }[] = [];
  if (c.email) rows.push({ label: "Email", value: c.email, href: `mailto:${c.email}` });
  if (c.phone) rows.push({ label: "Phone", value: c.phone });
  if (c.linkedin) rows.push({ label: "LinkedIn", value: c.linkedin, href: c.linkedin });
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="rounded-card border border-verified/40 bg-verified/[0.06] p-7 lg:p-8">
        <div className="flex items-center gap-2">
          <SealCheck size={18} weight="fill" className="text-verified-deep" aria-hidden />
          <h2 className="font-display text-[1.35rem] font-medium text-ink">
            Introduction accepted — contact details
          </h2>
        </div>
        <p className="mt-2 text-small font-semibold text-ink">{c.fullName}</p>
        {rows.length > 0 && (
          <dl className="mt-3 divide-y divide-line">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-caption tracking-wide text-subtle uppercase">{r.label}</dt>
                <dd className="text-small font-medium text-ink">
                  {r.href ? (
                    <a href={r.href} className="text-navy underline underline-offset-2">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

// --- page ------------------------------------------------------------------

export function CandidateProfile({
  profile: p,
  nav = { authenticated: false },
}: {
  profile: CandidateProfileData;
  nav?: SiteHeaderNav;
}) {
  return (
    <div className="flex min-h-full flex-col bg-mist">
      <SiteHeader nav={nav} />

      <main className="mx-auto w-full max-w-[1160px] flex-1 px-5 pt-6 pb-24 lg:px-8 lg:pb-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-caption text-subtle"
        >
          <Link
            href="/employers"
            className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-navy"
          >
            <ArrowLeft size={15} weight="bold" aria-hidden />
            Back to candidate results
          </Link>
          <CaretRight size={12} className="text-line" aria-hidden />
          <span className="text-ink">{p.name}</span>
        </nav>

        <AdminPreviewSwitcher p={p} />
        <PreviewBanner p={p} />

        <Hero p={p} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start">
          <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
            <ContactCard p={p} />

            {p.summary && (
              <SectionCard title="Professional summary">
                <p className="text-small leading-relaxed text-muted">{p.summary}</p>
              </SectionCard>
            )}

            {p.writingSample && (
              <SectionCard title="In their own words">
                <blockquote className="border-l-2 border-navy/25 pl-5 sm:pl-6">
                  <p className="max-w-[60ch] text-body leading-relaxed text-ink">
                    {p.writingSample.text}
                  </p>
                  <footer className="mt-4 text-caption text-subtle">
                    {p.writingSample.attribution}
                  </footer>
                </blockquote>
              </SectionCard>
            )}

            <Capabilities p={p} />

            {p.software.length > 0 && (
              <SectionCard title="Software proficiency">
                <div className="flex flex-wrap gap-2.5">
                  {p.software.map((s) => (
                    <Chip key={s.name}>
                      {s.name}
                      {s.meta && (
                        <span className="border-l border-line pl-2 text-caption text-subtle">
                          {s.meta}
                        </span>
                      )}
                    </Chip>
                  ))}
                </div>
              </SectionCard>
            )}

            <VerifiedChecks items={p.verifications} />
            <PaidFeatures p={p} />
            <EmploymentHistory items={p.history} />
            <EducationCredentials items={p.education} />

            {p.preferences.length > 0 && (
              <SectionCard title="Work preferences & availability">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  {p.preferences.map((pref) => (
                    <div key={pref.label}>
                      <div className="text-caption tracking-wide text-subtle uppercase">
                        {pref.label}
                      </div>
                      <div className="mt-1 text-small font-medium text-ink">{pref.value}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
            <DecisionPanel p={p} />
          </aside>
        </div>

        <HowItWorks p={p} />
      </main>

      {/* Mobile sticky bar = the Decision Summary's collapse: compensation + the
          primary action, always reachable without scrolling the hero. */}
      <div className="sticky bottom-0 z-20 border-t border-navy-deep bg-navy/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1160px] items-center gap-3">
          {p.compensation && (
            <p className="shrink-0 font-display text-[1.05rem] leading-none whitespace-nowrap text-paper">
              {p.compensation.value}
              <span className="ml-0.5 text-[0.7rem] text-paper/60">/mo</span>
            </p>
          )}
          <div className="min-w-0 flex-1">
            <CandidateActions
              candidateId={p.id}
              candidateName={p.name}
              variant="mobile"
              cta={p.access?.cta}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
