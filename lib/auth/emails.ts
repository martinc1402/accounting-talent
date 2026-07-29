import "server-only";
import type { Composed } from "@/lib/email";

/*
  The two sign-in emails. Exactly one of them goes out for every submission of
  the sign-in form, and which one is the ONLY difference between a known and an
  unknown address — the page itself says the same thing either way (see
  app/api/auth/signin/route.ts). So neither email may imply anything about the
  other's existence, and neither may assume the reader is a candidate or an
  employer: one address, one sign-in, role resolved after the click.

  Plain text, matching the rest of the product's mail.
*/

export function emailSignInLink(vars: { link: string }): Composed {
  return {
    subject: "Your AccountingTalent.in sign-in link",
    text: `Hi there,

Here's your sign-in link:

${vars.link}

It expires in 15 minutes and can only be used once. If it has already expired, request a new one at accountingtalent.in/login.

If you didn't ask to sign in, you can ignore this email. Nobody can access your account without this link.

— AccountingTalent.in`,
  };
}

/*
  Sent when a link is NOT sent, for either reason: the address has no account, or
  it has one but sign-in is not open to it yet (lib/auth/allowlist.ts). It has to
  read as true in both cases and give away neither, which is why it never asserts
  that no account exists — 117 applicants on file would find that flatly wrong,
  and saying so would also leak exactly what the single shared email is for.
*/
export function emailNoAccount(): Composed {
  return {
    subject: "About your AccountingTalent.in sign-in request",
    text: `Hi there,

Someone asked for a sign-in link for this email address, and we weren't able to send one.

Sign-in is limited while we're still building out the platform, so it isn't open to everyone yet. If you've already applied, nothing is wrong with your application — we'll email you directly when there's something for you to do.

If you're an accounting professional and haven't applied yet: accountingtalent.in/apply. It's free, and it takes about five minutes.

If you're hiring: accountingtalent.in/employers — tell us who you need and we'll come back with a shortlist.

If this wasn't you, you can ignore this email. Nothing was created and nobody gained access to anything.

— AccountingTalent.in`,
  };
}
