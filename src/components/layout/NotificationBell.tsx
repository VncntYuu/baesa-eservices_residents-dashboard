"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { markAllNotificationsRead } from "@/lib/store/portal-store";
import type { AppNotification } from "@/lib/types";

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;
  const latest = notifications.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications, ${unread} unread`}
        className="relative grid size-11 place-items-center rounded-full bg-brand-100 text-brand-500 transition-colors hover:bg-brand-200 focus-visible:outline-2 focus-visible:outline-brand-500 sm:size-12"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-status-red px-1 text-[11px] leading-5 font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 pt-2 pb-3">
            <p className="font-bold text-brand-900">Notifications</p>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-500 hover:bg-brand-50 disabled:opacity-40"
            >
              <CheckCheck className="size-4" aria-hidden />
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {latest.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">You&apos;re all caught up.</p>
            ) : (
              latest.map((n) => <NotificationItem key={n.id} notification={n} compact onOpen={() => setOpen(false)} />)
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl py-2.5 text-center text-sm font-semibold text-brand-500 hover:bg-brand-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
