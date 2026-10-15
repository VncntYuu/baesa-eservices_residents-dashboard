import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { ANNOUNCEMENT_TONE, Pill } from "@/components/ui/StatusBadge";
import type { Announcement } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function announcementPillLabel(a: Announcement): string {
  const lead = a.priority === "urgent" ? "Important" : a.priority === "featured" ? "Featured" : null;
  const kind = a.tag ?? a.category;
  return lead ? `${lead} · ${kind}` : kind;
}

/** Row card used in Dashboard → Recent Announcements (reference: green curved left edge, type pill, date pill). */
export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const a = announcement;
  return (
    <Link
      href={`/announcements/${a.id}`}
      className={cn(
        "group block rounded-2xl border-l-[5px] bg-white px-5 py-5 shadow-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:px-10 sm:py-6",
        a.priority === "urgent" ? "border-status-red" : "border-brand-500",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-ink group-hover:text-brand-600 sm:text-xl">{a.title}</h3>
          <Pill tone={ANNOUNCEMENT_TONE[a.category]}>{a.tag ?? a.category}</Pill>
        </div>
        <time dateTime={a.publishedAt} className="w-fit shrink-0 rounded-full bg-page px-4 py-1.5 text-sm text-subtle">
          {formatDate(a.publishedAt)}
        </time>
      </div>
      <p className="mt-3 line-clamp-2 text-base leading-relaxed text-muted">{a.summary}</p>
    </Link>
  );
}

/** Image area from the Announcements reference. Announcements have no photos yet, so a placeholder is shown. */
export function AnnouncementImage({ announcement, className }: { announcement: Announcement; className?: string }) {
  return (
    <div className={cn("grid place-items-center overflow-hidden bg-[#e9f4ec]", className)}>
      {announcement.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- announcement images will come from the CMS backend
        <img src={announcement.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-14 text-[#687083]" strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}
