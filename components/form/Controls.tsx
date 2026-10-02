"use client";

import { useMemo, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { CITY_NAMES, FEATURED_CITIES, stateForCity } from "@/content/cities";

/*
  Every control here follows the same rules: label above (never a placeholder
  standing in for a label), helper text below the label, error text below the
  control. Tap targets are at least 52px tall, because this form is going to be
  filled in on a phone with a thumb.
*/

const fieldBase =
  "w-full rounded-card border bg-white px-4 py-3.5 text-body text-ink placeholder:text-subtle/70 transition-colors focus:border-navy focus:outline-none";

export function TextField({
  id,
  type = "text",
  value,
  placeholder,
  invalid,
  onChange,
  onEnter,
}: {
  id: string;
  type?: string;
  value: string;
  placeholder?: string;
  invalid?: boolean;
  onChange: (v: string) => void;
  onEnter?: () => void;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={AUTOCOMPLETE[id] ?? "off"}
      inputMode={type === "tel" ? "tel" : type === "email" ? "email" : "text"}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      className={`${fieldBase} ${
        invalid ? "border-red-700" : "border-line hover:border-navy/40"
      }`}
    />
  );
}

const AUTOCOMPLETE: Record<string, string> = {
  full_name: "name",
  email: "email",
  whatsapp: "tel",
  city: "address-level2",
};

/** Multi-line free text. Same field styling as TextField, taller and resizable
 *  vertically only. Used by the employer brief's "Anything else?" field. */
export function TextAreaField({
  id,
  value,
  placeholder,
  rows = 4,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldBase} resize-y ${
        invalid ? "border-red-700" : "border-line hover:border-navy/40"
      }`}
    />
  );
}

/** Single select. Tapping an option advances the form, which is what keeps 19
 *  screens inside the promised three minutes. */
export function SelectField({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} className="grid gap-2.5">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`flex w-full items-center gap-3 rounded-card border px-4 py-4 text-left text-body transition-all active:translate-y-px ${
              selected
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-ink hover:border-navy/40 hover:bg-mist"
            }`}
          >
            <span
              aria-hidden
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-white bg-white" : "border-line"
              }`}
            >
              {selected && <span className="size-2 rounded-full bg-navy" />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** Multi select and the home-setup gate share this control. */
export function MultiField({
  name,
  options,
  values,
  onChange,
}: {
  name: string;
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      values.includes(opt)
        ? values.filter((v) => v !== opt)
        : [...values, opt],
    );
  };

  return (
    <div role="group" aria-labelledby={`${name}-label`} className="grid gap-2.5">
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => toggle(opt)}
            className={`flex w-full items-center gap-3 rounded-card border px-4 py-4 text-left text-body transition-all active:translate-y-px ${
              selected
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-ink hover:border-navy/40 hover:bg-mist"
            }`}
          >
            <span
              aria-hidden
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
                selected ? "border-white bg-white" : "border-line"
              }`}
            >
              {selected && <Check size={13} weight="bold" className="text-navy" />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** Compact single-choice dropdown. The pill SelectField advances a one-question
 *  wizard; this is for a multi-field form on a single page, where five stacked
 *  radio groups would be a wall. Native <select> for keyboard and mobile
 *  behaviour, styled to match the text fields. */
export function SelectMenu({
  id,
  value,
  placeholder = "Select one",
  options,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  options: readonly string[];
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldBase} cursor-pointer appearance-none pr-11 ${
          value ? "text-ink" : "text-subtle/70"
        } ${invalid ? "border-red-700" : "border-line hover:border-navy/40"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-ink">
            {opt}
          </option>
        ))}
      </select>
      <CaretDown
        aria-hidden
        size={16}
        weight="bold"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-subtle"
      />
    </div>
  );
}

/** Multi-select as wrapping toggle chips. Compact where MultiField's stacked
 *  full-width buttons would be too tall (the employer brief's software and
 *  work-type pickers). */
export function ChipMultiField({
  name,
  options,
  values,
  onChange,
}: {
  name: string;
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(
      values.includes(opt)
        ? values.filter((v) => v !== opt)
        : [...values, opt],
    );

  return (
    <div
      role="group"
      aria-labelledby={`${name}-label`}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => toggle(opt)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-small transition-all active:translate-y-px ${
              selected
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-muted hover:border-navy/40 hover:bg-mist"
            }`}
          >
            {selected && <Check size={13} weight="bold" aria-hidden />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** Q4. Searchable city list that derives the state automatically. */
export function CityField({
  id,
  value,
  placeholder,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURED_CITIES.slice(0, 8);
    // Rank prefix matches above mid-string matches so "kolh" surfaces Kolhapur
    // rather than burying it in the long list.
    const starts: string[] = [];
    const contains: string[] = [];
    for (const c of CITY_NAMES) {
      const lc = c.toLowerCase();
      if (lc.startsWith(q)) starts.push(c);
      else if (lc.includes(q)) contains.push(c);
    }
    return [...starts, ...contains].slice(0, 8);
  }, [query]);

  const state = stateForCity(value);

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={`${fieldBase} ${
          invalid ? "border-red-700" : "border-line hover:border-navy/40"
        }`}
      />

      {state && !open && (
        <p className="mt-2 text-caption text-subtle">{state}</p>
      )}

      <ul
        id={`${id}-listbox`}
        role="listbox"
        hidden={!open}
        className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-card border border-line bg-white py-1 shadow-[0_16px_40px_-12px_rgba(19,31,91,0.18)]"
      >
        {matches.map((city) => (
          <li key={city} role="option" aria-selected={value === city}>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(city);
                setQuery(city);
                setOpen(false);
              }}
              className="flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left text-body text-ink transition-colors hover:bg-mist"
            >
              {city}
              <span className="text-caption text-subtle">
                {stateForCity(city)}
              </span>
            </button>
          </li>
        ))}

        {/* A tier-3 applicant must never be blocked by a missing city. */}
        <li role="option" aria-selected={false}>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const typed = query.trim();
              if (!typed) return;
              onChange(typed);
              setOpen(false);
            }}
            className="w-full border-t border-line px-4 py-3 text-left text-small text-navy transition-colors hover:bg-mist"
          >
            {query.trim()
              ? `Use "${query.trim()}"`
              : "Type to search for your city"}
          </button>
        </li>
      </ul>
    </div>
  );
}

/** Q19. A single consent statement that must be agreed to. */
export function ConsentField({
  name,
  statement,
  checked,
  onChange,
}: {
  name: string;
  statement: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      name={name}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3.5 rounded-card border p-5 text-left transition-all active:translate-y-px ${
        checked
          ? "border-navy bg-mist"
          : "border-line bg-white hover:border-navy/40"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
          checked ? "border-navy bg-navy" : "border-line"
        }`}
      >
        {checked && <Check size={13} weight="bold" className="text-white" />}
      </span>
      <span className="text-small text-muted">{statement}</span>
    </button>
  );
}
