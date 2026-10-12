import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function QuickAccessCard({ label, href, icon: Icon }: { label: string; href: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:p-5"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-500">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="flex-1 text-base font-semibold text-ink sm:text-lg">{label}</span>
      <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-500" aria-hidden />
    </Link>
  );
}
