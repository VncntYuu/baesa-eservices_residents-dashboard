"use client";

import { CalendarDays, CircleCheck, Info } from "lucide-react";
import { useState } from "react";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { BookingForm, RescheduleDialog } from "@/components/appointments/AppointmentForm";
import { useResidentData } from "@/components/layout/ResidentShell";
import { Button } from "@/components/ui/Button";
import { EmptyState, SectionTitle } from "@/components/ui/Card";
import { UnderlineTabs } from "@/components/ui/DataTable";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { cancelAppointment, requestAppointment, rescheduleAppointment } from "@/lib/store/portal-store";
import type { Appointment } from "@/lib/types";
import { formatCalendarDate, formatDateTime, formatSlot, toYMD } from "@/lib/utils";

type Tab = "upcoming" | "previous";

function AppointmentSummary({ a }: { a: Appointment }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {[
        ["Service / Purpose", a.purpose],
        ["Resident name", a.residentName],
        ["Date", formatCalendarDate(a.date)],
        ["Time", formatSlot(a.time, APPOINTMENT_RULES.slotMinutes)],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-page px-3 py-2">
          <dt className="text-xs font-semibold text-subtle">{k}</dt>
          <dd className="font-medium text-ink">{v}</dd>
        </div>
      ))}
      {a.notes && (
        <div className="rounded-lg bg-page px-3 py-2 sm:col-span-2">
          <dt className="text-xs font-semibold text-subtle">Notes for staff</dt>
          <dd className="font-medium text-ink">{a.notes}</dd>
        </div>
      )}
    </dl>
  );
}

export function AppointmentsView() {
  const { appointments, resident } = useResidentData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [booked, setBooked] = useState<Appointment | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [today] = useState(() => toYMD(new Date()));

  const isUpcoming = (a: Appointment) => (a.status === "Pending" || a.status === "Confirmed") && a.date >= today;
  const upcoming = appointments.filter(isUpcoming).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const previous = appointments.filter((a) => !isUpcoming(a)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const list = tab === "upcoming" ? upcoming : previous;
  const viewing = viewingId ? (appointments.find((a) => a.id === viewingId) ?? null) : null;

  return (
    <>
      <PageHeader
        title="Book an Appointment"
        description="Choose a service, select a date and time, and confirm your visit before heading to the barangay."
      />

      <BookingForm
        defaultName={`${resident.firstName} ${resident.lastName}`}
        onSubmit={(v) => {
          const appt = requestAppointment({
            purpose: v.purpose,
            residentName: v.residentName,
            date: v.date,
            time: v.time,
            notes: v.notes || undefined,
          });
          setTab("upcoming");
          setBooked(appt);
        }}
      />

      {APPOINTMENT_RULES.isDemo && (
        <p className="mt-4 flex gap-2 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-status-amber" aria-hidden />
          Demo schedule: available days, time slots and the {APPOINTMENT_RULES.minHoursBeforeChange}-hour change window are placeholders
          until the barangay provides its official appointment rules. Bookings are saved in this browser only.
        </p>
      )}

      <section aria-labelledby="my-apt-title" className="mt-12">
        <SectionTitle id="my-apt-title" className="mb-5">
          My Appointments
        </SectionTitle>
        <UnderlineTabs
          label="Appointments"
          idPrefix="apt"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "upcoming", label: `Upcoming (${upcoming.length})` },
            { value: "previous", label: `Previous (${previous.length})` },
          ]}
        />
        <div id="apt-panel" role="tabpanel" aria-labelledby={`apt-tab-${tab}`} className="space-y-4">
          {list.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-6" />}
              title={tab === "upcoming" ? "No upcoming appointments" : "No previous appointments"}
              description={tab === "upcoming" ? "Use the form above to book a visit." : undefined}
            />
          ) : (
            list.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onView={() => setViewingId(a.id)}
                onReschedule={() => setRescheduling(a)}
                onCancel={() => setCancelling(a)}
              />
            ))
          )}
        </div>
      </section>

      {/* Booking confirmation */}
      <Dialog
        open={!!booked}
        onClose={() => setBooked(null)}
        title="Appointment requested"
        description={booked ? `Reference #: ${booked.referenceNo}` : undefined}
        footer={<Button onClick={() => setBooked(null)}>Done</Button>}
      >
        {booked && (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-sm text-ink">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-status-green" aria-hidden />
              Your request is saved and waiting for confirmation from barangay staff. It now appears under Upcoming.
            </p>
            <AppointmentSummary a={booked} />
            <p className="text-sm text-muted">{APPOINTMENT_RULES.arrivalNote}</p>
            <p className="text-xs text-subtle">Demo: no booking system is connected, so the barangay has not received this request.</p>
          </div>
        )}
      </Dialog>

      <RescheduleDialog
        open={!!rescheduling}
        onClose={() => setRescheduling(null)}
        onSubmit={(date, time) => {
          if (rescheduling) rescheduleAppointment(rescheduling.id, date, time);
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
              {cancelling.purpose} on {formatCalendarDate(cancelling.date)}, {formatSlot(cancelling.time)} will be cancelled.
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

      <Dialog open={!!viewing} onClose={() => setViewingId(null)} title={viewing?.purpose ?? ""} description={viewing ? `Reference #: ${viewing.referenceNo}` : undefined}>
        {viewing && (
          <div className="space-y-5 text-sm">
            <AppointmentStatusBadge status={viewing.status} />
            <AppointmentSummary a={viewing} />
            <div>
              <p className="mb-2 font-bold text-brand-900">History</p>
              <ol className="space-y-3 border-l-2 border-line pl-4">
                {[...viewing.history].reverse().map((h, i) => (
                  <li key={i}>
                    <p className="text-ink">{h.note}</p>
                    <p className="text-xs text-subtle">{formatDateTime(h.date)}</p>
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
