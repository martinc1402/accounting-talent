"use client";

import { useEffect, useId, useRef, useState } from "react";

/*
  The candidate's assessment response, verbatim. Source samples use inconsistent
  newline conventions (none / single \n / double \n\n between paragraphs), so we
  split on any run of newlines and render each block as its own <p> — spacing is
  then uniform for every candidate instead of cramped-or-gappy pre-line output.
  Words are never edited; we only re-flow whitespace that was already whitespace.

  Collapsed to a fixed height with a soft fade + "Read full response" toggle. The
  toggle/fade appear ONLY when the text actually overflows (measured after mount),
  so short samples don't get a pointless control. The full text is always in the
  DOM — screen readers get everything; the toggle only changes what's visible.
*/
export function AssessmentResponse({
  text,
  attribution,
}: {
  text: string;
  attribution: string;
}) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const regionId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);

  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) setOverflows(el.scrollHeight - el.clientHeight > 4);
  }, [text]);

  return (
    <blockquote className="border-l-2 border-navy/25 pl-5 sm:pl-6">
      <div className="relative">
        <div
          id={regionId}
          ref={bodyRef}
          className={`max-w-[60ch] space-y-3.5 overflow-hidden text-body leading-relaxed text-ink ${
            open ? "" : "max-h-56"
          }`}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {!open && overflows && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>
      {(overflows || open) && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
          className="mt-3 inline-flex items-center text-caption font-semibold text-navy underline underline-offset-4 hover:text-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          {open ? "Show less" : "Read full response"}
        </button>
      )}
      <footer className="mt-4 text-caption text-subtle">{attribution}</footer>
    </blockquote>
  );
}
