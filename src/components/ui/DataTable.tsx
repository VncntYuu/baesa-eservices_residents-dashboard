"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SearchInput, Select } from "./FormControls";

/** White rounded panel that holds a filter bar, a table/list and a pagination footer (My Reports / Notifications references). */
export function TablePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)}>{children}</div>;
}

export interface FilterSelectConfig {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function FilterBar({
  searchId,
  searchLabel,
  searchPlaceholder,
  query,
  onQuery,
  selects,
}: {
  searchId: string;
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQuery: (q: string) => void;
  selects: FilterSelectConfig[];
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-6 md:flex-row">
      <label htmlFor={searchId} className="sr-only">
        {searchLabel}
      </label>
      <SearchInput
        id={searchId}
        className="min-w-0 flex-1"
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 md:flex">
        {selects.map((s) => (
          <div key={s.id} className="md:w-52">
            <label htmlFor={s.id} className="sr-only">
              {s.label}
            </label>
            <Select id={s.id} value={s.value} onChange={(e) => s.onChange(e.target.value)}>
              {s.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}

export const PAGE_SIZE = 6;

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { pages, current, slice: items.slice((current - 1) * size, current * size), start: (current - 1) * size };
}

export function Pagination({
  page,
  pages,
  total,
  start,
  shown,
  noun,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  start: number;
  shown: number;
  noun: string;
  onPage: (p: number) => void;
}) {
  const btn =
    "grid size-10 place-items-center rounded-lg border border-line text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-40";
  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-muted" aria-live="polite">
        {total === 0 ? `No ${noun}` : `Showing ${start + 1}–${start + shown} of ${total} ${noun}`}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        <button type="button" className={cn(btn, "bg-white hover:bg-page")} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(btn, p === page ? "border-brand-500 bg-brand-500 text-white" : "bg-white text-ink hover:bg-page")}
          >
            {p}
          </button>
        ))}
        <button type="button" className={cn(btn, "bg-white hover:bg-page")} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </nav>
    </div>
  );
}

/** Underlined tabs used on Community Reports and Notifications. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idPrefix,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  idPrefix: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="mb-7 flex gap-8 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${t.value}`}
          aria-selected={value === t.value}
          aria-controls={`${idPrefix}-panel`}
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px border-b-[3px] px-1 pb-3 text-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 sm:text-xl",
            value === t.value ? "border-brand-500 text-brand-500" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
