import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)} {...props} />;
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-xl font-bold text-brand-900 sm:text-[1.625rem]", className)} {...props} />;
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-12 text-center">
      {icon && <div className="mb-3 grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-500">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Light green info panel with a strong left edge ("About this map", "Stay informed"). */
export function InfoPanel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border-l-[5px] border-brand-500 bg-[#e6f1ea] px-6 py-5 sm:px-9 sm:py-6", className)}>
      <p className="text-lg font-bold text-brand-900">{title}</p>
      <div className="mt-1.5 text-base leading-relaxed text-muted">{children}</div>
    </div>
  );
}
