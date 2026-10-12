"use client";

import { Menu, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AppNotification, ResidentProfile } from "@/lib/types";
import { NotificationBell } from "./NotificationBell";

export function ResidentHeader({
  resident,
  notifications,
  onOpenMenu,
  onResetDemo,
}: {
  resident: ResidentProfile;
  notifications: AppNotification[];
  onOpenMenu: () => void;
  onResetDemo: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setProfileOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProfileOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  const fullName = `${resident.firstName} ${resident.lastName}`;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:h-20 sm:px-6 lg:px-12">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="-ml-1 grid size-10 place-items-center rounded-lg text-brand-900 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <p className="min-w-0 flex-1 truncate text-lg font-bold text-brand-500 sm:text-2xl">
        <span className="sm:hidden">Baesa E-Services</span>
        <span className="hidden sm:inline">Barangay Baesa E-Services</span>
      </p>

      <span
        className="hidden rounded-full bg-status-amber-bg px-3 py-1 text-xs font-semibold text-status-amber md:inline"
        title="Data is stored in this browser only. No backend is connected yet."
      >
        Demo mode
      </span>

      <NotificationBell notifications={notifications} />

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((o) => !o)}
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label={`Profile: ${fullName}`}
          className="flex items-center gap-3 rounded-full bg-brand-50 p-1 transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-500 sm:py-1.5 sm:pr-5 sm:pl-1.5"
        >
          <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-base font-bold text-white sm:size-11 sm:text-lg">
            {resident.firstName.charAt(0)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block font-semibold text-ink">{fullName}</span>
            <span className="block text-sm text-muted">Barangay Resident</span>
          </span>
        </button>
        {profileOpen && (
          <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl">
            <div className="px-3 py-2">
              <p className="font-semibold text-ink">{fullName}</p>
              <p className="text-sm text-muted">{resident.email}</p>
              <p className="mt-1 text-xs text-muted">
                {resident.address}, {resident.purok}
              </p>
            </div>
            <hr className="my-1 border-line" />
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                onResetDemo();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-brand-50"
            >
              <RotateCcw className="size-4 text-muted" aria-hidden />
              Reset demo data
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
