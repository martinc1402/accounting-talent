"use client";

import { useState, useTransition } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser";

/*
  Passwordless sign-in: enter email, receive a magic link. No password is ever
  collected or stored. The link returns to /auth/callback which exchanges the code
  for a session and upserts the profile.
*/
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      try {
        const client = createAuthBrowserClient();
        const { error } = await client.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setError(error.message);
        else setSent(true);
      } catch {
        setError("Sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.");
      }
    });
  };

  if (sent) {
    return (
      <div className="rounded-card border border-line bg-white p-7">
        <h1 className="font-display text-[1.5rem] font-medium text-navy">Check your email</h1>
        <p className="mt-2 text-small text-muted">
          We sent a sign-in link to <span className="font-semibold text-ink">{email}</span>. Open it
          on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-line bg-white p-7">
      <h1 className="font-display text-[1.5rem] font-medium text-navy">Employer sign in</h1>
      <p className="mt-2 text-small text-muted">
        Enter your work email and we&rsquo;ll send a sign-in link. No password needed.
      </p>
      <label htmlFor="email" className="mt-5 block text-caption font-semibold text-ink">
        Work email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@firm.com"
        className="mt-2 w-full rounded-card border border-line px-3.5 py-3 text-small text-ink outline-none focus:border-navy focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      />
      {error && <p className="mt-3 text-caption text-navy">{error}</p>}
      <button
        type="submit"
        disabled={pending || !email.trim()}
        className="mt-5 w-full rounded-card bg-navy px-5 py-3 text-small font-semibold text-paper transition hover:bg-navy-deep active:translate-y-px disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      >
        {pending ? "Sending link." : "Send sign-in link"}
      </button>
    </form>
  );
}
