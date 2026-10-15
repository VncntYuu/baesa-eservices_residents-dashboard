"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { RESIDENT_NAV } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

/** Dark green sidebar from the reference screenshots: emerald active pill, mint labels, outlined Logout. */
export function ResidentSidebar({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar px-5 pt-7 pb-6 text-sidebar-text">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-9 rounded-xl px-2 focus-visible:outline-2 focus-visible:outline-white"
      >
        <BrandMark />
      </Link>

      <nav aria-label="Resident navigation" className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {RESIDENT_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-3.5 rounded-xl px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-white",
                    active ? "bg-sidebar-active font-semibold text-white" : "hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex h-12 w-full items-center gap-3.5 rounded-xl border border-sidebar-logout px-4 text-base font-medium text-sidebar-logout transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-white"
      >
        <LogOut className="size-5" aria-hidden />
        Logout
      </button>
    </div>
  );
}
