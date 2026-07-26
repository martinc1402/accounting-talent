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

// Private storage bucket holding candidate photos; served only via signed URLs.
const CANDIDATE_PHOTO_BUCKET = "candidate-photos";
const SIGNED_URL_TTL_SECONDS = 60;

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

  // Resolve photo_url to a concrete target to redirect the <img> at:
  //  - a private-bucket object key -> a short-lived signed URL (never public);
  //  - a legacy absolute URL or /public path -> used as-is (back-compat).
  const stored = app.photo_url;
  let target: string;
  if (/^https?:\/\//i.test(stored) || stored.startsWith("/")) {
    target = new URL(stored, request.url).toString();
  } else {
    const { data: signed } = await supabase.storage
      .from(CANDIDATE_PHOTO_BUCKET)
      .createSignedUrl(stored, SIGNED_URL_TTL_SECONDS);
    if (!signed?.signedUrl) return deny();
    target = signed.signedUrl;
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
