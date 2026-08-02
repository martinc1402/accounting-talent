/*
  "Is this a work address?" for the firm intake form.

  This is a qualification signal, not a spam control. The honeypot and the timing
  floor in lib/antispam.ts handle bots; this exists so the smoke test measures
  intent from actual firms rather than from anyone who typed an address. A lead
  from gmail.com is not malicious, it is just not the thing being measured, and
  telling that person plainly gets us the firm address instead of a lost lead.

  Deliberately short, and it should stay short. Every domain added here is a real
  small practice that gets turned away: plenty of two-person CPA firms genuinely
  run on a Gmail or AOL address, and a long list starts costing more leads than
  it filters. The same instinct is written into the signin regex in
  app/api/auth/signin/route.ts ("deliberately loose: this only rejects what could
  not possibly be an address"), and it applies harder here, where the cost of a
  false positive is a lost customer rather than a retry.

  Subdomains are matched too (mail.yahoo.co.uk), so the check is a suffix match on
  a domain boundary rather than equality. Country variants of the big four are
  covered by their own entries rather than by pattern matching, because "anything
  starting with yahoo." would also reject a real firm called yahoofinancialgroup.
*/

const FREE_PROVIDERS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "rediffmail.com",
];

/*
  True when the address is on a consumer mailbox provider.

  Returns false for anything that is not a parseable address: this function
  answers one narrow question, and "is it a valid email at all" is already
  answered by the zod check that runs alongside it. Returning true here for
  garbage input would surface the wrong error message ("use your firm address"
  for something that is not an address).
*/
export function isFreeEmailProvider(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1 || at === email.length - 1) return false;

  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain) return false;

  return FREE_PROVIDERS.some(
    (provider) => domain === provider || domain.endsWith(`.${provider}`),
  );
}
