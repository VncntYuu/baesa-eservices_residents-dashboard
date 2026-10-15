"use client";

import { ArrowDown, ArrowUp, ChevronRight, LoaderCircle, MessageSquare, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { ReportsMap } from "@/components/reports/maps";
import { CategoryDot, ReportCard, ReportDetailsDialog } from "@/components/reports/ReportDetails";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, InfoPanel } from "@/components/ui/Card";
import { FilterBar, Pagination, TablePanel, UnderlineTabs, paginate } from "@/components/ui/DataTable";
import { FilterChips, Select } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { ALL_CATEGORIES, REPORT_STATUSES, categoryLabel } from "@/lib/config/reports";
import { searchPlaces } from "@/lib/services/geocoding";
import type { CommunityReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Tab = "mine" | "map";
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
  const tab: Tab = params.get("tab") === "map" ? "map" : "mine";
  const [selected, setSelected] = useState<CommunityReport | null>(null);
  const setTab = (t: Tab) => router.replace(`${pathname}?tab=${t}`, { scroll: false });

  return (
    <>
      <PageHeader
        title="Complaints & Reports"
        description="Help keep Baesa safe and clean. Track your complaints or reports and see what's being done."
        actions={
          <LinkButton href="/community-reports/new" size="lg">
            <Plus className="size-5" aria-hidden />
            File New Complaint / Report
          </LinkButton>
        }
      />

      <UnderlineTabs
        label="Reports view"
        idPrefix="reports"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "mine", label: "My Reports" },
          { value: "map", label: "Community Map" },
        ]}
      />

      <div id="reports-panel" role="tabpanel" aria-labelledby={`reports-tab-${tab}`}>
        {tab === "mine" ? (
          <MyReports reports={reports} onView={setSelected} />
        ) : (
          <CommunityMap reports={reports} onView={setSelected} />
        )}
      </div>

      <ReportDetailsDialog report={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* ------------------------------- My Reports ------------------------------- */

function MyReports({ reports, onView }: { reports: CommunityReport[]; onView: (r: CommunityReport) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  const mine = useMemo(() => reports.filter((r) => r.isMine), [reports]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mine
      .filter((r) => status === "All" || r.status === status)
      .filter((r) => category === "All" || r.category === category)
      .filter(
        (r) =>
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.referenceNo.toLowerCase().includes(q) ||
          `${r.location.label} ${r.location.area ?? ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => (newestFirst ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt)));
  }, [mine, query, status, category, newestFirst]);

  const { pages, current, slice, start } = paginate(filtered, page);
  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  if (mine.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="size-6" />}
        title="You haven't filed any complaints or reports yet"
        action={<LinkButton href="/community-reports/new">File a complaint or report</LinkButton>}
      />
    );
  }

  return (
    <TablePanel>
      <FilterBar
        searchId="rpt-search"
        searchLabel="Search your reports"
        searchPlaceholder="Search by title, report ID or location"
        query={query}
        onQuery={reset(setQuery)}
        selects={[
          {
            id: "rpt-status",
            label: "Filter by status",
            value: status,
            onChange: reset(setStatus),
            options: [{ value: "All", label: "All statuses" }, ...REPORT_STATUSES.map((s) => ({ value: s, label: s }))],
          },
          {
            id: "rpt-category",
            label: "Filter by category",
            value: category,
            onChange: reset(setCategory),
            options: [
              { value: "All", label: "All categories" },
              ...ALL_CATEGORIES.map((c) => ({ value: c.value, label: c.isOther ? `Other (${c.kind.toLowerCase()})` : c.label })),
            ],
          },
        ]}
      />

      {filtered.length === 0 ? (
        <p className="px-6 py-10 text-center text-muted">No reports match your filters.</p>
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full text-left">
              <caption className="sr-only">Your complaints and reports</caption>
              <thead className="bg-table-head text-base text-muted">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Complaints &amp; Reports</th>
                  <th scope="col" className="px-4 py-4 font-medium">Category</th>
                  <th scope="col" className="px-4 py-4 font-medium">Location</th>
                  <th scope="col" className="px-4 py-4 font-medium" aria-sort={newestFirst ? "descending" : "ascending"}>
                    <button
                      type="button"
                      onClick={() => setNewestFirst((v) => !v)}
                      className="inline-flex items-center gap-1 rounded font-medium hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
                    >
                      Submitted
                      {newestFirst ? <ArrowDown className="size-4" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
                      <span className="sr-only">{newestFirst ? ", newest first" : ", oldest first"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">Status</th>
                  <th scope="col" className="w-14 px-4 py-4">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={r.id} onClick={() => onView(r)} className="cursor-pointer border-t border-line hover:bg-page/60">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink">{r.title}</p>
                      <p className="text-sm text-subtle">{r.referenceNo}</p>
                    </td>
                    <td className="px-4 py-4 text-ink">
                      <CategoryDot report={r} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-ink">{r.location.label}</p>
                      {r.location.area && <p className="text-sm text-subtle">{r.location.area}</p>}
                    </td>
                    <td className="px-4 py-4 text-ink">{formatDate(r.submittedAt)}</td>
                    <td className="px-4 py-4">
                      <ReportStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(r);
                        }}
                        aria-label={`View details of ${r.title}`}
                        className="grid size-9 place-items-center rounded-lg text-muted hover:bg-page hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
                      >
                        <ChevronRight className="size-5" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 bg-page p-4 md:hidden">
            {slice.map((r) => (
              <ReportCard key={r.id} report={r} onView={() => onView(r)} />
            ))}
          </div>
        </>
      )}
      <Pagination page={current} pages={pages} total={filtered.length} start={start} shown={slice.length} noun="reports" onPage={setPage} />
    </TablePanel>
  );
}

/* ------------------------------ Community Map ----------------------------- */

function CommunityMap({ reports, onView }: { reports: CommunityReport[]; onView: (r: CommunityReport) => void }) {
  const [category, setCategory] = useState("All");
  const [range, setRange] = useState("30");
  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const inRange = useMemo(
    () =>
      reports.filter(
        (r) => r.status !== "Resolved" && (range === "all" || now - new Date(r.submittedAt).getTime() <= Number(range) * 86_400_000),
      ),
    [reports, range, now],
  );
  // Memoized so the map only redraws its pins when the filtered set actually changes.
  const visible = useMemo(() => (category === "All" ? inRange : inRange.filter((r) => r.category === category)), [inRange, category]);
  const present = ALL_CATEGORIES.filter((c) => inRange.some((r) => r.category === c.value));

  const search = async () => {
    const q = query.trim();
    if (q.length < 3) {
      setSearchMsg("Type at least 3 characters.");
      return;
    }
    // A purok, street or title that matches a report on the map is found without going online.
    const local = visible.find((r) => `${r.location.label} ${r.location.area ?? ""} ${r.title}`.toLowerCase().includes(q.toLowerCase()));
    if (local) {
      setFocus({ lat: local.location.lat, lng: local.location.lng });
      setSearchMsg("");
      return;
    }
    setSearching(true);
    setSearchMsg("");
    try {
      const [hit] = await searchPlaces(q);
      if (hit) setFocus({ lat: hit.lat, lng: hit.lng });
      else setSearchMsg("No matching place found near Barangay Baesa.");
    } catch {
      setSearchMsg("Address search couldn't connect right now.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <FilterChips
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "All", label: `All reports (${inRange.length})` },
            ...present.map((c) => ({ value: c.value as string, label: categoryLabel(c.value), dot: c.color })),
          ]}
        />
        <div className="w-full shrink-0 lg:w-48">
          <label htmlFor="map-range" className="sr-only">
            Date range
          </label>
          <Select id="map-range" value={range} onChange={(e) => setRange(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="relative h-[460px] overflow-hidden rounded-2xl border border-line sm:h-[600px]">
        <ReportsMap reports={visible} onViewDetails={onView} focus={focus} />

        <div className="absolute top-3 right-16 left-3 z-[500] sm:right-auto sm:w-96">
          <div role="search" className="flex items-center gap-2 rounded-full bg-white pr-1.5 pl-4 shadow-lg">
            <Search className="size-4 shrink-0 text-muted" aria-hidden />
            <label htmlFor="map-place" className="sr-only">
              Search street, landmark, or purok
            </label>
            <input
              id="map-place"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void search();
                }
              }}
              placeholder="Search street, landmark, or purok"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              autoComplete="off"
            />
            {searching ? (
              <LoaderCircle className="mr-2 size-4 animate-spin text-muted" aria-label="Searching" />
            ) : (
              <button
                type="button"
                onClick={() => void search()}
                className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Search
              </button>
            )}
          </div>
          {searchMsg && <p className="mt-2 rounded-xl bg-white px-4 py-2 text-xs text-muted shadow">{searchMsg}</p>}
        </div>

        <div className="pointer-events-none absolute right-3 bottom-6 left-3 z-[500] flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
          <ul
            aria-label="Map legend"
            className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-white/95 px-4 py-2 text-xs text-ink shadow sm:rounded-full sm:text-sm"
          >
            <li className="text-xs font-semibold tracking-wide text-subtle uppercase">Legend</li>
            {present.map((c) => (
              <li key={c.value} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                {categoryLabel(c.value)}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border-2 border-brand-700" aria-hidden />
              Your report
            </li>
          </ul>
          <p className="shrink-0 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold whitespace-nowrap text-ink shadow sm:text-sm">
            <span className="mr-1.5 inline-block size-2 rounded-full bg-status-green" aria-hidden />
            {visible.length} active report{visible.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <InfoPanel title="About this map" className="mt-7">
        Pins show active community reports at their approximate locations. Personal details are never displayed. Nearby reports
        are highlighted so barangay staff can review related concerns; they are not merged automatically. In this demo, pins use
        sample coordinates around the barangay centre.
      </InfoPanel>
    </>
  );
}

