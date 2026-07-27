/*
  A human-readable "who sees what" summary derived from the SAME predicates the
  projection uses (canSeeIdentity / canSeeVerifiedEmployerFields). The candidate
  explainer table and any copy read from here, so the prose can never drift from
  the actual disclosure rules in projectProfileView.
*/
import { canSeeIdentity, canSeeVerifiedEmployerFields } from "./visibility";
import type { VisibilityLevel } from "./types";

export type DisclosureRow = { key: "name" | "photo" | "employer" | "contact"; label: string; value: string };

export function disclosureRows(level: VisibilityLevel): DisclosureRow[] {
  const identity = canSeeIdentity(level); // full name + contact
  const verified = canSeeVerifiedEmployerFields(level); // photo, exact city, etc.
  const isAdmin = level === "admin";
  return [
    { key: "name", label: "Name", value: identity ? "Full name" : "First name + last initial" },
    {
      key: "photo",
      label: "Photo",
      value: identity ? "Full photo" : verified ? "Blurred until introduction" : "Hidden",
    },
    // Employer names are withheld from everyone except AccountingTalent (admin) —
    // only the firm type is shown, even after an accepted introduction.
    { key: "employer", label: "Employer names", value: isAdmin ? "Shown" : "Withheld (firm type only)" },
    { key: "contact", label: "Contact details", value: identity ? "Shared" : "Hidden" },
  ];
}
