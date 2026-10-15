import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { toneClasses, type Tone } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

/** Summary tile from the Dashboard reference: curved coloured left edge, tinted icon, large count. */
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
      aria-label={`${label}: ${count} request${count === 1 ? "" : "s"}, ${caption}. View these requests`}
      className={cn(
        "group block rounded-2xl border-l-[5px] bg-white px-6 pt-6 pb-5 shadow-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        t.border,
      )}
    >
      <div className="flex items-center gap-4">
        <span className={cn("grid size-12 place-items-center rounded-xl", t.soft, t.text)}>
          <Icon className="size-6" aria-hidden />
        </span>
        <span className="text-lg font-medium text-muted sm:text-xl">{label}</span>
      </div>
      <p className={cn("mt-6 text-5xl leading-none font-extrabold tabular-nums sm:mt-8 sm:text-6xl", t.text)}>{count}</p>
      <p className="mt-3 text-sm text-subtle sm:text-base">{caption}</p>
    </Link>
  );
}
