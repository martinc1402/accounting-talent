"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { firms } from "@/content/firms";
import { trackCta } from "@/lib/analytics";

/*
  Mobile-only (<768px) sticky CTA bar. Fixed to the bottom, dismissible, and hidden
  whenever the #get-matched brief is on screen, since a bar pointing at a form the
  reader is already looking at is just noise. Visibility is driven by an
  IntersectionObserver on #get-matched (the effect+cleanup pattern
  components/faq/FaqDeepLinks.tsx uses); the setState lives in the observer
  callback (an external event), not the effect body. Sits below the sticky header
  (z-30). Dismissal lasts for the current view.
*/
export function StickyCtaBar() {
  const [dismissed, setDismissed] = useState(false);
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById("get-matched");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (dismissed || formInView) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(19,31,91,0.18)] md:hidden">
      <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3">
        <p className="text-small font-medium text-ink">
          {firms.stickyBar.label}
        </p>
        <div className="flex items-center gap-1">
          <a
            href="#get-matched"
            onClick={() => trackCta("sticky")}
            className="rounded-full bg-navy px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-navy-deep active:translate-y-px"
          >
            {firms.stickyBar.cta}
          </a>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-mist hover:text-navy"
          >
            <X size={18} weight="light" />
          </button>
        </div>
      </div>
    </div>
  );
}
