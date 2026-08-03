"use client";

import { useEffect } from "react";
import { trackFaqOpened } from "@/lib/analytics";

/*
  Progressive enhancement for the FAQ accordions. The Accordion itself stays a
  native, zero-JS <details> list; this component reaches into the already-rendered
  DOM, so the accordion keeps working with JavaScript blocked and keeps rendering
  on the server.

  It does two jobs, independently switchable:

  - syncHash (used on /faq): open the <details> whose id matches the URL hash and
    scroll it into view, and reflect the open item's id back into the hash so a
    view is linkable. replaceState, not pushState, so a session of opening and
    closing accordions does not fill the back button.

  - trackOpens (used on / and /accountants): fire faq_opened once per item per
    page view.

  WHY THIS RATHER THAN onToggle INSIDE Accordion. Putting the handler on the
  <details> would force "use client" onto Accordion, which would pull the
  accordion markup and its Phosphor icon import into the client bundle on all
  three routes that render it, and would break the "works before hydration"
  property the component was built for. Attaching listeners from a leaf costs
  about a kilobyte and changes none of that.

  Without this component both pages still work: accordions open on click and a
  #hash still scrolls to the item, just without auto-opening it.
*/
export function FaqDeepLinks({
  syncHash = true,
  trackOpens = false,
}: {
  syncHash?: boolean;
  trackOpens?: boolean;
} = {}) {
  useEffect(() => {
    /*
      Scoped to details[id] inside a .faq-accordion container, not every
      details[id] on the page. Nav.tsx renders a <details> for the mobile menu;
      it happens to carry no id today, so a bare document-wide query is safe by
      accident. Relying on that accident is how the next <details> added to a
      layout starts firing FAQ analytics.
    */
    const items = Array.from(
      document.querySelectorAll<HTMLDetailsElement>(".faq-accordion details[id]"),
    );
    if (items.length === 0) return;

    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement && items.includes(el)) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };

    // Once per item per page view. Without this, open/close/open counts three
    // opens for one moment of interest and the number stops meaning anything.
    const counted = new Set<string>();

    const onToggle = (event: Event) => {
      const el = event.target as HTMLDetailsElement;
      if (!el.open || !el.id) return;

      if (syncHash) {
        window.history.replaceState(null, "", `#${el.id}`);
      }
      if (trackOpens && !counted.has(el.id)) {
        counted.add(el.id);
        trackFaqOpened(el.id);
      }
    };

    items.forEach((el) => el.addEventListener("toggle", onToggle));
    if (syncHash) {
      window.addEventListener("hashchange", openFromHash);
      openFromHash();
    }

    return () => {
      items.forEach((el) => el.removeEventListener("toggle", onToggle));
      if (syncHash) window.removeEventListener("hashchange", openFromHash);
    };
  }, [syncHash, trackOpens]);

  return null;
}
