import "server-only";

/*
  Resolve the caller into a Viewer. Reads the VERIFIED auth user (getUser, which
  re-validates the token) via the anon auth client, then service-role-loads their
  profile + employer membership/account. Admin is derived ONLY from the verified
  session email matching SUPER_ADMIN_EMAIL — never from request-supplied data or
  editable user metadata. Any error resolves to anonymous (default-deny).
*/
import { getAuthUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import { emailsMatch } from "./email";
import type {
  EmployerAccount,
  MemberRole,
  PlanName,
  VerificationState,
  Viewer,
} from "./types";

function mapAccount(row: Record<string, unknown>): EmployerAccount {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    verificationState: (row.verification_state as VerificationState) ?? "unverified",
    plan: (row.plan as PlanName) ?? "free",
    entitlements: (row.entitlements as Record<string, unknown> | null) ?? null,
  };
}

export async function getViewer(): Promise<Viewer> {
  try {
    const user = await getAuthUser();
    if (!user) return { kind: "anonymous" };

    // Admin: verified email must equal the configured super-admin email.
    const isAdmin =
      !!user.emailConfirmedAt && emailsMatch(user.email, process.env.SUPER_ADMIN_EMAIL);

    let account: EmployerAccount | null = null;
    let memberRole: MemberRole | null = null;

    if (supabase) {
      // First membership wins (single-account model today; owner/member ready).
      const { data } = await supabase
        .from("employer_members")
        .select("member_role, employer_accounts(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const accountRow = (data as { employer_accounts?: Record<string, unknown> } | null)
        ?.employer_accounts;
      if (accountRow) {
        account = mapAccount(accountRow);
        memberRole = ((data as { member_role?: MemberRole }).member_role ?? "owner") as MemberRole;
      }
    }

    return { kind: "user", userId: user.id, email: user.email, isAdmin, account, memberRole };
  } catch {
    return { kind: "anonymous" };
  }
}
