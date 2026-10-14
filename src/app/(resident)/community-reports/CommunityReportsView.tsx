"use client";

import { MessageSquare, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { ReportsMap } from "@/components/reports/maps";
import { ReportCard, ReportDetailsDialog } from "@/components/reports/ReportDetails";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { FilterChips, Select } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { REPORT_CATEGORIES } from "@/lib/config/reports";
import type { CommunityReport, ReportCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "mine" | "map";
type CatFilter = "All" | ReportCategory;
const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function CommunityReportsView() {
  const { reports } = useResidentData();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get("tab") === "mine" ? "mine" : "map";
  const [category, setCategory] = useState<CatFilter>("All");
  const [range, setRange] = useState("30");
  const [selected, setSelected] = useState<CommunityReport | null>(null);
  // Captured once per mount so filtering stays pure during render.
  const [now] = useState(() => Date.now());

  const myReports = useMemo(
    () => reports.filter((r) => r.isMine).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [reports],
  );

  const inRange = useMemo(
    () =>
      reports.filter(
        (r) => r.status !== "Resolved" && (range === "all" || now - new Date(r.submittedAt).getTime() <= Number(range) * 86_400_000),
      ),
    [reports, range, now],
  );
  // Memoized so the map only redraws its pins when the filtered set actually changes.
  const visible = useMemo(
    () => (category === "All" ? inRange : inRange.filter((r) => r.category === category)),
    [inRange, category],
  );

  const setTab = (t: Tab) => router.replace(`${pathname}?tab=${t}`, { scroll: false });

  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      id={`tab-${t}`}
      aria-selected={tab === t}
      aria-controls={`panel-${t}`}
      onClick={() => setTab(t)}
      className={cn(
        "-mb-px border-b-[3px] px-1 pb-3 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 sm:text-lg",
        tab === t ? "border-brand-500 text-brand-500" : "border-transparent text-muted hover:text-ink",
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageHeader
        title="Complaints & Reports"
        description="File complaints or provide feedback to help improve our barangay."
        actions={
          <LinkButton href="/community-reports/new" size="lg">
            <Plus className="size-5" aria-hidden />
            File New Complaint / Report
          </LinkButton>
        }
      />

      <div role="tablist" aria-label="Reports view" className="mb-6 flex gap-8 border-b border-line">
        {tabBtn("mine", `My Reports (${myReports.length})`)}
        {tabBtn("map", "Community Map")}
      </div>

      {tab === "mine" ? (
        <div id="panel-mine" role="tabpanel" aria-labelledby="tab-mine">
          {myReports.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-6" />}
              title="You haven't filed any reports yet"
              action={<LinkButton href="/community-reports/new">File a report</LinkButton>}
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {myReports.map((r) => (
                <ReportCard key={r.id} report={r} onView={() => setSelected(r)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div id="panel-map" role="tabpanel" aria-labelledby="tab-map">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <FilterChips
              label="Filter by category"
              value={category}
              onChange={setCategory}
              options={[
                { value: "All" as CatFilter, label: "All reports", count: inRange.length },
                ...REPORT_CATEGORIES.map((c) => ({
                  value: c.value as CatFilter,
                  label: c.label,
                  dot: c.color,
                  count: inRange.filter((r) => r.category === c.value).length,
                })),
              ]}
            />
            <div className="w-full lg:w-48">
              <label htmlFor="range" className="sr-only">
                Date range
              </label>
              <Select id="range" value={range} onChange={(e) => setRange(e.target.value)} className="h-11">
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line shadow-card sm:h-[560px]">
            <ReportsMap reports={visible} onViewDetails={setSelected} />
            <div className="pointer-events-none absolute right-3 bottom-6 z-[500] rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow sm:text-sm">
              <span className="mr-1.5 inline-block size-2 rounded-full bg-status-green" aria-hidden />
              {visible.length} active report{visible.length === 1 ? "" : "s"} shown
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink" aria-label="Map legend">
            <li className="text-xs font-semibold tracking-wide text-muted uppercase">Legend</li>
            {REPORT_CATEGORIES.map((c) => (
              <li key={c.value} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                {c.label}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border-2 border-brand-700" aria-hidden />
              Your report
            </li>
          </ul>

          <div className="mt-6 rounded-2xl border-l-4 border-brand-500 bg-brand-50 px-5 py-4">
            <p className="font-bold text-brand-900">About this map</p>
            <p className="mt-1 text-sm text-ink/80">
              Pins show active community reports at their approximate locations. Personal details are never displayed. Nearby
              reports are only highlighted to help barangay staff review related concerns — they are not merged automatically.
              In this demo, the other residents&apos; pins are sample data.
            </p>
          </div>
        </div>
      )}

      <ReportDetailsDialog report={selected} onClose={() => setSelected(null)} />
    </>
  );
}
