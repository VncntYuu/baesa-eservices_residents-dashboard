"use client";

import { Megaphone } from "lucide-react";
import { AnnouncementImage, announcementPillLabel } from "@/components/announcements/AnnouncementCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LinkButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ANNOUNCEMENT_TONE, Pill } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export function AnnouncementDetailView({ id }: { id: string }) {
  const { announcements } = useResidentData();
  const a = announcements.find((x) => x.id === id);

  if (!a) {
    return (
      <>
        <PageHeader title="Announcement" back={{ href: "/announcements", label: "Back to Announcements" }} />
        <EmptyState
          icon={<Megaphone className="size-6" />}
          title="Announcement not found"
          description="It may have been removed or the link is incorrect."
          action={<LinkButton href="/announcements">View all announcements</LinkButton>}
        />
      </>
    );
  }

  return (
    <article className="mx-auto max-w-4xl">
      <PageHeader title={a.title} back={{ href: "/announcements", label: "Back to Announcements" }} />
      <Card className="overflow-hidden">
        <AnnouncementImage announcement={a} className="h-56 sm:h-72" />
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={a.priority === "urgent" ? "red" : ANNOUNCEMENT_TONE[a.category]}>{announcementPillLabel(a)}</Pill>
            <time dateTime={a.publishedAt} className="text-sm text-subtle">
              Posted {formatDate(a.publishedAt)}
            </time>
          </div>
          <p className="mt-6 text-lg font-medium text-ink">{a.summary}</p>
          <div className="mt-4 max-w-prose space-y-4 text-base leading-relaxed text-muted">
            {a.body.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Card>
    </article>
  );
}
