import { ChevronDown, Search } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border px-4 text-base text-ink placeholder:text-[#a3b0aa] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400/30 disabled:bg-page disabled:text-subtle sm:text-[15px]";

/** "outline" = white bordered field (forms); "filled" = soft green-gray field (appointment reference). */
export type ControlVariant = "outline" | "filled";

function controlState(invalid?: boolean, variant: ControlVariant = "outline") {
  const bg = variant === "filled" ? "bg-page" : "bg-white";
  return cn(bg, invalid ? "border-status-red focus:border-status-red" : "border-[#dce4df] focus:border-brand-400");
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
        <p id={`${id}-help`} className="text-xs text-subtle">
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

type VariantProps = { invalid?: boolean; variant?: ControlVariant };

export function TextInput({ invalid, variant, className, ...props }: ComponentProps<"input"> & VariantProps) {
  const emptyDate = props.type === "date" && !props.value;
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlBase, "h-12", controlState(invalid, variant), emptyDate && "text-[#a3b0aa]", className)}
      {...props}
    />
  );
}

export function TextArea({ invalid, variant, className, ...props }: ComponentProps<"textarea"> & VariantProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlBase, "min-h-28 py-3 leading-relaxed", controlState(invalid, variant), className)}
      {...props}
    />
  );
}

/** Native select (keyboard and screen-reader friendly) with the reference's chevron. */
export function Select({
  invalid,
  variant,
  className,
  wrapperClassName,
  children,
  ...props
}: ComponentProps<"select"> & VariantProps & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        aria-invalid={invalid || undefined}
        className={cn(controlBase, "h-12 appearance-none pr-11", controlState(invalid, variant), props.value === "" && "text-[#a3b0aa]", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink" />
    </div>
  );
}

/** Input with a trailing icon (calendar, person) as in the appointment reference. */
export function IconInput({
  icon,
  wrapperClassName,
  ...props
}: ComponentProps<typeof TextInput> & { icon: ReactNode; wrapperClassName?: string }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <TextInput {...props} className={cn("pr-12", props.className)} />
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted [&_svg]:size-5">
        {icon}
      </span>
    </div>
  );
}

export function SearchInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
      <input type="search" className={cn(controlBase, controlState(), "h-12 pl-12")} {...props} />
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
