/*
  The reassurance line under a button CTA.

  Was TrustRow, which read its own string straight out of content/firms.ts and so
  could only ever say the firm-side sentence. Both pages need this now and they
  need to say different things, so the caller passes the text.
*/
export function TrustLine({
  text,
  tone = "muted",
}: {
  text: string;
  tone?: "muted" | "inverse";
}) {
  return (
    <p
      className={`text-caption ${tone === "inverse" ? "text-white/65" : "text-subtle"}`}
    >
      {text}
    </p>
  );
}
