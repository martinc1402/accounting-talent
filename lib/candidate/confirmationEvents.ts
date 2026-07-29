import "server-only";
import { supabase } from "@/lib/supabase";

/*
  Emits a `section_confirmation_expired` event when a candidate's section
  confirmation lapses past its expiry. Notification DELIVERY (email/WhatsApp) is out
  of scope — this only records the event to the append-only admin_actions log so a
  future nudge system (cron/worker) has something to subscribe to.

  Deduped on (application, section, confirmed_at): the same lapse is recorded once,
  not on every dashboard render. Best-effort — never throws into the request path.
*/
export async function emitSectionConfirmationExpired(
  applicationId: string,
  section: string,
  confirmedAt: string,
): Promise<void> {
  if (!supabase) return;
  const detail = `section=${section};confirmed_at=${confirmedAt}`;
  try {
    const { data: existing } = await supabase
      .from("admin_actions")
      .select("id")
      .eq("action", "section_confirmation_expired")
      .eq("application_id", applicationId)
      .eq("detail", detail)
      .limit(1)
      .maybeSingle();
    if (existing) return;
    await supabase.from("admin_actions").insert({
      action: "section_confirmation_expired",
      application_id: applicationId,
      detail,
      actor: "system",
    });
  } catch {
    // A lapsed-confirmation event is best-effort telemetry; never break the page.
  }
}
