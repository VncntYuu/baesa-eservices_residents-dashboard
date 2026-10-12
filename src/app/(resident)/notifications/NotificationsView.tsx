"use client";

import { Bell, CheckCheck, Info } from "lucide-react";
import { useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/store/portal-store";
import type { NotificationType } from "@/lib/types";

type Filter = "all" | "unread" | NotificationType;

export function NotificationsView() {
  const { notifications } = useResidentData();
  const [filter, setFilter] = useState<Filter>("all");
  const unread = notifications.filter((n) => !n.read).length;

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const list = sorted.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter));

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.` : "You're all caught up."}
        actions={
          <Button variant="soft" onClick={markAllNotificationsRead} disabled={unread === 0}>
            <CheckCheck className="size-5" aria-hidden />
            Mark all as read
          </Button>
        }
      />

      <div className="mb-6 flex gap-3 rounded-xl border-l-4 border-status-blue bg-status-blue-bg px-4 py-3 text-sm text-status-blue">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Notifications are generated in this browser when you submit requests, reports or appointments. Real-time updates from
          barangay staff are not connected yet.
        </p>
      </div>

      <div className="mb-5">
        <FilterChips
          label="Filter notifications"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all" as Filter, label: "All", count: notifications.length },
            { value: "unread" as Filter, label: "Unread", count: unread },
            { value: "request" as Filter, label: "Requests" },
            { value: "report" as Filter, label: "Reports" },
            { value: "appointment" as Filter, label: "Appointments" },
            { value: "announcement" as Filter, label: "Announcements" },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="No notifications here" />
      ) : (
        <Card className="divide-y divide-line p-2">
          {list.map((n) => (
            <div key={n.id} className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <NotificationItem notification={n} />
              </div>
              <button
                type="button"
                onClick={() => markNotificationRead(n.id, !n.read)}
                className="mx-4 mb-2 w-fit rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 sm:mx-2 sm:mb-0"
              >
                {n.read ? "Mark as unread" : "Mark as read"}
              </button>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
