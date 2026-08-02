import { describe, it, expect } from "vitest";
import { isFreeEmailProvider } from "./freeProviders";

describe("isFreeEmailProvider", () => {
  it("catches the consumer providers a firm owner actually types", () => {
    expect(isFreeEmailProvider("jane@gmail.com")).toBe(true);
    expect(isFreeEmailProvider("jane@yahoo.com")).toBe(true);
    expect(isFreeEmailProvider("jane@hotmail.com")).toBe(true);
    expect(isFreeEmailProvider("jane@outlook.com")).toBe(true);
    expect(isFreeEmailProvider("jane@icloud.com")).toBe(true);
  });

  it("lets real firm domains through", () => {
    expect(isFreeEmailProvider("jane@cooperandassociates.com")).toBe(false);
    expect(isFreeEmailProvider("jane@kpmg.com")).toBe(false);
    expect(isFreeEmailProvider("jane@my-cpa-firm.co")).toBe(false);
  });

  it("is case and whitespace insensitive", () => {
    expect(isFreeEmailProvider("Jane@GMAIL.com")).toBe(true);
    expect(isFreeEmailProvider("jane@gmail.com  ")).toBe(true);
  });

  it("matches subdomains of a provider, not merely a shared prefix", () => {
    expect(isFreeEmailProvider("jane@mail.yahoo.com")).toBe(true);
    // The reason the check is a domain-boundary suffix match rather than a
    // startsWith: a real practice can be named after the word.
    expect(isFreeEmailProvider("jane@gmail.consulting")).toBe(false);
    expect(isFreeEmailProvider("jane@yahoofinancialgroup.com")).toBe(false);
    expect(isFreeEmailProvider("jane@notgmail.com")).toBe(false);
  });

  it("returns false for anything that is not an address, so the caller's own validity error wins", () => {
    expect(isFreeEmailProvider("")).toBe(false);
    expect(isFreeEmailProvider("gmail.com")).toBe(false);
    expect(isFreeEmailProvider("jane@")).toBe(false);
  });

  it("uses the last @ so a plus-tag or quoted local part cannot smuggle a domain past it", () => {
    expect(isFreeEmailProvider("jane+cooper@gmail.com")).toBe(true);
    expect(isFreeEmailProvider("jane@firm.com@gmail.com")).toBe(true);
  });
});
