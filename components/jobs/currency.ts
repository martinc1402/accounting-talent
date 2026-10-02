"use client";

import { useState, useSyncExternalStore } from "react";
import type { Currency, MembershipPlanId } from "@/content/jobs";
import { membershipPlans } from "@/content/jobs";

/*
  Which currency to show, without making "/" dynamic.

  The server always renders INR (most readers are in India, and a static page has
  no request to look at). On the client, a ?currency= param wins, otherwise the
  browser's timezone decides: Asia/Kolkata gets INR, anywhere else gets USD. A
  manual switch overrides both for the rest of the visit.

  useSyncExternalStore rather than setState-in-an-effect: the server snapshot is
  INR, the client snapshot is the detected value, and React reconciles the two
  after hydration without a mismatch warning or a lint exception. The "store"
  never changes after load, so subscribe is a no-op.
*/
const subscribe = () => () => {};

function detectCurrency(): Currency {
  try {
    const param = new URLSearchParams(window.location.search).get("currency");
    if (param?.toLowerCase() === "usd") return "USD";
    if (param?.toLowerCase() === "inr") return "INR";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Kolkata" || tz === "Asia/Calcutta" ? "INR" : "USD";
  } catch {
    return "INR";
  }
}

export function useCurrency(): [Currency, (c: Currency) => void] {
  const detected = useSyncExternalStore(
    subscribe,
    detectCurrency,
    () => "INR" as Currency,
  );
  const [manual, setManual] = useState<Currency | null>(null);
  return [manual ?? detected, setManual];
}

/** The ?plan= a homepage pricing CTA carried here, or "" if none/invalid. */
function readPlanParam(): MembershipPlanId | "" {
  try {
    const p = new URLSearchParams(window.location.search).get("plan");
    return membershipPlans.some((plan) => plan.id === p)
      ? (p as MembershipPlanId)
      : "";
  } catch {
    return "";
  }
}

export function usePlanParam(): MembershipPlanId | "" {
  return useSyncExternalStore(subscribe, readPlanParam, () => "" as const);
}
