import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function QuickAccessCard({ label, href, icon: Icon }: { label: string; href: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4 sm:gap-4 sm:px-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span className="grid size-[3.25rem] shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-500">
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-base leading-snug font-semibold break-words text-ink sm:text-lg xl:text-base 2xl:text-lg">{label}</span>
      <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-500" aria-hidden />
    </Link>
  );
}
