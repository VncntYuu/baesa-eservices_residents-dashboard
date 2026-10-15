"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { Button } from "@/components/ui/Button";
import { InfoPanel } from "@/components/ui/Card";
import { FilterBar, Pagination, TablePanel, UnderlineTabs, paginate } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { NOTIFICATION_TONE, Pill } from "@/components/ui/StatusBadge";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/store/portal-store";
import type { AppNotification, NotificationType } from "@/lib/types";
import { cn, formatNotificationDate } from "@/lib/utils";

/** Sender column from the Notifications reference. */
const SENDER: Record<NotificationType, { name: string; dot: string }> = {
  announcement: { name: "Barangay Baesa", dot: "bg-brand-500" },
  request: { name: "Document Office", dot: "bg-brand-500" },
  appointment: { name: "Appointments", dot: "bg-status-amber" },
  report: { name: "Community Reports", dot: "bg-status-blue" },
};

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "announcement", label: "Announcements" },
  { value: "request", label: "Document requests" },
  { value: "appointment", label: "Appointments" },
  { value: "report", label: "Community reports" },
];

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function StatusPill({ n }: { n: AppNotification }) {
  const label = n.read ? "Read" : n.tag;
  return <Pill tone={NOTIFICATION_TONE[label]}>{label}</Pill>;
}

export function NotificationsView() {
  const { notifications } = useResidentData();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [range, setRange] = useState("30");
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notifications]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((n) => tab === "all" || !n.read)
      .filter((n) => type === "all" || n.type === type)
      .filter((n) => range === "all" || now - new Date(n.createdAt).getTime() <= Number(range) * 86_400_000)
      .filter((n) => !q || `${n.title} ${n.message} ${SENDER[n.type].name}`.toLowerCase().includes(q));
  }, [notifications, tab, type, range, query, now]);

  const { pages, current, slice, start } = paginate(filtered, page);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const open = (n: AppNotification) => {
    if (!n.read) markNotificationRead(n.id);
  };

  const MarkRead = ({ n }: { n: AppNotification }) =>
    n.read ? null : (
      <button
        type="button"
        onClick={() => markNotificationRead(n.id)}
        aria-label={`Mark "${n.title}" as read`}
        title="Mark as read"
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-brand-500 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        <Check className="size-4" aria-hidden />
      </button>
    );

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated on announcements, reminders, and updates from Barangay Baesa E-Services."
        actions={
          <Button size="lg" onClick={markAllNotificationsRead} disabled={unread === 0}>
            Mark all as read
          </Button>
        }
      />

      <UnderlineTabs
        label="Notifications"
        idPrefix="ntf"
        value={tab}
        onChange={resetPage(setTab)}
        tabs={[
          { value: "all", label: "All notifications" },
          { value: "unread", label: unread ? `Unread (${unread})` : "Unread" },
        ]}
      />

      <div id="ntf-panel" role="tabpanel" aria-labelledby={`ntf-tab-${tab}`}>
        <TablePanel>
          <FilterBar
            searchId="ntf-search"
            searchLabel="Search notifications"
            searchPlaceholder="Search by title, sender or keyword"
            query={query}
            onQuery={resetPage(setQuery)}
            selects={[
              { id: "ntf-type", label: "Filter by type", value: type, onChange: resetPage(setType), options: TYPE_OPTIONS },
              { id: "ntf-range", label: "Date range", value: range, onChange: resetPage(setRange), options: RANGE_OPTIONS },
            ]}
          />

          {filtered.length === 0 ? (
            <p className="px-6 py-10 text-center text-muted">
              {tab === "unread" ? "You're all caught up. No unread notifications." : "No notifications match your filters."}
            </p>
          ) : (
            <>
              <div className="hidden lg:block">
                <table className="w-full table-fixed text-left">
                  <caption className="sr-only">Your notifications</caption>
                  <colgroup>
                    <col />
                    <col className="w-48" />
                    <col className="w-52" />
                    <col className="w-32" />
                    <col className="w-28" />
                  </colgroup>
                  <thead className="bg-table-head text-base text-muted">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-medium">Notification</th>
                      <th scope="col" className="px-4 py-4 font-medium">Sender</th>
                      <th scope="col" className="px-4 py-4 font-medium">Date</th>
                      <th scope="col" className="px-4 py-4 font-medium">Status</th>
                      <th scope="col" className="px-4 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {slice.map((n) => (
                      <tr key={n.id} className={cn("border-t border-line", !n.read && "bg-brand-50/60")}>
                        <td className="px-6 py-4">
                          <p className={cn("text-ink", n.read ? "font-medium" : "font-bold")}>
                            {n.title}
                            {!n.read && <span className="sr-only"> (unread)</span>}
                          </p>
                          <p className="truncate text-sm text-subtle" title={n.message}>
                            {n.message}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-ink">
                          <span className="flex items-start gap-2">
                            <span className={cn("mt-2 size-2 shrink-0 rounded-full", SENDER[n.type].dot)} aria-hidden />
                            {SENDER[n.type].name}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-ink">{formatNotificationDate(n.createdAt)}</td>
                        <td className="px-4 py-4">
                          <StatusPill n={n} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <MarkRead n={n} />
                            {n.href && (
                              <Link
                                href={n.href}
                                onClick={() => open(n)}
                                aria-label={`Open: ${n.title}`}
                                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-page hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
                              >
                                <ChevronRight className="size-5" aria-hidden />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-line lg:hidden">
                {slice.map((n) => (
                  <li key={n.id} className={cn("flex items-start gap-3 px-4 py-4", !n.read && "bg-brand-50/60")}>
                    <span className={cn("mt-2 size-2 shrink-0 rounded-full", SENDER[n.type].dot)} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("text-ink", n.read ? "font-medium" : "font-bold")}>{n.title}</p>
                        <StatusPill n={n} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                      <p className="mt-1 text-xs text-subtle">
                        {SENDER[n.type].name} · {formatNotificationDate(n.createdAt)}
                      </p>
                      {n.href && (
                        <Link href={n.href} onClick={() => open(n)} className="mt-2 inline-block text-sm font-semibold text-brand-500 hover:underline">
                          Open
                        </Link>
                      )}
                    </div>
                    <MarkRead n={n} />
                  </li>
                ))}
              </ul>

              <Pagination
                page={current}
                pages={pages}
                total={filtered.length}
                start={start}
                shown={slice.length}
                noun={tab === "unread" ? "unread notifications" : "notifications"}
                onPage={setPage}
              />
            </>
          )}
        </TablePanel>
      </div>

      <InfoPanel title="Stay informed" className="mt-7">
        Notifications keep you updated on announcements, document approvals, appointment reminders, and community reports. You can
        review every update here and mark them as read when you&apos;re done. In this demo, notifications are created in your browser
        when you submit something; live updates from barangay staff are not connected yet.
      </InfoPanel>
    </>
  );
}
