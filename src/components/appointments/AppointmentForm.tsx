"use client";

import { LoaderCircle, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, IconInput, Select, TextInput, describedBy } from "@/components/ui/FormControls";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { formatSlot, toYMD } from "@/lib/utils";

export interface BookingValues {
  purpose: string;
  date: string;
  time: string;
  residentName: string;
  notes: string;
}

function bookableRange() {
  const min = new Date();
  min.setDate(min.getDate() + APPOINTMENT_RULES.minDaysAhead);
  const max = new Date();
  max.setDate(max.getDate() + APPOINTMENT_RULES.maxDaysAhead);
  return { min: toYMD(min), max: toYMD(max) };
}

export function validateSchedule(date: string, time: string): Partial<Record<"date" | "time", string>> {
  const errors: Partial<Record<"date" | "time", string>> = {};
  const { min, max } = bookableRange();
  if (!date) errors.date = "Choose a date.";
  else if (date < min) errors.date = "Choose a date from tomorrow onwards. Past dates and today can't be booked.";
  else if (date > max) errors.date = `Choose a date within the next ${APPOINTMENT_RULES.maxDaysAhead} days.`;
  else {
    const [y, m, d] = date.split("-").map(Number);
    if (!APPOINTMENT_RULES.bookableWeekdays.includes(new Date(y, m - 1, d).getDay()))
      errors.date = "Weekends aren't available in the demo schedule. Choose Monday to Friday.";
  }
  if (!time) errors.time = "Choose a time slot.";
  return errors;
}

function TimeSlotSelect({ id, value, onChange, invalid, describedById }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedById?: string;
}) {
  return (
    <Select id={id} variant="filled" value={value} onChange={(e) => onChange(e.target.value)} invalid={invalid} aria-describedby={describedById} aria-required>
      <option value="">Select time slot (e.g., 09:00 AM - 09:30 AM)</option>
      {APPOINTMENT_RULES.timeSlots.map((t) => (
        <option key={t} value={t}>
          {formatSlot(t, APPOINTMENT_RULES.slotMinutes)}
        </option>
      ))}
    </Select>
  );
}

/** "Appointment Details" card from the Book an Appointment reference. */
export function BookingForm({
  defaultName,
  onSubmit,
}: {
  defaultName: string;
  onSubmit: (values: BookingValues) => void;
}) {
  const [values, setValues] = useState<BookingValues>({ purpose: "", date: "", time: "", residentName: defaultName, notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const { min, max } = bookableRange();

  const set = (k: keyof BookingValues, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs: typeof errors = { ...validateSchedule(values.date, values.time) };
    if (!values.purpose) errs.purpose = "Choose a service or purpose.";
    if (values.residentName.trim().split(/\s+/).length < 2) errs.residentName = "Enter your full name (first and last name).";
    if (values.notes.length > 300) errs.notes = "Keep notes under 300 characters.";
    setErrors(errs);
    const first = (["purpose", "date", "time", "residentName", "notes"] as const).find((k) => errs[k]);
    if (first) {
      document.getElementById(`apt-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    // Simulated network delay so the loading state is visible; replace with the API call.
    await new Promise((r) => setTimeout(r, 600));
    onSubmit({ ...values, residentName: values.residentName.trim(), notes: values.notes.trim() });
    setSubmitting(false);
    setValues({ purpose: "", date: "", time: "", residentName: defaultName, notes: "" });
  };

  return (
    <Card className="p-5 sm:p-9">
      <h2 className="text-2xl font-bold text-ink">Appointment Details</h2>
      <p className="mt-1 text-muted">Review your selected service and preferred schedule before confirming.</p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <Field id="apt-purpose" label="Service / Purpose" required error={errors.purpose}>
          <Select
            id="apt-purpose"
            variant="filled"
            value={values.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            invalid={!!errors.purpose}
            aria-describedby={describedBy("apt-purpose", errors.purpose)}
            aria-required
          >
            <option value="">Select service (e.g., Barangay Clearance, Indigency)</option>
            {APPOINTMENT_RULES.services.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field id="apt-date" label="Appointment Date" required error={errors.date} help="Monday to Friday, from tomorrow up to 30 days ahead (demo schedule).">
          <TextInput
            id="apt-date"
            type="date"
            variant="filled"
            min={min}
            max={max}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            invalid={!!errors.date}
            aria-describedby={describedBy("apt-date", errors.date, "help")}
            aria-required
          />
        </Field>
        <Field id="apt-time" label="Appointment Time" required error={errors.time}>
          <TimeSlotSelect
            id="apt-time"
            value={values.time}
            onChange={(v) => set("time", v)}
            invalid={!!errors.time}
            describedById={describedBy("apt-time", errors.time)}
          />
        </Field>
        <Field id="apt-residentName" label="Resident Name" required error={errors.residentName}>
          <IconInput
            id="apt-residentName"
            variant="filled"
            icon={<UserRound />}
            autoComplete="name"
            placeholder="Enter your full name (First Name, Last Name)"
            value={values.residentName}
            maxLength={100}
            onChange={(e) => set("residentName", e.target.value)}
            invalid={!!errors.residentName}
            aria-describedby={describedBy("apt-residentName", errors.residentName)}
            aria-required
          />
        </Field>
        <Field id="apt-notes" label="Notes for Staff" error={errors.notes}>
          <TextInput
            id="apt-notes"
            variant="filled"
            placeholder="e.g., Need a clearance for business permit renewal"
            value={values.notes}
            maxLength={300}
            onChange={(e) => set("notes", e.target.value)}
            invalid={!!errors.notes}
            aria-describedby={describedBy("apt-notes", errors.notes)}
          />
        </Field>

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted">{APPOINTMENT_RULES.arrivalNote}</p>
          <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="size-5 animate-spin" aria-hidden />
                Booking…
              </>
            ) : (
              "Confirm Appointment"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function RescheduleDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Reschedule appointment" description="Pick a new date and time. Staff will confirm the change.">
      {open && <RescheduleBody onCancel={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}

function RescheduleBody({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (date: string, time: string) => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"date" | "time", string>>>({});
  const { min, max } = bookableRange();

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateSchedule(date, time);
        setErrors(errs);
        if (errs.date) return document.getElementById("rs-date")?.focus();
        if (errs.time) return document.getElementById("rs-time")?.focus();
        onSubmit(date, time);
      }}
    >
      <Field id="rs-date" label="New date" required error={errors.date}>
        <TextInput
          id="rs-date"
          type="date"
          variant="filled"
          min={min}
          max={max}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          invalid={!!errors.date}
          aria-describedby={describedBy("rs-date", errors.date)}
          aria-required
        />
      </Field>
      <Field id="rs-time" label="New time" required error={errors.time}>
        <TimeSlotSelect id="rs-time" value={time} onChange={setTime} invalid={!!errors.time} describedById={describedBy("rs-time", errors.time)} />
      </Field>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Keep current time
        </Button>
        <Button type="submit">Request new schedule</Button>
      </div>
    </form>
  );
}
