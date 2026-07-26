import { describe, it, expect } from "vitest";
import { normalizeEmail, emailsMatch } from "./email";
import { PLAN_ENTITLEMENTS, entitlementsFor } from "./plans";
import {
  deriveVisibility,
  canSeeIdentity,
  canViewPhoto,
  canIndexProfile,
} from "./visibility";
import {
  validateTransition,
  canCreateIntroduction,
  isActiveStatus,
} from "./introductions";
import { projectProfileView, type ProjectContext } from "./projectCandidate";
import type { EmployerAccount, Introduction, Viewer } from "./types";
import type { CandidateProfile } from "@/lib/profile/candidate";

// --- fixtures --------------------------------------------------------------

function account(over: Partial<EmployerAccount> = {}): EmployerAccount {
  return {
    id: "acc-A",
    name: "Firm A",
    verificationState: "verified",
    plan: "free",
    entitlements: null,
    ...over,
  };
}

function userViewer(over: Partial<Extract<Viewer, { kind: "user" }>> = {}): Viewer {
  return {
    kind: "user",
    userId: "u1",
    email: "e@firm.com",
    isAdmin: false,
    account: null,
    memberRole: null,
    ...over,
  };
}

const anon: Viewer = { kind: "anonymous" };

function intro(over: Partial<Introduction> = {}): Introduction {
  return {
    id: "i1",
    applicationId: "app1",
    employerAccountId: "acc-A",
    status: "requested",
    createdAt: "2026-01-01T00:00:00Z",
    ...over,
  };
}

const baseView = {
  id: "app1",
  eyebrow: "Verified candidate",
  name: "Priya Sharma",
  initials: "PS",
  role: "US Tax Preparer",
  photo: { src: "/priya.jpg", alt: "Priya Sharma, US Tax Preparer" },
  qualLine: "CA Intermediate · 4 years' US tax experience",
  heroVerifications: [],
  evidence: [],
  location: "Ahmedabad, India",
  overlap: "4 hours ET overlap",
  availability: "Available within 30 days",
  compensation: { value: "$900-$1,200", unit: "USD / month" },
  summary: "Summary.",
  software: [],
  verifications: [],
  history: [
    {
      title: "Senior Tax Associate",
      // employer_public is a location/name-free anonymised descriptor by convention.
      meta: "Outsourced US CPA firm",
      dates: "2022",
      bullets: ["Prepared 300+ returns."],
      exposure: "US returns",
    },
  ],
  education: [{ qualification: "CA Intermediate", meta: "ICAI · India" }],
  preferences: [],
  decision: [],
} as unknown as CandidateProfile;

function ctx(over: Partial<ProjectContext> = {}): ProjectContext {
  return {
    isPreview: false,
    isAdminViewer: false,
    privacy: { publicPhoto: false, publicCompensation: true },
    contact: null,
    cta: { kind: "register" },
    entitlements: PLAN_ENTITLEMENTS.free,
    ...over,
  };
}

const CONTACT = { fullName: "Priya Sharma", email: "priya@real.com", phone: "+91 90000 00000" };

// --- email / admin bootstrap ----------------------------------------------

describe("email normalization + admin compare", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });
  it("matches case-insensitively but never matches empty/unset", () => {
    expect(emailsMatch("A@B.com", " a@b.com ")).toBe(true);
    expect(emailsMatch("", "a@b.com")).toBe(false);
    expect(emailsMatch(undefined, undefined)).toBe(false);
    expect(emailsMatch("a@b.com", "c@d.com")).toBe(false);
  });
});

// --- visibility derivation -------------------------------------------------

describe("deriveVisibility", () => {
  it("(1) anonymous by default", () => {
    expect(deriveVisibility(anon, null).level).toBe("anonymous");
  });
  it("(2) signed-in unverified employer == anonymous-level", () => {
    expect(deriveVisibility(userViewer(), null).level).toBe("unverified_employer");
    // unverified is treated identically to anonymous for field access:
    expect(canSeeIdentity("unverified_employer")).toBe(false);
  });
  it("(3) verified free / (5) paid", () => {
    expect(deriveVisibility(userViewer({ account: account({ plan: "free" }) }), null).level).toBe(
      "free_verified_employer",
    );
    expect(deriveVisibility(userViewer({ account: account({ plan: "paid" }) }), null).level).toBe(
      "paid_verified_employer",
    );
  });
  it("(7) accepted reveals ONLY to the associated account", () => {
    const viewer = userViewer({ account: account({ id: "acc-A", plan: "paid" }) });
    const accepted = intro({ employerAccountId: "acc-A", status: "accepted" });
    expect(deriveVisibility(viewer, accepted).level).toBe("accepted_introduction");
  });
  it("(8) another employer's accepted intro does NOT elevate", () => {
    const viewerB = userViewer({ account: account({ id: "acc-B", plan: "paid" }) });
    const otherAccepted = intro({ employerAccountId: "acc-A", status: "accepted" });
    // Even if some other account's accepted intro were passed, B is not elevated.
    expect(deriveVisibility(viewerB, otherAccepted).level).toBe("paid_verified_employer");
  });
  it("expired/cancelled introductions never reveal identity", () => {
    const viewer = userViewer({ account: account({ id: "acc-A" }) });
    for (const status of ["expired", "cancelled", "declined", "under_review"] as const) {
      expect(deriveVisibility(viewer, intro({ status })).level).toBe("free_verified_employer");
    }
  });
  it("(9) admin", () => {
    expect(deriveVisibility(userViewer({ isAdmin: true }), null).level).toBe("admin");
  });
  it("(13) admin preview changes level but flags isPreview; non-admin cannot preview", () => {
    const p = deriveVisibility(userViewer({ isAdmin: true }), null, { previewAs: "anonymous" });
    expect(p).toEqual({ level: "anonymous", isPreview: true });
    const nonAdmin = deriveVisibility(userViewer({ account: account() }), null, {
      previewAs: "admin",
    });
    expect(nonAdmin.isPreview).toBe(false);
    expect(nonAdmin.level).toBe("free_verified_employer");
  });
});

// --- field projection ------------------------------------------------------

describe("projectProfileView field-level filtering", () => {
  it("(1) anonymous omits gated fields", () => {
    const out = projectProfileView(baseView, "anonymous", ctx({ contact: CONTACT }));
    expect(out.name).toBe("Priya S."); // last name -> initial
    expect(out.photo).toBeUndefined(); // photo private by default
    expect(out.location).toBe("India"); // exact city hidden
    expect(out.history[0].meta).toBe("Outsourced US CPA firm · Name withheld");
    expect(out.education[0].meta).toBeUndefined(); // institution generalised away
    expect(out.contact).toBeUndefined(); // identity never leaks
    // (10) nothing PII survives serialization
    const json = JSON.stringify(out);
    expect(json).not.toContain("Priya Sharma");
    expect(json).not.toContain("priya@real.com");
    expect(json).not.toContain("Ahmedabad");
    expect(json).not.toContain("ICAI");
  });

  it("public compensation consent gates the value, not verified level", () => {
    const consented = projectProfileView(baseView, "anonymous", ctx({ privacy: { publicPhoto: false, publicCompensation: true } }));
    expect(consented.compensation).toBeDefined();
    expect(consented.access?.compensationLocked).toBe(false);

    const withheld = projectProfileView(baseView, "anonymous", ctx({ privacy: { publicPhoto: false, publicCompensation: false } }));
    expect(withheld.compensation).toBeUndefined();
    expect(withheld.access?.compensationLocked).toBe(true);
    expect(JSON.stringify(withheld)).not.toContain("$900");
  });

  it("public_photo consent shows the photo to anonymous, unlocked", () => {
    const out = projectProfileView(baseView, "anonymous", ctx({ privacy: { publicPhoto: true, publicCompensation: true } }));
    expect(out.photo).toBeDefined();
    expect(out.photo?.locked).toBeFalsy(); // candidate consented -> clear
  });

  it("photo is frosted (locked) for verified employers until an intro is accepted", () => {
    const free = projectProfileView(baseView, "free_verified_employer", ctx({ entitlements: PLAN_ENTITLEMENTS.free }));
    expect(free.photo?.locked).toBe(true);
    const paid = projectProfileView(baseView, "paid_verified_employer", ctx({ entitlements: PLAN_ENTITLEMENTS.paid }));
    expect(paid.photo?.locked).toBe(true);
    const accepted = projectProfileView(baseView, "accepted_introduction", ctx({ contact: CONTACT }));
    expect(accepted.photo).toBeDefined();
    expect(accepted.photo?.locked).toBeFalsy(); // introduction accepted -> clear
  });

  it("(3) free verified: photo, exact city, named institutions; no identity", () => {
    const out = projectProfileView(baseView, "free_verified_employer", ctx({ contact: CONTACT, entitlements: PLAN_ENTITLEMENTS.free }));
    expect(out.photo).toBeDefined();
    expect(out.location).toBe("Ahmedabad, India");
    expect(out.education[0].meta).toBe("ICAI · India");
    expect(out.name).toBe("Priya S.");
    expect(out.contact).toBeUndefined();
    expect(out.history[0].meta).toBe("Outsourced US CPA firm · Name withheld"); // real name still hidden
  });

  it("(6) paid verified still cannot see identity without acceptance", () => {
    const out = projectProfileView(baseView, "paid_verified_employer", ctx({ contact: CONTACT, entitlements: PLAN_ENTITLEMENTS.paid }));
    expect(out.name).toBe("Priya S.");
    expect(out.contact).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain("priya@real.com");
  });

  it("(7) accepted introduction reveals full name + contact", () => {
    const out = projectProfileView(baseView, "accepted_introduction", ctx({ contact: CONTACT }));
    expect(out.name).toBe("Priya Sharma");
    expect(out.contact?.email).toBe("priya@real.com");
  });

  it("(9) admin sees full name, contact and REAL employer meta", () => {
    const out = projectProfileView(baseView, "admin", ctx({ contact: CONTACT, isAdminViewer: true }));
    expect(out.name).toBe("Priya Sharma");
    expect(out.contact?.email).toBe("priya@real.com");
    expect(out.history[0].meta).toContain("Outsourced US CPA firm");
    expect(out.access?.adminControls).toBe(true);
  });
});

// --- entitlements + introduction rules ------------------------------------

describe("plan entitlements", () => {
  it("(14) free vs paid differ; per-account override applies", () => {
    expect(entitlementsFor(account({ plan: "free" })).maxActiveIntroductions).toBe(1);
    expect(entitlementsFor(account({ plan: "paid" })).maxActiveIntroductions).toBeGreaterThanOrEqual(2);
    expect(entitlementsFor(account({ plan: "free" })).assessmentBreakdown).toBe(false);
    expect(entitlementsFor(account({ plan: "paid" })).assessmentBreakdown).toBe(true);
    const overridden = entitlementsFor(account({ plan: "free", entitlements: { maxActiveIntroductions: 3 } }));
    expect(overridden.maxActiveIntroductions).toBe(3);
  });
});

describe("introduction state machine + limits", () => {
  it("valid + invalid transitions", () => {
    expect(validateTransition("requested", "under_review")).toBe(true);
    expect(validateTransition("candidate_invited", "accepted")).toBe(true);
    expect(validateTransition("requested", "accepted")).toBe(false);
    expect(validateTransition("accepted", "cancelled")).toBe(false); // terminal
  });
  it("active status set", () => {
    expect(isActiveStatus("accepted")).toBe(true);
    expect(isActiveStatus("cancelled")).toBe(false);
  });
  it("(4) free employer cannot create a second active request", () => {
    const free = PLAN_ENTITLEMENTS.free;
    expect(canCreateIntroduction({ level: "free_verified_employer", activeCount: 0, entitlements: free })).toEqual({ ok: true });
    expect(canCreateIntroduction({ level: "free_verified_employer", activeCount: 1, entitlements: free })).toEqual({ ok: false, reason: "at_limit" });
  });
  it("(5) paid employer gets more concurrency", () => {
    const paid = PLAN_ENTITLEMENTS.paid;
    expect(canCreateIntroduction({ level: "paid_verified_employer", activeCount: 1, entitlements: paid }).ok).toBe(true);
    expect(canCreateIntroduction({ level: "paid_verified_employer", activeCount: paid.maxActiveIntroductions, entitlements: paid })).toEqual({ ok: false, reason: "at_limit" });
  });
  it("unverified/anonymous cannot create", () => {
    expect(canCreateIntroduction({ level: "anonymous", activeCount: 0, entitlements: PLAN_ENTITLEMENTS.free })).toEqual({ ok: false, reason: "not_verified" });
    expect(canCreateIntroduction({ level: "unverified_employer", activeCount: 0, entitlements: PLAN_ENTITLEMENTS.free })).toEqual({ ok: false, reason: "not_verified" });
  });
});

// --- assets + indexing -----------------------------------------------------

describe("asset + index gating", () => {
  it("(11) photo endpoint gate", () => {
    expect(canViewPhoto("anonymous", false)).toBe(false);
    expect(canViewPhoto("anonymous", true)).toBe(true);
    expect(canViewPhoto("unverified_employer", false)).toBe(false);
    expect(canViewPhoto("free_verified_employer", false)).toBe(true);
  });
  it("(12) noindex truth table", () => {
    expect(canIndexProfile({ allowSearchIndexing: true, hasVerifiedAt: true, hasAvailability: true })).toBe(true);
    expect(canIndexProfile({ allowSearchIndexing: false, hasVerifiedAt: true, hasAvailability: true })).toBe(false);
    expect(canIndexProfile({ allowSearchIndexing: true, hasVerifiedAt: false, hasAvailability: true })).toBe(false);
    expect(canIndexProfile({ allowSearchIndexing: true, hasVerifiedAt: true, hasAvailability: false })).toBe(false);
  });
});
