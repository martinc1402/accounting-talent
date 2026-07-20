import { firms } from "@/content/firms";

/*
  The reassurance line under every button CTA: "Free to join · No card · One email
  a month." Tone switches for the navy final band.
*/
export function TrustRow({ tone = "muted" }: { tone?: "muted" | "inverse" }) {
  return (
    <p
      className={`text-caption ${tone === "inverse" ? "text-white/65" : "text-subtle"}`}
    >
      {firms.trustRow}
    </p>
  );
}
