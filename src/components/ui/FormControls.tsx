import { Search } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-[#9aa49f] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:bg-page sm:text-[15px]";

function controlState(invalid?: boolean) {
  return invalid ? "border-status-red focus:border-status-red" : "border-line focus:border-brand-400";
}

/** Label + required marker + help/error text, wired up with aria attributes. */
export function Field({
  id,
  label,
  required,
  help,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-status-red" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="text-xs text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-status-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, help?: ReactNode) {
  if (error) return `${id}-error`;
  if (help) return `${id}-help`;
  return undefined;
}

export function TextInput({ invalid, className, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(controlBase, "h-12", controlState(invalid), className)} {...props} />;
}

export function TextArea({ invalid, className, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlBase, "min-h-28 py-3 leading-relaxed", controlState(invalid), className)}
      {...props}
    />
  );
}

export function Select({ invalid, className, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={cn(controlBase, "h-12 pr-10", controlState(invalid), className)} {...props}>
      {children}
    </select>
  );
}

export function SearchInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        className={cn(controlBase, "h-11 border-line pl-10 focus:border-brand-400")}
        {...props}
      />
    </div>
  );
}

/** Pill-shaped filter chips used for status / category filters. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode; count?: number; dot?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
              active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white text-ink hover:bg-brand-50",
            )}
          >
            {o.dot && <span className="size-2.5 rounded-full" style={{ backgroundColor: o.dot }} aria-hidden />}
            {o.label}
            {o.count !== undefined && <span className={active ? "text-white/80" : "text-muted"}>({o.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
