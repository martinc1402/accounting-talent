import { describe, it, expect } from "vitest";
import {
  passportPillars,
  networkPrinciples,
  employerPlans,
  ongoingHiring,
  serviceOptions,
  statusLabels,
  type Action,
  type CapabilityStatus,
} from "@/content/passport";
import { firms } from "@/content/firms";
import { faq, employerFaq } from "@/content/faq";

/*
  The acceptance criteria for this rewrite that are mechanically checkable, made
  into tests so they survive the next person editing copy.

  Two of these are the whole point:

  1. NO DEAD CTAs. Every href a marketing page renders has to go somewhere real.
  2. NOTHING UNBUILT GETS A BUTTON. content/passport.ts uses a discriminated union
     so a "planned" Action carries no href, which makes this a compile error
     already. The test is here because a future edit could widen that type, and
     the widening would look harmless in review.

  Note this file lives under lib/ rather than beside the content it checks: the
  vitest include glob only covers test files under lib/, so a test written in
  content/ or components/ is silently never run.
*/

/** Every route that actually exists as a page in this app. */
const REAL_ROUTES = [
  "/",
  "/accountants",
  "/apply",
  "/faq",
  "/legal",
  "/login",
  "/candidates/preview",
  "/candidates/me",
  "/employer",
];

/** Section ids rendered on "/" that an anchor may target. */
const EMPLOYER_ANCHORS = [
  "network",
  "passport",
  "how-hiring-works",
  "pricing",
  "reserve",
  "faq",
];

function assertHrefResolves(href: string, where: string) {
  expect(href, `${where}: href must not be empty`).toBeTruthy();
  expect(href, `${where}: "#" is a dead CTA`).not.toBe("#");

  if (href.startsWith("mailto:")) return;

  expect(
    href.startsWith("/"),
    `${where}: href "${href}" must be root-relative or mailto`,
  ).toBe(true);

  const [path, hash] = href.split("#");
  const route = path === "" ? "/" : path;
  expect(REAL_ROUTES, `${where}: route "${route}" does not exist`).toContain(
    route,
  );

  if (hash && route === "/") {
    expect(
      EMPLOYER_ANCHORS,
      `${where}: "/" has no section with id "${hash}"`,
    ).toContain(hash);
  }
}

function assertAction(action: Action, where: string) {
  if (action.status === "planned") {
    // The guarantee. An unbuilt capability has no href AND no label, so it
    // cannot be rendered as anything pressable.
    expect(
      "href" in action,
      `${where}: a planned capability must not carry an href`,
    ).toBe(false);
    expect(
      "label" in action,
      `${where}: a planned capability must not carry a button label`,
    ).toBe(false);
    expect(action.note.trim().length, `${where}: needs an explanatory note`)
      .toBeGreaterThan(0);
    return;
  }
  assertHrefResolves(action.href, where);
  expect(action.label.trim().length, `${where}: needs a label`).toBeGreaterThan(0);
}

describe("no dead CTAs", () => {
  it("every top-level page CTA resolves", () => {
    assertHrefResolves(firms.reserve.href, "firms.reserve");
    assertHrefResolves(firms.secondary.href, "firms.secondary");
  });

  /*
    Every call to action on the employer homepage lands on the intake form.

    This is a product decision, not a tidiness one, and it is the reason the
    "Explore talent" button and the example-profile link are gone: the page's most
    prominent button used to scroll to #network, which moved a reader down the
    page instead of into the only thing on it that captures intent.

    Navigation is deliberately NOT covered by this. content/site.ts navItems still
    points "Find Talent" at /#network, and it should: a nav is for getting around
    a page, a CTA is for converting on it. If you add a button here, it goes to
    the form or it does not go on the page.
  */
  it("every employer CTA goes to the intake form", () => {
    const ctas: [string, string][] = [
      ["firms.reserve", firms.reserve.href],
      ["firms.secondary", firms.secondary.href],
      ...employerPlans.map(
        (p) =>
          [`plan "${p.id}"`, p.action.status === "planned" ? "/#reserve" : p.action.href] as [
            string,
            string,
          ],
      ),
      ["ongoingHiring", ongoingHiring.action.href],
    ];

    for (const [where, href] of ctas) {
      expect(href, `${where}: every employer CTA must land on the form`).toBe(
        "/#reserve",
      );
    }
  });

  it("every plan CTA resolves", () => {
    for (const plan of employerPlans) {
      assertAction(plan.action, `plan "${plan.id}"`);
    }
    assertAction(ongoingHiring.action, "ongoingHiring");
  });

  it("no paid plan claims a checkout that does not exist", () => {
    // There is no payment code in this repo at all. A paid plan may reserve
    // interest; it may not say "Get" or "Buy" or "Subscribe".
    for (const plan of employerPlans) {
      if (plan.action.status === "planned") continue;
      if (plan.price.toLowerCase() === "free") continue;
      const label = plan.action.label.toLowerCase();
      expect(
        /^(get|buy|purchase|subscribe|pay)\b/.test(label),
        `plan "${plan.id}": "${plan.action.label}" implies a checkout that is not built`,
      ).toBe(false);
    }
  });
});

describe("unbuilt capabilities are labelled and unclickable", () => {
  it("labels every non-live status and leaves live ones unlabelled", () => {
    expect(statusLabels.live).toBe("");
    expect(statusLabels["early-access"].length).toBeGreaterThan(0);
    expect(statusLabels.planned.length).toBeGreaterThan(0);
  });

  it("every pillar that is not live explains what exists today", () => {
    for (const pillar of passportPillars) {
      if (pillar.status === "live") continue;
      expect(
        pillar.today?.trim().length ?? 0,
        `pillar "${pillar.id}" is ${pillar.status} and must say what exists today`,
      ).toBeGreaterThan(0);
    }
  });

  it("carries a real status on every principle and plan feature", () => {
    const valid: CapabilityStatus[] = ["live", "early-access", "planned"];
    for (const p of networkPrinciples) expect(valid).toContain(p.status);
    for (const plan of employerPlans) {
      for (const f of plan.includes) expect(valid).toContain(f.status);
    }
  });

  it("does not describe the network as more finished than it is", () => {
    // Three of the five pillars genuinely are not built. If a future edit marks
    // everything live, that is far more likely to be optimism than delivery.
    const live = passportPillars.filter((p) => p.status === "live").length;
    expect(live).toBeLessThan(passportPillars.length);
  });
});

describe("the service vocabulary is shared, not duplicated", () => {
  it("has one option per plan id, plus ongoing", () => {
    const ids = serviceOptions.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const plan of employerPlans) {
      expect(
        ids,
        `plan "${plan.id}" has no matching intake option, so a lead cannot say it wanted this`,
      ).toContain(plan.id);
    }
    expect(ids).toContain("ongoing");
  });

  it("gives every option a non-empty label for the select and the column", () => {
    for (const option of serviceOptions) {
      expect(option.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("FAQ ids are a stable interface", () => {
  it("gives every item a unique kebab-case id", () => {
    // Ids are deep-link anchors, JSON-LD keys and the faq_opened analytics prop.
    for (const list of [faq, employerFaq]) {
      const ids = list.map((item) => item.id);
      for (const id of ids) {
        expect(id, "every FAQ item needs an id").toBeTruthy();
        expect(id).toMatch(/^[a-z0-9-]+$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("gives every item at least one answer paragraph", () => {
    for (const item of [...faq, ...employerFaq]) {
      expect(item.a.length, `"${item.q}" has no answer`).toBeGreaterThan(0);
    }
  });
});

describe("copy discipline", () => {
  /* Collect every user-facing string these content modules hold. */
  function strings(value: unknown, out: string[] = []): string[] {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
    else if (value && typeof value === "object") {
      Object.values(value).forEach((v) => strings(v, out));
    }
    return out;
  }

  const allCopy = [
    ...strings(firms),
    ...strings(passportPillars),
    ...strings(networkPrinciples),
    ...strings(employerPlans),
    ...strings(faq),
    ...strings(employerFaq),
  ];

  it("uses no em dashes or en dashes", () => {
    // The site's stated dash convention, held to in every content file.
    const offenders = allCopy.filter((s) => s.includes("—") || s.includes("–"));
    expect(offenders, `found dashes in: ${offenders.slice(0, 3).join(" | ")}`).toEqual([]);
  });

  it("never claims a blanket verification or a guaranteed outcome", () => {
    /*
      AFFIRMATIVE constructions only. The first version of this test banned the
      substring "guaranteed hire" and immediately failed on

        "A guaranteed hire. We do not control whether the right person is
         available when you need them."

      which is an item in the "what this does not get you" list, i.e. exactly the
      honesty the test is supposed to protect. Both pages deny these outcomes
      explicitly and must be able to keep doing so, so match the promise rather
      than the noun.
    */
    const banned = [
      /\bwe guarantee\b/,
      /\byou are guaranteed\b/,
      /\bguarantees you\b/,
      /\bguaranteed placement\b/,
      /\bfully verified\b/,
      /\bevery claim (?:is|has been) (?:checked|verified)\b/,
    ];
    for (const pattern of banned) {
      const offenders = allCopy.filter((s) => pattern.test(s.toLowerCase()));
      expect(offenders, `${pattern} appears in: ${offenders[0] ?? ""}`).toEqual([]);
    }
  });
});
