"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

/*
  One desktop nav group: a disclosure button and the panel of links it controls.

  This is the ONLY client component in the header, and it exists because correct
  disclosure semantics need state: aria-expanded has to reflect something, Escape
  has to restore focus, and arrow keys have to move it. The header shell, the
  logo, the CTA and the entire mobile menu stay server-rendered in Nav.tsx. Same
  isolation pattern as components/firms/Cta.tsx.

  The trigger is a <button>, not a <link>, and that is the load-bearing decision.
  A link that navigates on click cannot also be the control that reveals the
  panel: on a touch device the first tap fires the navigation before the reader
  has seen the menu. The landing page is reached through the "Overview" row
  instead, which is why that row is not a redundant duplicate of the label.

  Deliberately NOT role="menu". These are navigation links, not application menu
  commands. role="menu" makes assistive tech promise full menu semantics (type-
  ahead, a single tab stop, Home/End) that we would then owe the user. A <ul> of
  links inside a labelled disclosure is the honest markup, and arrow keys are
  offered on top as a convenience rather than as a contract.

  Hover still opens the panel on desktop, because a nav that only responds to
  clicks feels broken to a mouse user who is used to hovering. Hover and the
  button state share one `open` flag, so the two cannot disagree.

  Rows are set in the sans, not the display serif, and that was tested both ways
  at 15px rather than assumed. The serif echoes the wordmark but loses on three
  counts: Newsreader thins out badly at 15px on the cream, the trigger labels
  above it are sans so a serif panel mixes two families inside one menu, and this
  site's rule is that the serif is display-only while anything functional is set
  in Geist. The wordmark being a serif does not make the navigation content.
*/

type NavItem = { readonly label: string; readonly href: string };

export function NavGroup({
  label,
  items,
  isActive,
}: {
  label: string;
  items: readonly NavItem[];
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  /*
    Close on outside click and on Escape from anywhere in the document. Both live
    on one effect with one cleanup, the same effect+cleanup shape StickyCtaBar
    uses for its IntersectionObserver. The listeners are only attached while the
    panel is open, so a closed nav costs nothing.

    Escape is handled here rather than only on the panel because focus can be
    inside the panel, on the trigger, or (after a mouse-open) nowhere near either.
  */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Only pull focus back if it is currently inside this group. Escape with
      // focus elsewhere should close the panel without yanking the caret.
      if (wrapRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Opening by keyboard should land focus in the panel; opening by hover or
  // click should not steal it. So focus moves only when asked for explicitly.
  const openAndFocus = (index: number) => {
    setOpen(true);
    // The panel is rendered but visibility:hidden while closed, so focus has to
    // wait for the state flush that makes it focusable.
    requestAnimationFrame(() => {
      const list = itemRefs.current.filter(Boolean);
      const target = index < 0 ? list[list.length - 1] : list[index];
      target?.focus();
    });
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openAndFocus(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAndFocus(-1);
    }
  };

  const onItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    const list = itemRefs.current.filter(Boolean);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (e.key === "Tab" && !e.shiftKey && index === list.length - 1) {
      // Tabbing off the last row leaves the group, so the panel should not stay
      // open behind the reader. Not prevented: the Tab itself must still work.
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`relative flex cursor-pointer items-center gap-1 rounded-card px-2.5 py-1.5 text-[16px] transition-colors ${
          open || isActive ? "text-navy" : "text-muted hover:text-navy"
        } ${open ? "bg-mist" : ""}`}
      >
        {label}
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden
          className={`mt-px transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {/*
          One signal at a time. The ledger rule marks the current section, the
          tint marks the open one, and an item never wears both: opening the
          section you are already in swaps the underline for the tint rather
          than stacking them.
        */}
        {isActive && !open && (
          <span className="absolute -bottom-0.5 left-2.5 h-px w-[calc(100%-1.25rem)] bg-navy/30" />
        )}
      </button>

      {/*
        left-2.5 matches the trigger's own px-2.5, so the panel's left edge lines
        up with the first letter of the WORD rather than with the button box the
        open-state tint is painted on. Aligning to the box instead leaves the
        panel hanging 10px to the left, which is what it is supposed to fix.

        pt-2 on the wrapper, not the panel: the gap between the trigger and the
        card has to be inside the hovered element or the menu closes as the
        pointer crosses it.
      */}
      <div
        id={panelId}
        className={`absolute left-2.5 top-full z-50 pt-2 transition-opacity duration-150 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/*
          The site's own vocabulary rather than the mobile menu's: cream surface,
          navy hairline, square corners, no elevation. A hairline on paper over a
          white page separates cleanly enough that a drop shadow would only add
          weight the rest of the site does not carry.
        */}
        <ul className="w-52 border border-navy/15 bg-paper p-1">
          {items.map((item, i) => (
            <li key={item.href + item.label}>
              <Link
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={item.href}
                tabIndex={open ? undefined : -1}
                onKeyDown={(e) => onItemKeyDown(e, i)}
                onClick={() => setOpen(false)}
                className="block px-3 py-1.5 text-[15px] leading-[1.3] text-muted transition-colors hover:bg-navy/5 hover:text-navy"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
