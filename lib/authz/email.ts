/*
  Email normalization for the admin bootstrap comparison. Trim + lowercase only:
  enough to make the SUPER_ADMIN_EMAIL compare robust to casing/whitespace,
  without dropping dots or +tags (which would let a different address match).
*/
export function normalizeEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** True only when both sides normalize to the same NON-EMPTY address. An unset
 *  admin env must never match an empty/absent user email. */
export function emailsMatch(a?: string | null, b?: string | null): boolean {
  const na = normalizeEmail(a);
  const nb = normalizeEmail(b);
  return na.length > 0 && na === nb;
}
