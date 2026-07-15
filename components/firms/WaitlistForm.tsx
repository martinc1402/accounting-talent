"use client";

import { useActionState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { joinFirmWaitlist, type WaitlistState } from "@/app/actions";
import { firms } from "@/content/firms";
import { ButtonAction } from "@/components/ui/Button";

const initial: WaitlistState = { status: "idle" };

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(
    joinFirmWaitlist,
    initial,
  );

  if (state.status === "success") {
    return (
      <p className="flex items-start gap-3 rounded-card border border-navy/20 bg-white p-5 text-body text-navy">
        <CheckCircle size={20} weight="light" className="mt-0.5 shrink-0" />
        {firms.waitlist.success}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate>
      <label
        htmlFor="email"
        className="block text-caption font-medium text-ink"
      >
        {firms.waitlist.label}
      </label>

      {/*
        Always stacked: input full width, button full width beneath it. This form
        only ever lives in the narrow waitlist card (~410px), where sitting the
        input beside a "Join the waitlist" button squeezes it below the width of
        its own "you@yourfirm.com" placeholder and clips it. Full-width input
        removes the clip at every viewport.
      */}
      <div className="mt-2 flex flex-col gap-3">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={firms.waitlist.placeholder}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? "email-error" : undefined}
          className={`w-full rounded-full border bg-white px-5 py-3.5 text-body text-ink placeholder:text-subtle/70 transition-colors focus:border-navy focus:outline-none ${
            state.status === "error"
              ? "border-red-700"
              : "border-line hover:border-navy/40"
          }`}
        />

        <ButtonAction type="submit" disabled={pending} className="w-full">
          {pending ? "Adding you..." : firms.waitlist.cta}
        </ButtonAction>
      </div>

      {/* 12px, muted: sets expectations before the click, which is what a firm
          hovering over a work-email field wants to know. */}
      <p className="mt-3 text-fine text-subtle">{firms.waitlist.microcopy}</p>

      {state.status === "error" && (
        <p
          id="email-error"
          role="alert"
          className="mt-3 flex items-start gap-2 text-small text-red-800"
        >
          <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}
    </form>
  );
}
