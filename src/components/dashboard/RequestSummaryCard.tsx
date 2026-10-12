import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { toneClasses, type Tone } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function RequestSummaryCard({
  label,
  count,
  caption,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  count: number;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
  href: string;
}) {
  const t = toneClasses[tone];
  return (
    <Link
      href={href}
      aria-label={`${label}: ${count} requests, ${caption}. View requests`}
      className="group relative block overflow-hidden rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:p-6"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", t.bar)} aria-hidden />
      <div className="flex items-center gap-4">
        <span className={cn("grid size-12 place-items-center rounded-xl", t.soft, t.text)}>
          <Icon className="size-6" aria-hidden />
        </span>
        <span className="text-lg font-medium text-ink/80 sm:text-xl">{label}</span>
      </div>
      <p className={cn("mt-6 text-5xl font-extrabold tabular-nums sm:mt-8 sm:text-6xl", t.text)}>{count}</p>
      <p className="mt-2 text-sm text-muted sm:text-base">{caption}</p>
    </Link>
  );
}
