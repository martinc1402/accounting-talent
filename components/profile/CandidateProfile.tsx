import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  Clock,
  GraduationCap,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui/Logo";
import { LogoMark } from "@/components/ui/LogoMark";
import { Card } from "@/components/ui/Card";
import { CandidateActions } from "@/components/profile/CandidateActions";
import type {
  CandidateProfile as CandidateProfileData,
  ProfileEducationEntry,
  ProfileHistoryEntry,
  ProfileVerification,
} from "@/lib/profile/candidate";

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

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="font-display text-[1.35rem] font-medium text-ink">{title}</h2>
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

// --- hero ------------------------------------------------------------------

function Hero({ p }: { p: CandidateProfileData }) {
  return (
    <section className="overflow-hidden rounded-card bg-navy shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      <div className="relative flex flex-col sm:flex-row">
        {/* Portrait / initials */}
        <div className="relative aspect-[3/2] bg-navy-deep sm:aspect-auto sm:w-56 sm:flex-none">
          {p.photo ? (
            <Image
              src={p.photo.src}
              alt={p.photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover object-[center_20%]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[3.5rem] text-paper/50">{p.initials}</span>
            </div>
          )}
          {/* Logo tile straddling the seam: bottom edge on mobile, right edge on desktop */}
          <div className="absolute left-6 -bottom-6 z-10 flex size-13 items-center justify-center rounded-card bg-paper text-navy ring-1 ring-line sm:left-auto sm:-right-6 sm:bottom-auto sm:top-9">
            <LogoMark className="size-8" />
          </div>
        </div>

        {/* Info. Extra left padding on desktop clears the seam tile. */}
        <div className="min-w-0 flex-1 px-6 pt-12 pb-7 sm:py-8 sm:pr-8 sm:pl-12 lg:py-9 lg:pr-9 lg:pl-14">
          <p className="text-caption font-semibold tracking-wide text-paper/50 uppercase">
            {p.eyebrow}
          </p>
          <h1 className="mt-2 display display-figure text-paper">{p.name}</h1>
          <p className="mt-1.5 font-display text-lede leading-snug text-paper/85">{p.role}</p>

          {p.qualLine && (
            <p className="mt-4 flex items-start gap-2.5 text-small text-paper/80">
              <GraduationCap size={16} weight="light" className="mt-0.5 shrink-0 text-paper/55" />
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

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small text-paper/80">
            {p.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} weight="light" className="shrink-0 text-paper/55" />
                {p.location}
              </span>
            )}
            {p.overlap && (
              <span className="inline-flex items-center gap-2">
                <Clock size={15} weight="light" className="shrink-0 text-paper/55" />
                {p.overlap}
              </span>
            )}
            {p.availability && (
              <span className="inline-flex items-center gap-2">
                <CalendarBlank size={15} weight="light" className="shrink-0 text-paper/55" />
                {p.availability}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-paper/15 pt-5">
            {p.compensation && (
              <div>
                <p className="text-caption font-semibold tracking-wide text-paper/50 uppercase">
                  Expected compensation
                </p>
                <p className="mt-1.5 font-display text-[clamp(1.6rem,1.4rem+1vw,2rem)] leading-none tracking-[-0.01em] whitespace-nowrap text-paper">
                  {p.compensation.value}
                </p>
                {p.compensation.unit && (
                  <p className="mt-1 text-caption text-paper/60">{p.compensation.unit}</p>
                )}
              </div>
            )}
            <CandidateActions candidateId={p.id} candidateName={p.name} variant="hero" />
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
    <SectionCard title="Verified by AccountingTalent">
      <p className="-mt-2 mb-2 text-caption text-muted">
        Only completed checks are shown.
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
                <VerifiedBadge>{v.status}</VerifiedBadge>
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

// --- decision panel --------------------------------------------------------

function DecisionPanel({ p }: { p: CandidateProfileData }) {
  return (
    <div className="rounded-card bg-navy p-6 text-paper shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)]">
      <p className="text-caption font-semibold tracking-wide text-paper/50 uppercase">
        Decision summary
      </p>
      <dl className="mt-3 divide-y divide-paper/12">
        {p.decision.map((d) => (
          <div key={d.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-caption text-paper/60">{d.label}</dt>
            <dd className="max-w-[60%] text-right text-small font-medium text-paper">{d.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5">
        <CandidateActions candidateId={p.id} candidateName={p.name} variant="panel" />
      </div>
      <p className="mt-4 text-fine text-paper/50">
        Contact details are shared only after an introduction is accepted.
      </p>
    </div>
  );
}

// --- page ------------------------------------------------------------------

export function CandidateProfile({ profile: p }: { profile: CandidateProfileData }) {
  return (
    <div className="flex min-h-full flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center px-5 lg:h-[72px] lg:px-8">
          <Logo />
        </div>
      </header>

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

        <Hero p={p} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start">
          <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
            {p.summary && (
              <SectionCard title="Professional summary">
                <p className="text-small leading-relaxed text-muted">{p.summary}</p>
              </SectionCard>
            )}

            {p.writingSample && (
              <SectionCard title="In their own words">
                <blockquote className="border-l-2 border-line pl-5">
                  <p className="max-w-[64ch] text-small leading-relaxed text-ink">
                    {p.writingSample.text}
                  </p>
                  <footer className="mt-3 text-caption text-subtle">
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
      </main>

      {/* Mobile sticky action bar */}
      <div className="sticky bottom-0 z-20 border-t border-navy-deep bg-navy/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-[1160px]">
          <CandidateActions candidateId={p.id} candidateName={p.name} variant="mobile" />
        </div>
      </div>
    </div>
  );
}
