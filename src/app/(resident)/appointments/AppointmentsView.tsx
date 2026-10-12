"use client";

import { CalendarDays, CalendarPlus, Info } from "lucide-react";
import { useState } from "react";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { AppointmentFormDialog } from "@/components/appointments/AppointmentForm";
import { useResidentData } from "@/components/layout/ResidentShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { cancelAppointment, requestAppointment, rescheduleAppointment } from "@/lib/store/portal-store";
import type { Appointment } from "@/lib/types";
import { cn, formatCalendarDate, formatDateTime, formatTime, toYMD } from "@/lib/utils";

type Tab = "upcoming" | "previous";

export function AppointmentsView() {
  const { appointments } = useResidentData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Appointment | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [today] = useState(() => toYMD(new Date()));

  const isUpcoming = (a: Appointment) => (a.status === "Pending" || a.status === "Confirmed") && a.date >= today;
  const upcoming = appointments.filter(isUpcoming).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const previous = appointments.filter((a) => !isUpcoming(a)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const list = tab === "upcoming" ? upcoming : previous;

  // Keep the details dialog in sync with store updates.
  const viewingLive = viewing ? (appointments.find((a) => a.id === viewing.id) ?? null) : null;

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Schedule visits to the barangay hall and manage your bookings."
        actions={
          <Button size="lg" onClick={() => setFormOpen(true)}>
            <CalendarPlus className="size-5" aria-hidden />
            Request appointment
          </Button>
        }
      />

      {APPOINTMENT_RULES.isDemo && (
        <div className="mb-6 flex gap-3 rounded-xl border-l-4 border-status-amber bg-status-amber-bg px-4 py-3 text-sm text-status-amber">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            <strong>Demonstration schedule.</strong> Time slots, available days and the {APPOINTMENT_RULES.minHoursBeforeChange}
            -hour change window are placeholders until the barangay provides its official appointment rules.
          </p>
        </div>
      )}

      <div role="tablist" aria-label="Appointments" className="mb-6 flex gap-8 border-b border-line">
        {(
          [
            ["upcoming", `Upcoming (${upcoming.length})`],
            ["previous", `Previous (${previous.length})`],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls="apt-panel"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-[3px] px-1 pb-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 sm:text-lg",
              tab === t ? "border-brand-500 text-brand-500" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="apt-panel" role="tabpanel" className="space-y-4">
        {list.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title={tab === "upcoming" ? "No upcoming appointments" : "No previous appointments"}
            action={
              tab === "upcoming" ? <Button onClick={() => setFormOpen(true)}>Request appointment</Button> : undefined
            }
          />
        ) : (
          list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onView={() => setViewing(a)}
              onReschedule={() => setRescheduling(a)}
              onCancel={() => setCancelling(a)}
            />
          ))
        )}
      </div>

      <AppointmentFormDialog
        open={formOpen}
        mode="new"
        onClose={() => setFormOpen(false)}
        onSubmit={(v) => {
          const appt = requestAppointment({ purpose: v.purpose, date: v.date, time: v.time, notes: v.notes.trim() || undefined });
          setFormOpen(false);
          setTab("upcoming");
          toast(`Appointment requested (${appt.referenceNo}). Awaiting confirmation.`);
        }}
      />

      <AppointmentFormDialog
        open={!!rescheduling}
        mode="reschedule"
        initial={rescheduling ?? undefined}
        onClose={() => setRescheduling(null)}
        onSubmit={(v) => {
          if (rescheduling) rescheduleAppointment(rescheduling.id, v.date, v.time);
          setRescheduling(null);
          toast("Reschedule requested. Awaiting confirmation.");
        }}
      />

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel this appointment?"
        message={
          cancelling && (
            <>
              {cancelling.purpose} on {formatCalendarDate(cancelling.date)} at {formatTime(cancelling.time)} will be cancelled.
            </>
          )
        }
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        tone="danger"
        onCancel={() => setCancelling(null)}
        onConfirm={() => {
          if (cancelling) cancelAppointment(cancelling.id);
          setCancelling(null);
          toast("Appointment cancelled.", "info");
        }}
      />

      <Dialog open={!!viewingLive} onClose={() => setViewing(null)} title={viewingLive?.purpose ?? ""} description={viewingLive ? `Reference #: ${viewingLive.referenceNo}` : undefined}>
        {viewingLive && (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-page px-3 py-2">
                <p className="text-xs font-semibold text-muted">Date</p>
                <p className="font-medium">{formatCalendarDate(viewingLive.date)}</p>
              </div>
              <div className="rounded-lg bg-page px-3 py-2">
                <p className="text-xs font-semibold text-muted">Time</p>
                <p className="font-medium">{formatTime(viewingLive.time)}</p>
              </div>
              <div className="rounded-lg bg-page px-3 py-2">
                <p className="text-xs font-semibold text-muted">Status</p>
                <StatusBadge status={viewingLive.status} className="mt-1" />
              </div>
            </div>
            {viewingLive.notes && (
              <div>
                <p className="font-bold text-brand-900">Notes</p>
                <p className="mt-1 text-ink">{viewingLive.notes}</p>
              </div>
            )}
            <div>
              <p className="mb-2 font-bold text-brand-900">History</p>
              <ol className="space-y-3 border-l-2 border-line pl-4">
                {[...viewingLive.history].reverse().map((h, i) => (
                  <li key={i}>
                    <p className="text-ink">{h.note}</p>
                    <p className="text-xs text-muted">{formatDateTime(h.date)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
