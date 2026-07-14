# AccountingTalent.in

A direct-hire platform where US CPA firms hire India-based accounting professionals.

This is the v1 worker-facing site. Employers do not arrive until late 2026, so the only job of this build is to fill the talent database: every page speaks to Indian accountants, and every path leads to `/apply`.

## Running it

```bash
npm install
npm run dev
```

The application form and the employer waitlist work end to end without a database. Both server actions validate, score, and log their payload to the terminal when Supabase is not configured, so the funnel is testable immediately. Copy `.env.example` to `.env.local` when you are ready to persist.

## Pages

| Route | Purpose |
|---|---|
| `/` | Worker-facing homepage |
| `/apply` | Ad landing page. No nav, `noindex`, captures UTM params |
| `/for-firms` | Employer waitlist |
| `/faq` | Full FAQ |
| `/legal` | Privacy and terms |

## Architecture

Copy is **not** hardcoded in JSX. Every user-facing string resolves from `content/`:

- `content/site.ts` — nav, footer, launch-date constants
- `content/home.ts` — every homepage string
- `content/faq.ts` — shared by the homepage short-FAQ and `/faq`
- `content/form.ts` — all 19 application questions as typed data
- `content/firms.ts`, `content/legal.ts`

`content/form.ts` is the single source of truth for the application: it drives the form UI, the validation in `lib/validate.ts`, the routing rules in `lib/scoring.ts`, and the columns in `supabase/migrations/0001_applications.sql`. Adding a question is one edit.

This matters because of **the flip**: at employer launch the homepage hero swaps to the employer pitch and worker recruitment moves to `/careers`. Because the sections read from `content/`, that is a content change rather than a rewrite.

### Scoring

`lib/scoring.ts` implements the routing rules from `stage1-application-form-spec.md` and runs on every submission:

- `fast_track` — currently or previously on US clients, knows a real US package, asking $1,800 or less. Stage 2 within 24 hours.
- `standard` — strong fundamentals, trainable. Stage 2 within 3 days.
- `waitlist` — Tally-only with no US exposure, or no own computer. A polite hold, not a rejection.
- `filter_out` — expectation mismatch.

### Motion

There is no animation JavaScript. Scroll reveals use native CSS scroll-driven animations behind an `@supports (animation-timeline: view())` guard, so content is visible by default and simply does not animate where the browser lacks support. This is deliberate: most of this audience is on a mid-range Android phone on a slow connection.

## Design

The visual language is borrowed from [sparkadvisors.com](https://www.sparkadvisors.com/), by request. Tokens live in `app/globals.css`.

| Role | Value |
|---|---|
| Accent (the only one) | `#131F5B` navy |
| Surfaces | `#EFF1F7`, `#DEE4EE`, `#F5F4F1` |
| Editorial tints | sage `#E0E1D6`, sand `#F1E9D0`, salmon `#F2DED0` |
| Radii | pill buttons, `0.5rem` cards and inputs |

Spark's real typefaces are ABC Arizona Mix and Basis Grotesque, both commercially licensed. This build substitutes **Newsreader** (display) and **Geist** (body), the closest freely licensed equivalents. To swap in the licensed faces, replace the two loaders in `app/layout.tsx`; everything else reads them through CSS variables.

Light mode only, by brand decision, with `color-scheme: light` set so Android's auto-dark-theme cannot invert the palette.

## Before launch

- [ ] **`/legal` is an unreviewed draft.** See the warning at the top of `content/legal.ts`. It needs a lawyer across the Indian DPDP Act 2023, the Australian Privacy Act, and cross-border data transfer.
- [ ] Email verification (Resend or Postmark). Until it ships, `applications.email_verified_at` is never set, and the spec expects that filter to remove 30-40% of rows.
- [ ] Stage 2 assessment, the referral mechanic, analytics.
