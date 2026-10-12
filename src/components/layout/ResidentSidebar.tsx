"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { RESIDENT_NAV } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

export function ResidentSidebar({
  onNavigate,
  onLogout,
  unreadCount = 0,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
  unreadCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar px-4 pt-6 pb-5 text-sidebar-text">
      <Link href="/dashboard" onClick={onNavigate} className="mb-8 rounded-xl px-2 focus-visible:outline-2 focus-visible:outline-white">
        <BrandMark />
      </Link>

      <nav aria-label="Resident navigation" className="flex-1 overflow-y-auto">
        <ul className="space-y-1.5">
          {RESIDENT_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-3.5 rounded-xl px-4 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white",
                    active ? "bg-sidebar-active font-semibold text-white shadow-sm" : "hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {href === "/notifications" && unreadCount > 0 && (
                    <span className="rounded-full bg-status-red px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex h-12 w-full items-center gap-3.5 rounded-xl border border-sidebar-active/70 px-4 text-[15px] font-medium text-sidebar-active transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        <LogOut className="size-5" aria-hidden />
        Log Out
      </button>
    </div>
  );
}
