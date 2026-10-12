"use client";

import { Megaphone, TriangleAlert } from "lucide-react";
import { CATEGORY_TONE } from "@/components/announcements/AnnouncementCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LinkButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/StatusBadge";
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
    <article className="mx-auto max-w-3xl">
      <PageHeader title={a.title} back={{ href: "/announcements", label: "Back to Announcements" }} />
      <Card className="p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone={CATEGORY_TONE[a.category]}>{a.category}</Pill>
          {a.important && (
            <Pill tone="red" className="gap-1">
              <TriangleAlert className="size-3.5" aria-hidden />
              Important
            </Pill>
          )}
          <time dateTime={a.publishedAt} className="text-sm text-muted">
            Posted {formatDate(a.publishedAt)}
          </time>
        </div>
        <p className="mt-6 text-lg font-medium text-ink">{a.summary}</p>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-ink/85">
          {a.body.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Card>
    </article>
  );
}
