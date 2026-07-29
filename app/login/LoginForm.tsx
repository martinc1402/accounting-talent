"use client";

import { useEffect, useRef, useState, useTransition } from "react";

/*
  Passwordless sign-in: enter an email, receive a link. No password is ever
  collected or stored, and no role is ever chosen — one form for accountants and
  firms alike, with the destination resolved after the click.

  The send goes through POST /api/auth/signin rather than straight to Supabase
  from here, which is what makes three things possible: the 15-minute deadline,
  the resend throttle, and an unknown address producing exactly the same screen
  as a known one. This component must never learn which of the two it got, so
  there is deliberately no success/failure distinction to render.
*/

// Loose on purpose: it gates the button, it does not judge the address. The
// server re-validates.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RESEND_COOLDOWN_S = 30;

// The dashboard primary (components/candidate/CandidateDashboard.tsx), used
// verbatim so "Send sign-in link" carries the same weight as "Confirm
// availability". Never dimmed: an available action always looks fully available.
const BTN_ACTIVE =
  "rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
// The unavailable state is its own colour rather than a faded navy, so "not yet"
// never reads as a washed-out version of "go".
const BTN_MUTED =
  "cursor-not-allowed rounded-card border border-line bg-mist px-5 py-3 text-small font-semibold text-subtle";

export function LoginForm({
  next,
  linkFailed = false,
}: {
  next?: string;
  linkFailed?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(
    linkFailed ? "That sign-in link has expired or has already been used. Request a new one." : "",
  );
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = EMAIL_RE.test(email.trim());

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const send = (address: string) => {
    setError("");
    start(async () => {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: address, next }),
        });
        if (!res.ok) throw new Error("send failed");
        setSentTo(address);
        setCooldown(RESEND_COOLDOWN_S);
      } catch {
        setError("We couldn't send the link just now. Please try again.");
      }
    });
  };

  if (sentTo) {
    const waiting = cooldown > 0 || pending;
    return (
      <div className="rounded-card border border-line bg-white p-7">
        <h1 className="font-display text-[1.5rem] font-medium text-navy">Check your email</h1>
        <p className="mt-2 text-small text-muted">
          We sent a sign-in link to <span className="font-semibold text-ink">{sentTo}</span>. The
          link expires in 15 minutes.
        </p>
        {error && <p className="mt-3 text-caption text-navy">{error}</p>}
        <button
          type="button"
          onClick={() => send(sentTo)}
          disabled={waiting}
          aria-busy={pending}
          className={`mt-5 w-full ${waiting ? BTN_MUTED : BTN_ACTIVE}`}
        >
          {pending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setEmail("");
            setError("");
            setCooldown(0);
            // The field is the only thing to do on the screen they are going back to.
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="mt-4 block w-full text-center text-caption font-semibold text-navy underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !pending) send(email.trim());
      }}
      className="rounded-card border border-line bg-white p-7"
    >
      <h1 className="font-display text-[1.5rem] font-medium text-navy">Sign in</h1>
      <p className="mt-2 text-small text-muted">
        Enter your email and we&rsquo;ll send a sign-in link. No password needed.
      </p>
      <label htmlFor="email" className="mt-5 block text-caption font-semibold text-ink">
        Email
      </label>
      <input
        id="email"
        ref={inputRef}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-2 w-full rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      />
      {error && <p className="mt-3 text-caption text-navy">{error}</p>}
      <button
        type="submit"
        disabled={!valid || pending}
        aria-busy={pending}
        className={`mt-5 w-full ${valid ? BTN_ACTIVE : BTN_MUTED}`}
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
