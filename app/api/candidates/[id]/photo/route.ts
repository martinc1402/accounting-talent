import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getViewer } from "@/lib/authz/viewer";
import { deriveVisibility, canViewPhoto } from "@/lib/authz/visibility";
import { getViewerIntroduction } from "@/lib/authz/introductionsRepo";

/*
  Authorized candidate photo. The raw storage URL is never emitted to the client;
  the profile points <img> at this endpoint, which authorizes per request. Photo
  requires a verified employer (free+) OR the candidate opting the photo public.
  Denied viewers get an indistinguishable 404 (no existence signal, no leak). A
  real private bucket plugs in where we currently redirect: mint a short-lived
  signed URL instead of the stored path.
*/
export const dynamic = "force-dynamic";

function deny() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!supabase) return deny();

  const { data } = await supabase
    .from("applications")
    .select("photo_url, public_photo, verified_at")
    .eq("id", id)
    .maybeSingle();
  const app = data as
    | { photo_url: string | null; public_photo: boolean | null; verified_at: string | null }
    | null;
  if (!app || !app.verified_at || !app.photo_url) return deny();

  const viewer = await getViewer();
  const accountId = viewer.kind === "user" ? viewer.account?.id ?? null : null;
  const introduction = await getViewerIntroduction(id, accountId);
  const { level } = deriveVisibility(viewer, introduction);

  if (!canViewPhoto(level, app.public_photo === true)) return deny();

  // TODO: swap for a short-lived signed URL from private storage.
  const res = NextResponse.redirect(new URL(app.photo_url, request.url), 302);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
