import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";
import { navItems, memberCta, footer } from "@/content/site";
import { statusLabels } from "@/content/passport";
import {
  hero,
  finalCta,
  pricing,
  getAccess,
  problem,
  howItWorks,
  filters,
  listings,
  trust,
  membershipPlans,
} from "@/content/jobs";

/*
  Guards for the public site after the 2026-10 simplification: "/" sells one
  thing (a job-search membership), /get-access reserves it, /legal is the only
  other public page. /apply, /employers and the FAQs were deleted; /accountants
  and the logged-in areas are redirected away in next.config.ts.

  Lives under lib/ because vitest only collects tests there.
*/

/** Every public page that actually exists. */
const REAL_ROUTES = ["/", "/get-access", "/legal"];

/** Routes that were removed or hidden. Nothing public may link to them. */
const RETIRED = [
  "/apply",
  "/employers",
  "/accountants",
  "/faq",
  "/login",
  "/candidates",
  "/employer",
  "/assessment",
];

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/** Section ids an anchor on "/" may target, read from the source that renders them. */
const homeSource =
  read("app/page.tsx") +
  read("components/jobs/FilterPreview.tsx") +
  read("components/jobs/HomePricing.tsx");
const homeAnchors = [...homeSource.matchAll(/\bid="([a-z0-9-]+)"/g)].map((m) => m[1]);

function assertHrefResolves(href: string, where: string) {
  expect(href, `${where}: href must not be empty`).toBeTruthy();
  expect(href, `${where}: "#" is a dead CTA`).not.toBe("#");
  if (href.startsWith("mailto:")) return;

  // A bare "#x" is a same-page anchor; only "/" uses those.
  const [path, hash] = href.split("#");
  const route = path === "" ? "/" : path.split("?")[0];
  expect(REAL_ROUTES, `${where}: route "${route}" does not exist`).toContain(route);
  if (hash && route === "/") {
    expect(homeAnchors, `${where}: "/" has no section with id "${hash}"`).toContain(hash);
  }
}

const publicHrefs: [string, string][] = [
  ...navItems.map((i) => [`nav "${i.label}"`, i.href] as [string, string]),
  ["memberCta", memberCta.href],
  ...footer.links.map((l) => [`footer "${l.label}"`, l.href] as [string, string]),
  ["hero.primary", hero.primary.href],
  ["hero.secondary", hero.secondary.href],
  ["finalCta.primary", finalCta.primary.href],
  ["finalCta.secondary", finalCta.secondary.href],
];

describe("no dead links", () => {
  it("nav, footer and page CTAs all resolve", () => {
    for (const [where, href] of publicHrefs) assertHrefResolves(href, where);
  });

  it("never links to a retired route", () => {
    for (const [where, href] of publicHrefs) {
      for (const r of RETIRED) {
        const hit = href === r || href.startsWith(`${r}/`) || href.startsWith(`${r}#`);
        expect(hit, `${where} (${href}) links to retired ${r}`).toBe(false);
      }
    }
  });
});

describe("retired routes redirect, temporarily", () => {
  it("covers every retired route with a non-permanent redirect to /", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    for (const r of RETIRED) {
      const rule = redirects.find((x) => x.source === r || x.source === `${r}/:path*`);
      expect(rule, `no redirect for ${r}`).toBeDefined();
      expect(rule!.destination, `${r} should go to "/"`).toBe("/");
      // Temporary on purpose: a cached 308 outlives the decision (see next.config.ts).
      expect("permanent" in rule! && rule!.permanent, `${r} must not be permanent`).toBe(false);
    }
  });
});

describe("no checkout is implied", () => {
  it("never says Get, Buy, Subscribe or Pay on a button", () => {
    const labels = [
      memberCta.label,
      finalCta.primary.label,
      getAccess.submit,
      ...membershipPlans.map((p) => `${pricing.ctaPrefix} ${p.name.toLowerCase()}`),
    ];
    for (const label of labels) {
      expect(
        /^(get|buy|purchase|subscribe|pay)\b/i.test(label),
        `"${label}" implies a checkout that is not built`,
      ).toBe(false);
    }
  });
});

describe("status labels", () => {
  it("labels every non-live status and leaves live ones unlabelled", () => {
    expect(statusLabels.live).toBe("");
    expect(statusLabels["early-access"].length).toBeGreaterThan(0);
    expect(statusLabels.planned.length).toBeGreaterThan(0);
  });
});

describe("copy discipline", () => {
  function strings(value: unknown, out: string[] = []): string[] {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
    else if (value && typeof value === "object") {
      Object.values(value).forEach((v) => strings(v, out));
    }
    return out;
  }
  const allCopy = strings([
    hero,
    problem,
    howItWorks,
    filters,
    listings,
    pricing,
    trust,
    finalCta,
    getAccess,
  ]);

  it("never claims a guaranteed outcome", () => {
    // Affirmative constructions only: the page must stay free to deny these.
    const banned = [
      /\bwe guarantee\b/,
      /\byou are guaranteed\b/,
      /\bguarantees you\b/,
      /\bguaranteed (job|visa|placement|interview)\b/,
    ];
    for (const pattern of banned) {
      const offenders = allCopy.filter((s) => pattern.test(s.toLowerCase()));
      expect(offenders, `${pattern} appears in: ${offenders[0] ?? ""}`).toEqual([]);
    }
  });
});
