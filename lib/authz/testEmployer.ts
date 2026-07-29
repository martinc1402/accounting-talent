import "server-only";

/*
  Loads the LOCAL_TEST_EMPLOYER_EMAIL account for the admin-only dev plan toggle.
  Admin-gated at the call site; this only reads. Resolves via the profiles.email
  column (populated on sign-in) rather than the auth admin API.
*/
import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "./email";
import type { PlanName, VerificationState } from "./types";

export type LocalTestEmployer = {
  email: string;
  accountId: string;
  name: string;
  plan: PlanName;
  verificationState: VerificationState;
};

export async function getLocalTestEmployer(): Promise<LocalTestEmployer | null> {
  const email = normalizeEmail(process.env.LOCAL_TEST_EMPLOYER_EMAIL);
  if (!email || !supabase) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  if (!prof) return null;

  const { data: mem } = await supabase
    .from("employer_members")
    .select("employer_accounts(id, name, plan, verification_state)")
    .eq("user_id", (prof as { user_id: string }).user_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const acct = (mem as { employer_accounts?: Record<string, unknown> } | null)?.employer_accounts;
  if (!acct) return null;

  return {
    email,
    accountId: String(acct.id),
    name: String(acct.name ?? ""),
    plan: (acct.plan as PlanName) ?? "free",
    verificationState: (acct.verification_state as VerificationState) ?? "unverified",
  };
}
