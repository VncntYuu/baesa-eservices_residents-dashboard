import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Pill, type Tone } from "@/components/ui/StatusBadge";
import type { Announcement, AnnouncementCategory } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export const CATEGORY_TONE: Record<AnnouncementCategory, Tone> = {
  News: "blue",
  Event: "green",
  Advisory: "amber",
  Health: "red",
};

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const a = announcement;
  return (
    <Link
      href={`/announcements/${a.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:px-8 sm:py-6"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", a.important ? "bg-status-red" : "bg-brand-500")} aria-hidden />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-ink group-hover:text-brand-600 sm:text-xl">{a.title}</h3>
          <Pill tone={CATEGORY_TONE[a.category]}>{a.category}</Pill>
          {a.important && (
            <Pill tone="red" className="gap-1">
              <TriangleAlert className="size-3.5" aria-hidden />
              Important
            </Pill>
          )}
        </div>
        <time
          dateTime={a.publishedAt}
          className="w-fit shrink-0 rounded-full bg-page px-4 py-1.5 text-sm font-medium text-muted"
        >
          {formatDate(a.publishedAt)}
        </time>
      </div>
      <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-ink/75">{a.summary}</p>
    </Link>
  );
}
