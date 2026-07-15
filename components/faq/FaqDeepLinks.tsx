"use client";

import { useEffect } from "react";

/*
  Progressive enhancement for the /faq accordions. The Accordion itself stays a
  native, zero-JS <details> list; this component only runs on /faq and reaches
  into the already-rendered DOM, so the homepage and employer accordions (which
  do not render it) keep shipping no JavaScript.

  It does three things:
  - on load, and whenever the hash changes, open the <details> whose id matches
    the URL hash and scroll it into view (scroll-mt on the element handles the
    sticky-header offset);
  - when any item is opened, reflect its id in the URL hash so the view is
    linkable, using replaceState so a session of opening and closing accordions
    does not fill the back button with entries.

  Without this component the page still works: the accordions open on click and a
  #hash still scrolls to the item, just without auto-opening it.
*/
export function FaqDeepLinks() {
  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[id]"),
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

    const onToggle = (event: Event) => {
      const el = event.target as HTMLDetailsElement;
      if (el.open && el.id) {
        // replaceState, not location.hash = / pushState: linkable without adding
        // a history entry on every toggle.
        window.history.replaceState(null, "", `#${el.id}`);
      }
    };

    items.forEach((el) => el.addEventListener("toggle", onToggle));
    window.addEventListener("hashchange", openFromHash);
    openFromHash();

    return () => {
      items.forEach((el) => el.removeEventListener("toggle", onToggle));
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  return null;
}
