"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { DayPicker, getDefaultClassNames, type DateRange as CalendarRange } from "react-day-picker";
import "react-day-picker/style.css";
import { controlClass } from "@/constants/controlClass";
import { formatDay } from "@/domain/metrics";
import type { DateRange } from "@/types/range";
import { dateKey, orderedRange, parseDateKey, rangeLabel } from "@/utils/dateRangeField";

const defaults = getDefaultClassNames();
const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

const calendarClassNames = {
  root: `${defaults.root} text-sm text-zinc-900`,
  months: `${defaults.months} w-max flex-nowrap max-sm:flex-col`,
  month_caption: `${defaults.month_caption} text-sm font-semibold text-zinc-900`,
  weekday: `${defaults.weekday} text-[0.7rem] font-medium tracking-wide text-zinc-400 uppercase opacity-100`,
  day_button: `${defaults.day_button} text-sm font-normal hover:bg-teal-50 ${focusRing}`,
  selected: `${defaults.selected} text-sm font-medium`,
  range_start: `${defaults.range_start} [&>button]:hover:bg-teal-700!`,
  range_middle: `${defaults.range_middle} [&>button]:hover:bg-transparent!`,
  range_end: `${defaults.range_end} [&>button]:hover:bg-teal-700!`,
  today: `${defaults.today} font-semibold`,
  chevron: `${defaults.chevron} size-4 fill-teal-700`,
  button_previous: `${defaults.button_previous} rounded-full hover:bg-teal-50 ${focusRing}`,
  button_next: `${defaults.button_next} rounded-full hover:bg-teal-50 ${focusRing}`,
};

const calendarStyle = {
  "--rdp-accent-color": "var(--color-teal-700)",
  "--rdp-accent-background-color": "var(--color-teal-50)",
  "--rdp-today-color": "var(--color-teal-700)",
  "--rdp-range_middle-background-color": "var(--color-teal-50)",
  "--rdp-range_middle-color": "var(--color-teal-950)",
  "--rdp-range_start-color": "#ffffff",
  "--rdp-range_end-color": "#ffffff",
  "--rdp-range_start-date-background-color": "var(--color-teal-700)",
  "--rdp-range_end-date-background-color": "var(--color-teal-700)",
  "--rdp-selected-border": "2px solid transparent",
  "--rdp-day-width": "2.25rem",
  "--rdp-day-height": "2.25rem",
  "--rdp-day_button-width": "2.25rem",
  "--rdp-day_button-height": "2.25rem",
  "--rdp-nav-height": "2.25rem",
  "--rdp-nav_button-width": "2rem",
  "--rdp-nav_button-height": "2rem",
  "--rdp-weekday-opacity": "1",
  "--rdp-outside-opacity": "0",
  "--rdp-months-gap": "1.75rem",
} as CSSProperties;

const calendarStyles = {
  month_caption: { fontSize: "0.875rem", fontWeight: 600 },
  selected: { fontSize: "0.875rem", fontWeight: 500 },
};

function selectionText(draft: CalendarRange | null, from: string | null, to: string | null) {
  if (draft?.from && draft.to) {
    const range = orderedRange(draft.from, draft.to);
    return rangeLabel(range.from, range.to);
  }
  if (draft?.from) return `${formatDay(dateKey(draft.from))} –`;
  return rangeLabel(from, to);
}

export function DateFields({
  from,
  to,
  onRange,
}: {
  from: string | null;
  to: string | null;
  onRange: (range: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CalendarRange | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const labelId = useId();
  const valueId = useId();
  const rangeKey = `${from ?? ""}|${to ?? ""}`;
  const [trackedRange, setTrackedRange] = useState(rangeKey);
  if (trackedRange !== rangeKey) {
    setTrackedRange(rangeKey);
    setOpen(false);
    setDraft(null);
  }

  useEffect(() => {
    if (!open) return;
    const popover = popoverRef.current;
    const selectedDay = popover?.querySelector<HTMLElement>("[data-selected='true'] button");
    const firstControl = popover?.querySelector<HTMLElement>("button:not([disabled])");
    (selectedDay ?? firstControl)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      setDraft(null);
      triggerRef.current?.focus();
    }

    function onFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
      setDraft(null);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
      setDraft(null);
      const keepsFocus =
        target instanceof Element && target.closest("button, a, input, select, textarea") !== null;
      if (!keepsFocus) triggerRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function handleSelect(range: CalendarRange | undefined) {
    setDraft(range?.from ? range : null);
  }

  function apply() {
    if (!draft?.from || !draft.to) return;
    setDraft(null);
    setOpen(false);
    onRange(orderedRange(draft.from, draft.to));
    triggerRef.current?.focus();
  }

  const selected: CalendarRange | undefined = draft
    ? draft
    : from && to
      ? { from: parseDateKey(from), to: parseDateKey(to) }
      : undefined;
  const canApply = Boolean(draft?.from && draft.to);
  const summary = selectionText(draft, from, to);

  return (
    <div className="relative flex min-w-64 flex-col gap-1">
      <span id={labelId} className="text-sm font-medium text-zinc-900">
        Dates
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={`${controlClass} inline-flex items-center gap-2 px-3! text-left`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => {
          setDraft(null);
          setOpen((current) => !current);
        }}
      >
        <CalendarIcon />
        <span id={valueId} className="whitespace-nowrap">
          {rangeLabel(from, to)}
        </span>
      </button>
      {open ? (
        <div
          ref={popoverRef}
          id={dialogId}
          role="dialog"
          aria-label="Choose dates"
          tabIndex={-1}
          className="absolute top-full z-30 mt-2 w-max rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xl outline-none left-0 lg:left-auto lg:right-0"
        >
          <DayPicker
            mode="range"
            required
            resetOnSelect
            showOutsideDays={false}
            numberOfMonths={2}
            navLayout="around"
            weekStartsOn={1}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={from ? parseDateKey(from) : to ? parseDateKey(to) : undefined}
            classNames={calendarClassNames}
            styles={calendarStyles}
            style={calendarStyle}
          />
          <div className="mt-3 flex items-center justify-between gap-6 border-t border-zinc-100 pt-3">
            <p className={`text-sm ${canApply ? "font-medium text-zinc-800" : "text-zinc-500"}`}>{summary}</p>
            <button
              type="button"
              className={`h-9 rounded-md px-4 text-sm font-medium text-white ${focusRing} ${canApply ? "bg-teal-700 hover:bg-teal-800" : "cursor-not-allowed bg-teal-700/40"}`}
              disabled={!canApply}
              onClick={apply}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-teal-700" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" strokeLinecap="round" />
    </svg>
  );
}
