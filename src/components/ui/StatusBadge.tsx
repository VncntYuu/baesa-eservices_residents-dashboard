import type {
  AnnouncementCategory,
  AppointmentStatus,
  NotificationTag,
  PaymentStatus,
  ReportStatus,
  RequestStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type Tone = "red" | "amber" | "green" | "gray" | "blue";

export const toneClasses: Record<Tone, { badge: string; text: string; bar: string; soft: string; border: string }> = {
  red: { badge: "bg-status-red-bg text-status-red", text: "text-status-red", bar: "bg-status-red", soft: "bg-status-red-bg", border: "border-status-red" },
  amber: { badge: "bg-status-amber-bg text-status-amber", text: "text-status-amber", bar: "bg-status-amber", soft: "bg-status-amber-bg", border: "border-status-amber" },
  green: { badge: "bg-status-green-bg text-status-green", text: "text-status-green", bar: "bg-status-green", soft: "bg-status-green-bg", border: "border-status-green" },
  gray: { badge: "bg-status-gray-bg text-status-gray", text: "text-status-gray", bar: "bg-status-gray", soft: "bg-status-gray-bg", border: "border-status-gray" },
  blue: { badge: "bg-status-blue-bg text-status-blue", text: "text-status-blue", bar: "bg-status-blue", soft: "bg-status-blue-bg", border: "border-status-blue" },
};

/*
 * Status colours per area, as drawn in the reference screenshots:
 * requests (Dashboard / My Requests): Pending red, In Progress amber, Completed green.
 * community reports (My Reports table): Pending amber, In progress blue, Resolved green.
 */
export const REQUEST_TONE: Record<RequestStatus, Tone> = {
  Pending: "red",
  "In Progress": "amber",
  Completed: "green",
  Rejected: "gray",
};

export const REPORT_TONE: Record<ReportStatus, Tone> = {
  Pending: "amber",
  "In Progress": "blue",
  Resolved: "green",
};

export const APPOINTMENT_TONE: Record<AppointmentStatus, Tone> = {
  Pending: "amber",
  Confirmed: "green",
  Completed: "blue",
  Cancelled: "gray",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  "Not required": "gray",
  "To be assessed": "gray",
  "Awaiting online payment": "amber",
  "Pay at barangay hall": "blue",
  Paid: "green",
};

export const NOTIFICATION_TONE: Record<NotificationTag | "Read", Tone> = {
  New: "blue",
  Updated: "blue",
  Urgent: "amber",
  Reminder: "amber",
  Read: "green",
};

export const ANNOUNCEMENT_TONE: Record<AnnouncementCategory, Tone> = {
  News: "blue",
  Event: "green",
  Alert: "red",
};

export function Pill({ tone = "green", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        toneClasses[tone].badge,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Pill tone={REQUEST_TONE[status]} className={className}>
      {status}
    </Pill>
  );
}

export function ReportStatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <Pill tone={REPORT_TONE[status]} className={className}>
      {status === "In Progress" ? "In progress" : status}
    </Pill>
  );
}

export function AppointmentStatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  return (
    <Pill tone={APPOINTMENT_TONE[status]} className={className}>
      {status}
    </Pill>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Pill tone={PAYMENT_TONE[status]} className={className}>
      {status}
    </Pill>
  );
}
