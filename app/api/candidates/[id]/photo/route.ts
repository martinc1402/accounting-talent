import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getViewer } from "@/lib/authz/viewer";
import { deriveVisibility, canViewPhoto, canSeeIdentity, isApplicationOwner } from "@/lib/authz/visibility";
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

// Pre-blurred derivative key: "<id>.png" -> "<id>-frosted.png". Non-identity
// viewers get these bytes so the clear face never reaches the client.
const frostedObjectKey = (key: string) => key.replace(/(\.[^./]+)$/, "-frosted$1");

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
    .select("photo_url, verified_at, user_id")
    .eq("id", id)
    .maybeSingle();
  const app = data as
    | { photo_url: string | null; verified_at: string | null; user_id: string | null }
    | null;
  if (!app || !app.photo_url) return deny();

  const viewer = await getViewer();
  const owner = isApplicationOwner(viewer, app);
  const accountId = viewer.kind === "user" ? viewer.account?.id ?? null : null;
  const introduction = await getViewerIntroduction(id, accountId);
  const { level } = deriveVisibility(viewer, introduction);

  // Access rule: owner / admin / accepted-introduction / verified employer may
  // receive photo bytes. public_photo is NOT a factor — a photo is never public.
  // The owner may always see their OWN photo (e.g. on the dashboard) even before
  // the profile is verified; everyone else needs a verified profile first.
  if (!owner) {
    if (!app.verified_at) return deny();
    if (!canViewPhoto(level)) return deny();
  }

  // Resolve photo_url to a concrete target to redirect the <img> at:
  //  - a private-bucket object key -> a short-lived signed URL (never public);
  //  - a legacy absolute URL or /public path -> used as-is (back-compat).
  // CLEAR only for owner / accepted-introduction / admin; verified employers get
  // the frosted derivative.
  const clear = owner || canSeeIdentity(level);
  const stored = app.photo_url;
  let target: string;
  if (/^https?:\/\//i.test(stored) || stored.startsWith("/")) {
    target = new URL(stored, request.url).toString();
  } else {
    const key = clear ? stored : frostedObjectKey(stored);
    const { data: signed } = await supabase.storage
      .from(CANDIDATE_PHOTO_BUCKET)
      .createSignedUrl(key, SIGNED_URL_TTL_SECONDS);
    if (!signed?.signedUrl) return deny();
    target = signed.signedUrl;
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
