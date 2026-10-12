"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextArea, TextInput, describedBy } from "@/components/ui/FormControls";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { formatTime, toYMD } from "@/lib/utils";

export interface AppointmentFormValues {
  purpose: string;
  date: string;
  time: string;
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
  if (!date) errors.date = "Please choose a date.";
  else if (date < min || date > max) errors.date = `Choose a date between ${min} and ${max}.`;
  else {
    const [y, m, d] = date.split("-").map(Number);
    if (!APPOINTMENT_RULES.bookableWeekdays.includes(new Date(y, m - 1, d).getDay()))
      errors.date = "This day is not available for booking (demo schedule: weekdays only).";
  }
  if (!time) errors.time = "Please choose a time.";
  return errors;
}

/** Used for both new appointments (mode "new") and rescheduling (mode "reschedule"). */
export function AppointmentFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "new" | "reschedule";
  initial?: Partial<AppointmentFormValues>;
  onClose: () => void;
  onSubmit: (values: AppointmentFormValues) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "new" ? "Request an appointment" : "Reschedule appointment"}
      description="Demo schedule — official office hours and availability have not been configured yet."
    >
      {/* Re-mount the form each time the dialog opens so it starts fresh. */}
      {open && <FormBody mode={mode} initial={initial} onCancel={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}

function FormBody({
  mode,
  initial,
  onCancel,
  onSubmit,
}: {
  mode: "new" | "reschedule";
  initial?: Partial<AppointmentFormValues>;
  onCancel: () => void;
  onSubmit: (values: AppointmentFormValues) => void;
}) {
  const [values, setValues] = useState<AppointmentFormValues>({
    purpose: initial?.purpose ?? "",
    date: "",
    time: "",
    notes: initial?.notes ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormValues, string>>>({});
  const { min, max } = bookableRange();

  const set = (k: keyof AppointmentFormValues, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = { ...validateSchedule(values.date, values.time) };
    if (mode === "new" && !values.purpose) errs.purpose = "Please choose a purpose.";
    if (values.notes.length > 500) errs.notes = "Please keep notes under 500 characters.";
    setErrors(errs);
    const first = (["purpose", "date", "time", "notes"] as const).find((k) => errs[k]);
    if (first) {
      document.getElementById(`apt-${first}`)?.focus();
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {mode === "new" && (
        <Field id="apt-purpose" label="Purpose" required error={errors.purpose}>
          <Select
            id="apt-purpose"
            value={values.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            invalid={!!errors.purpose}
            aria-describedby={describedBy("apt-purpose", errors.purpose)}
            aria-required
          >
            <option value="">Select a purpose</option>
            {APPOINTMENT_RULES.purposes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apt-date" label={mode === "new" ? "Date" : "New date"} required error={errors.date}>
          <TextInput
            id="apt-date"
            type="date"
            min={min}
            max={max}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            invalid={!!errors.date}
            aria-describedby={describedBy("apt-date", errors.date)}
            aria-required
          />
        </Field>
        <Field id="apt-time" label={mode === "new" ? "Time" : "New time"} required error={errors.time}>
          <Select
            id="apt-time"
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            invalid={!!errors.time}
            aria-describedby={describedBy("apt-time", errors.time)}
            aria-required
          >
            <option value="">Select a time</option>
            {APPOINTMENT_RULES.timeSlots.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {mode === "new" && (
        <Field id="apt-notes" label="Notes (optional)" error={errors.notes} help="Anything staff should know beforehand.">
          <TextArea
            id="apt-notes"
            value={values.notes}
            maxLength={500}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            aria-describedby={describedBy("apt-notes", errors.notes, "help")}
          />
        </Field>
      )}
      <p className="text-xs text-muted">Requests are subject to confirmation by barangay staff.</p>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === "new" ? "Submit request" : "Request new schedule"}</Button>
      </div>
    </form>
  );
}
