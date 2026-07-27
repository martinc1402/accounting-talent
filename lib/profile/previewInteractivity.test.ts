import { describe, it, expect } from "vitest";
import { primaryIsLive } from "./previewInteractivity";
import type { ProfileCtaState } from "./candidate";

const CTAS: ProfileCtaState[] = [
  { kind: "register" },
  { kind: "verify" },
  { kind: "request" },
  { kind: "at_limit" },
  { kind: "status", status: "requested" },
  { kind: "accepted" },
  { kind: "preview" },
  { kind: "self" },
];

describe("primaryIsLive — the single gate for the mutating employer handler", () => {
  it("is live ONLY for the 'request' CTA when not previewing", () => {
    for (const cta of CTAS) {
      expect(primaryIsLive(cta, false)).toBe(cta.kind === "request");
    }
  });

  it("NO employer handler can fire in preview — every CTA is inert", () => {
    for (const cta of CTAS) {
      expect(primaryIsLive(cta, true)).toBe(false);
    }
  });

  it("the request CTA specifically goes inert under preview", () => {
    expect(primaryIsLive({ kind: "request" }, false)).toBe(true);
    expect(primaryIsLive({ kind: "request" }, true)).toBe(false);
  });
});
