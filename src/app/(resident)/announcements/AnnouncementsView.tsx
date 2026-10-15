"use client";

import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnnouncementImage, announcementPillLabel } from "@/components/announcements/AnnouncementCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, SectionTitle } from "@/components/ui/Card";
import { FilterChips, SearchInput } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { ANNOUNCEMENT_TONE, Pill } from "@/components/ui/StatusBadge";
import type { Announcement } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type Filter = "all" | "urgent" | "News" | "Event";

/** Large horizontal card used for Urgent Alerts (reference: image left, pill, big title, summary, date, Read more). */
function FeatureCard({ a }: { a: Announcement }) {
  return (
    <article className="grid gap-6 rounded-3xl border border-line bg-white p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center">
      <AnnouncementImage announcement={a} className="aspect-[4/3] rounded-xl md:aspect-auto md:h-60" />
      <div>
        <Pill tone={a.priority === "urgent" ? "red" : ANNOUNCEMENT_TONE[a.category]}>{announcementPillLabel(a)}</Pill>
        <h3 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">{a.title}</h3>
        <p className="mt-3 text-base leading-relaxed text-muted">{a.summary}</p>
        <time dateTime={a.publishedAt} className="mt-3 block text-sm text-subtle">
          {formatDate(a.publishedAt)}
        </time>
        <LinkButton href={`/announcements/${a.id}`} size="sm" className="mt-4" aria-label={`Read more: ${a.title}`}>
          Read more
          <ArrowRight className="size-4" aria-hidden />
        </LinkButton>
      </div>
    </article>
  );
}

/** Grid card used for Routine News & Events. */
function NewsCard({ a }: { a: Announcement }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <AnnouncementImage announcement={a} className="h-40" />
      <div className="flex flex-1 flex-col p-5">
        <Pill tone={ANNOUNCEMENT_TONE[a.category]} className="w-fit">
          {a.tag ?? a.category}
        </Pill>
        <h3 className="mt-3 text-lg font-bold text-ink">{a.title}</h3>
        <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-muted">{a.summary}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <time dateTime={a.publishedAt} className="text-xs text-subtle">
            {formatDate(a.publishedAt)}
          </time>
          <Link
            href={`/announcements/${a.id}`}
            aria-label={`Read more: ${a.title}`}
            className="inline-flex items-center gap-1 rounded text-sm font-semibold text-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            Read more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AnnouncementsView() {
  const { announcements } = useResidentData();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const { urgent, routine } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...announcements]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .filter((a) => !q || `${a.title} ${a.summary} ${a.tag ?? ""}`.toLowerCase().includes(q));
    const isTop = (a: Announcement) => a.priority !== "normal";
    return {
      urgent: filter === "all" || filter === "urgent" ? list.filter(isTop) : [],
      routine: filter === "urgent" ? [] : list.filter((a) => !isTop(a) && (filter === "all" || a.category === filter)),
    };
  }, [announcements, filter, query]);

  const counts = {
    urgent: announcements.filter((a) => a.priority !== "normal").length,
    News: announcements.filter((a) => a.priority === "normal" && a.category === "News").length,
    Event: announcements.filter((a) => a.priority === "normal" && a.category === "Event").length,
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Stay updated with the latest barangay announcements, urgent alerts, and community events."
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          label="Filter announcements"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "urgent", label: "Urgent alerts", count: counts.urgent },
            { value: "News", label: "News", count: counts.News },
            { value: "Event", label: "Events", count: counts.Event },
          ]}
        />
        <div className="w-full lg:w-80">
          <label htmlFor="ann-search" className="sr-only">
            Search announcements
          </label>
          <SearchInput id="ann-search" placeholder="Search announcements" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {urgent.length === 0 && routine.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-6" />} title="No announcements found" description="Try another filter or search term." />
      ) : (
        <div className="space-y-10">
          {urgent.length > 0 && (
            <section aria-labelledby="urgent-title">
              <SectionTitle id="urgent-title" className="mb-5">
                Urgent Alerts
              </SectionTitle>
              <div className="space-y-6">
                {urgent.map((a) => (
                  <FeatureCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
          {routine.length > 0 && (
            <section aria-labelledby="routine-title">
              <SectionTitle id="routine-title" className="mb-5">
                Routine News &amp; Events
              </SectionTitle>
              <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3")}>
                {routine.map((a) => (
                  <NewsCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
