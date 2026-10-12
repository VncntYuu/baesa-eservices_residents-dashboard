/**
 * Appointment rules.
 *
 * ⚠️ DEMONSTRATION VALUES — the barangay has not yet provided official
 * office hours, service availability, or cancellation/rescheduling policies.
 * Everything below is a placeholder so the UI can be exercised. Replace these
 * values (or load them from the backend) once the actual rules are known.
 */

export const APPOINTMENT_RULES = {
  isDemo: true,
  /** Purposes residents can pick. Demo list. */
  purposes: [
    "Document pickup",
    "Consultation with barangay official",
    "Lupon / mediation concern",
    "Health center visit",
    "Other",
  ],
  /** Selectable time slots (24h). Demo list — not official office hours. */
  timeSlots: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
  /** Days of week that can be booked (0 = Sun). Demo: Mon–Fri. */
  bookableWeekdays: [1, 2, 3, 4, 5],
  /** Earliest bookable day, counted from today. */
  minDaysAhead: 1,
  /** Furthest bookable day, counted from today. */
  maxDaysAhead: 30,
  /** Statuses that a resident may cancel or reschedule. */
  changeableStatuses: ["Pending", "Confirmed"] as const,
  /** Changes must be made at least this many hours before the slot. Demo value. */
  minHoursBeforeChange: 24,
};
