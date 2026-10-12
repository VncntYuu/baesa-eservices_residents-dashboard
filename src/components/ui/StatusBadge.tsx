import type { AppointmentStatus, ReportStatus, RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type Tone = "red" | "amber" | "green" | "gray" | "blue";

export const toneClasses: Record<Tone, { badge: string; text: string; bar: string; soft: string }> = {
  red: { badge: "bg-status-red-bg text-status-red", text: "text-status-red", bar: "bg-status-red", soft: "bg-status-red-bg" },
  amber: { badge: "bg-status-amber-bg text-status-amber", text: "text-status-amber", bar: "bg-status-amber", soft: "bg-status-amber-bg" },
  green: { badge: "bg-status-green-bg text-status-green", text: "text-status-green", bar: "bg-status-green", soft: "bg-status-green-bg" },
  gray: { badge: "bg-status-gray-bg text-status-gray", text: "text-status-gray", bar: "bg-status-gray", soft: "bg-status-gray-bg" },
  blue: { badge: "bg-status-blue-bg text-status-blue", text: "text-status-blue", bar: "bg-status-blue", soft: "bg-status-blue-bg" },
};

/** Single source of truth for status → colour across the portal. */
const STATUS_TONE: Record<RequestStatus | ReportStatus | AppointmentStatus, Tone> = {
  Pending: "red",
  "In Progress": "amber",
  Completed: "green",
  Rejected: "gray",
  Submitted: "red",
  Resolved: "green",
  Confirmed: "green",
  Cancelled: "gray",
};

export function statusTone(status: RequestStatus | ReportStatus | AppointmentStatus): Tone {
  return STATUS_TONE[status];
}

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus | ReportStatus | AppointmentStatus;
  className?: string;
}) {
  const tone = toneClasses[statusTone(status)];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        tone.badge,
        className,
      )}
    >
      {status}
    </span>
  );
}

export function Pill({ tone = "green", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap", toneClasses[tone].badge, className)}>
      {children}
    </span>
  );
}
