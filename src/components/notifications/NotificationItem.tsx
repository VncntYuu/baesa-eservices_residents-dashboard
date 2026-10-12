"use client";

import Link from "next/link";
import { CalendarDays, FileText, Megaphone, MessageSquare } from "lucide-react";
import { markNotificationRead } from "@/lib/store/portal-store";
import type { AppNotification, NotificationType } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

const TYPE_META: Record<NotificationType, { icon: typeof FileText; label: string; className: string }> = {
  request: { icon: FileText, label: "Request", className: "bg-brand-100 text-brand-500" },
  report: { icon: MessageSquare, label: "Community report", className: "bg-status-blue-bg text-status-blue" },
  appointment: { icon: CalendarDays, label: "Appointment", className: "bg-status-amber-bg text-status-amber" },
  announcement: { icon: Megaphone, label: "Announcement", className: "bg-status-red-bg text-status-red" },
};

export function NotificationItem({
  notification,
  compact = false,
  onOpen,
}: {
  notification: AppNotification;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;
  const unread = !notification.read;

  const body = (
    <>
      <span className={cn("grid shrink-0 place-items-center rounded-xl", compact ? "size-9" : "size-11", meta.className)}>
        <Icon className={compact ? "size-4" : "size-5"} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={cn("truncate text-sm", unread ? "font-bold text-ink" : "font-semibold text-ink/80")}>
            {notification.title}
          </span>
          {unread && (
            <span className="size-2 shrink-0 rounded-full bg-status-red" aria-hidden />
          )}
        </span>
        <span className={cn("mt-0.5 block text-sm text-muted", compact && "line-clamp-2")}>{notification.message}</span>
        <span className="mt-1 block text-xs text-muted">
          {meta.label} · {relativeTime(notification.createdAt)}
          <span className="sr-only">{unread ? ", unread" : ", read"}</span>
        </span>
      </span>
    </>
  );

  const handleOpen = () => {
    if (unread) markNotificationRead(notification.id);
    onOpen?.();
  };

  const cls = cn(
    "flex w-full items-start gap-3 rounded-xl text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
    compact ? "px-3 py-2.5" : "px-4 py-4",
    unread ? "bg-brand-50 hover:bg-brand-100" : "hover:bg-page",
  );

  return notification.href ? (
    <Link href={notification.href} onClick={handleOpen} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={handleOpen} className={cls}>
      {body}
    </button>
  );
}
