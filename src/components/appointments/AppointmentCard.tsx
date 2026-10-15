"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { canChangeAppointment } from "@/lib/store/portal-store";
import type { Appointment } from "@/lib/types";
import { formatSlot } from "@/lib/utils";

export function AppointmentCard({
  appointment,
  onView,
  onReschedule,
  onCancel,
}: {
  appointment: Appointment;
  onView: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const a = appointment;
  const [y, m, d] = a.date.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const change = canChangeAppointment(a);
  const showActions = a.status === "Pending" || a.status === "Confirmed";

  return (
    <Card className="flex flex-col gap-4 p-5 shadow-none sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <div className="flex items-center gap-4 sm:contents">
        <div className="grid w-20 shrink-0 place-items-center rounded-xl bg-brand-100 py-3 text-brand-600" aria-hidden>
          <span className="text-xs font-bold uppercase">{date.toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="text-3xl leading-none font-extrabold">{d}</span>
          <span className="text-xs font-semibold">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-ink">{a.purpose}</h3>
            <AppointmentStatusBadge status={a.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-4" aria-hidden />
            <span className="sr-only">
              {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at{" "}
            </span>
            {formatSlot(a.time, APPOINTMENT_RULES.slotMinutes)} · Ref {a.referenceNo}
          </p>
          {showActions && !change.allowed && <p className="mt-1 text-xs text-status-amber">{change.reason}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
        <Button variant="soft" size="sm" onClick={onView} className="flex-1 sm:flex-none">
          Details
        </Button>
        {showActions && (
          <>
            <Button variant="outline" size="sm" onClick={onReschedule} disabled={!change.allowed} className="flex-1 sm:flex-none">
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={!change.allowed}
              className="flex-1 text-status-red sm:flex-none"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
