import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page title block from the references: large dark-green heading, muted subtitle, optional action on the right. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  flush,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  /** Skip the bottom margin (when the parent already spaces sections). */
  flush?: boolean;
}) {
  return (
    <div className={cn(!flush && "mb-7 sm:mb-9")}>
      {back && (
        <Link
          href={back.href}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg text-base font-medium text-brand-500 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance text-brand-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {title}
          </h1>
          {description && <p className="mt-2 text-base text-muted sm:text-lg">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:pt-1">{actions}</div>}
      </div>
    </div>
  );
}
