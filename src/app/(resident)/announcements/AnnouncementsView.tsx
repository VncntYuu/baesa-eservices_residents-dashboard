"use client";

import { Megaphone, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { EmptyState } from "@/components/ui/Card";
import { FilterChips, SearchInput } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import type { AnnouncementCategory } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type CatFilter = "All" | AnnouncementCategory;
const CATEGORIES: CatFilter[] = ["All", "News", "Event", "Advisory", "Health"];

export function AnnouncementsView() {
  const { announcements } = useResidentData();
  const [category, setCategory] = useState<CatFilter>("All");
  const [query, setQuery] = useState("");

  const sorted = [...announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const important = sorted.filter((a) => a.important);
  const q = query.trim().toLowerCase();
  const filtered = sorted.filter(
    (a) =>
      (category === "All" || a.category === category) &&
      (!q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader title="Announcements" description="News, events and advisories from Barangay Baesa." />

      {important.length > 0 && (
        <section aria-labelledby="important-title" className="mb-8 space-y-3">
          <h2 id="important-title" className="sr-only">
            Important announcements
          </h2>
          {important.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="flex items-start gap-4 rounded-2xl border border-status-red/25 bg-status-red-bg px-5 py-4 transition-colors hover:bg-[#f8d6d3] focus-visible:outline-2 focus-visible:outline-status-red"
            >
              <TriangleAlert className="mt-0.5 size-6 shrink-0 text-status-red" aria-hidden />
              <span className="min-w-0">
                <span className="text-xs font-bold tracking-wide text-status-red uppercase">Important · {formatDate(a.publishedAt)}</span>
                <span className="mt-0.5 block text-lg font-bold text-ink">{a.title}</span>
                <span className="mt-0.5 block text-sm text-ink/80">{a.summary}</span>
              </span>
            </Link>
          ))}
        </section>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: c,
            count: c === "All" ? announcements.length : announcements.filter((a) => a.category === c).length,
          }))}
        />
        <SearchInput
          className="w-full lg:w-80"
          placeholder="Search announcements"
          aria-label="Search announcements"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-6" />} title="No announcements found" description="Try another category or search term." />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </>
  );
}
