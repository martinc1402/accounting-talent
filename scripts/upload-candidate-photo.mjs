/*
  Upload a candidate profile photo into the PRIVATE `candidate-photos` bucket and
  point applications.photo_url at the object key. The photo is never public: the
  authorizing endpoint (app/api/candidates/[id]/photo) mints a short-lived signed
  URL per request, and only for viewers allowed to see it (verified employers, or
  the candidate's own public-photo consent).

  Usage:
    node --env-file=.env.local scripts/upload-candidate-photo.mjs --id=<uuid> --file=./sai-profile-image.png [--focal="center 20%"]
*/
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { extname, basename } from "node:path";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const id = arg("id");
const file = arg("file");
const focal = arg("focal");
if (!id || !file) {
  console.error("Usage: --id=<uuid> --file=<path> [--focal=\"center 20%\"]");
  process.exit(1);
}

const BUCKET = "candidate-photos";
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1. Ensure the private bucket exists.
const { data: buckets } = await db.storage.listBuckets();
if (!buckets?.some((b) => b.name === BUCKET)) {
  const { error } = await db.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) {
    console.error("createBucket failed:", error.message);
    process.exit(1);
  }
  console.log(`Created private bucket '${BUCKET}'.`);
}

// 2. Upload under a per-candidate key (overwrite on re-run).
const ext = (extname(file) || ".png").toLowerCase();
const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";
const key = `${id}${ext}`;
const body = readFileSync(file);
const { error: upErr } = await db.storage.from(BUCKET).upload(key, body, { contentType, upsert: true });
if (upErr) {
  console.error("upload failed:", upErr.message);
  process.exit(1);
}
console.log(`Uploaded ${basename(file)} -> ${BUCKET}/${key} (${body.length} bytes, ${contentType}).`);

// Pre-blurred derivative for non-identity viewers. Downscaled hard THEN blurred so
// the stored bytes carry no recoverable facial detail (secure frost, not CSS-only).
// Same derivation the photo route uses (frostedObjectKey), so both agree.
const frostedKey = key.replace(/(\.[^.]+)$/, "-frosted$1");
const frosted = await sharp(body).resize(40).blur(6).png().toBuffer();
const { error: fErr } = await db.storage
  .from(BUCKET)
  .upload(frostedKey, frosted, { contentType: "image/png", upsert: true });
if (fErr) {
  console.error("frosted upload failed:", fErr.message);
  process.exit(1);
}
console.log(`Frosted derivative -> ${BUCKET}/${frostedKey} (${frosted.length} bytes).`);

// 3. Point the row at the object key (NOT a public URL). Optional focal point.
const patch = { photo_url: key };
if (focal) patch.photo_focal = focal;
const { error: updErr } = await db.from("applications").update(patch).eq("id", id);
if (updErr) {
  console.error("row update failed:", updErr.message);
  process.exit(1);
}

await db.from("admin_actions").insert({
  action: "candidate_photo_uploaded",
  application_id: id,
  detail: `key=${key} bucket=${BUCKET}`,
  actor: process.env.SUPER_ADMIN_EMAIL || "admin-script",
});

console.log(`photo_url set to '${key}'${focal ? `, photo_focal '${focal}'` : ""}. Served via /api/candidates/${id}/photo.`);
