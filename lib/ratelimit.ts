import "server-only";
import { createHash } from "node:crypto";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/*
  Per-IP rate limiting for the public form actions, backed by Supabase so the
  count is shared across every serverless instance (an in-memory counter would
  only hold within one warm instance).

  The raw IP never leaves this function: it is hashed with a constant salt and
  only the hash is stored or compared. The salt is privacy hygiene, not a secret
  — it just stops a stored hash from being reversed against the small space of
  IPv4 addresses with a plain rainbow table.

  Fail-open is deliberate and load-bearing: if Supabase is not configured, the
  table does not exist yet, or any query errors, a real submission must still go
  through. A spam guard that takes the form down on a database hiccup is worse
  than the spam.
*/

const SALT = "accountingtalent-ratelimit-v1";

const hashIp = (ip: string): string =>
  createHash("sha256").update(SALT + ip).digest("hex");

export async function isRateLimited(
  bucket: "apply" | "waitlist" | "assessment_submit" | "admin",
  ip: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<{ limited: boolean; ipHash: string }> {
  const ipHash = hashIp(ip);

  if (!supabaseConfigured || !supabase) {
    return { limited: false, ipHash };
  }

  const since = new Date(Date.now() - windowMs).toISOString();

  try {
    const { count, error } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket", bucket)
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (error) {
      console.error("[ratelimit] count failed, failing open", error.message);
      return { limited: false, ipHash };
    }

    if ((count ?? 0) >= limit) {
      return { limited: true, ipHash };
    }

    // Allowed: record this attempt, and opportunistically drop this key's rows
    // that have aged out of the window so the table does not accumulate.
    await supabase.from("rate_limit_hits").insert({ bucket, ip_hash: ipHash });
    await supabase
      .from("rate_limit_hits")
      .delete()
      .eq("bucket", bucket)
      .eq("ip_hash", ipHash)
      .lt("created_at", since);

    return { limited: false, ipHash };
  } catch (e) {
    console.error("[ratelimit] threw, failing open", e);
    return { limited: false, ipHash };
  }
}
