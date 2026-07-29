import "server-only";

/*
  Reads for the employer shortlist (saved_candidates). Writes go through the
  server actions. Scoped to an employer account so one firm never sees another's
  saved list.
*/
import { supabase } from "@/lib/supabase";

/** Whether a candidate is saved by an employer account. */
export async function isCandidateSaved(
  employerAccountId: string | null,
  applicationId: string,
): Promise<boolean> {
  if (!supabase || !employerAccountId) return false;
  const { data } = await supabase
    .from("saved_candidates")
    .select("id")
    .eq("employer_account_id", employerAccountId)
    .eq("application_id", applicationId)
    .maybeSingle();
  return !!data;
}

/** The application ids an employer account has saved, newest first. */
export async function listSavedApplicationIds(employerAccountId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("saved_candidates")
    .select("application_id")
    .eq("employer_account_id", employerAccountId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => (r as { application_id: string }).application_id);
}
