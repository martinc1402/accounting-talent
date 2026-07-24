"use client";

import { useId, useState } from "react";

/*
  The candidate's assessment response, verbatim. Collapsed to ~8 lines with an
  accessible "Read full response" toggle (line-clamp, not a fixed pixel height, so
  text is never cut unpredictably). The full text is always in the DOM — screen
  readers get the whole thing; the toggle only changes what's visible. Paragraph
  breaks are preserved (whitespace-pre-line). Text is never edited.
*/
export function AssessmentResponse({
  text,
  attribution,
}: {
  text: string;
  attribution: string;
}) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <blockquote className="border-l-2 border-navy/25 pl-5 sm:pl-6">
      <p
        id={regionId}
        className={`max-w-[60ch] whitespace-pre-line text-body leading-relaxed text-ink ${
          open ? "" : "line-clamp-[8]"
        }`}
      >
        {text}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center text-caption font-semibold text-navy underline underline-offset-4 hover:text-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      >
        {open ? "Show less" : "Read full response"}
      </button>
      <footer className="mt-4 text-caption text-subtle">{attribution}</footer>
    </blockquote>
  );
}
