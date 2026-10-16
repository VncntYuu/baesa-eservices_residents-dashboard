"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { AppNotification, ResidentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { ResidentAvatar } from "./ResidentAvatar";

export function ResidentHeader({
  resident,
  notifications,
  onOpenMenu,
}: {
  resident: ResidentProfile;
  notifications: AppNotification[];
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();
  const onProfile = pathname === "/profile";
  const fullName = `${resident.firstName} ${resident.lastName}`;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:h-20 sm:px-6 lg:px-10">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="-ml-1 grid size-10 place-items-center rounded-lg text-brand-900 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <p className="min-w-0 flex-1 truncate text-lg font-semibold text-brand-500 sm:text-xl lg:text-[1.375rem]">
        <span className="sm:hidden">Baesa E-Services</span>
        <span className="hidden sm:inline">Barangay Baesa E-Services</span>
      </p>

      <NotificationBell notifications={notifications} />

      {/* Opens My Profile; outlined in green while that page is open (reference). */}
      <Link
        href="/profile"
        aria-label={`My profile: ${fullName}`}
        aria-current={onProfile ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-full border-2 bg-brand-50 p-0.5 transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:py-1 sm:pr-5 sm:pl-1",
          onProfile ? "border-brand-500" : "border-transparent",
        )}
      >
        <ResidentAvatar resident={resident} className="size-9 text-base sm:size-11 sm:text-lg" />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block font-semibold text-ink">{fullName}</span>
          <span className="block text-sm text-subtle">Barangay Resident</span>
        </span>
      </Link>
    </header>
  );
}
