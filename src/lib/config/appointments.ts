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
  /** Services residents can pick. The first four mirror the certificates in Document Request. */
  services: [
    "Barangay Clearance",
    "Barangay Indigency",
    "Barangay Residency",
    "First-Time Job Seeker Certificate",
    "Document pickup",
    "Consultation with barangay official",
    "Lupon / mediation concern",
    "Other",
  ],
  /** 30-minute slots (start times, 24h). Demo list — not official office hours. */
  timeSlots: [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ],
  slotMinutes: 30,
  /** Days of week that can be booked (0 = Sun). Demo: Mon–Fri. */
  bookableWeekdays: [1, 2, 3, 4, 5],
  /** Earliest bookable day, counted from today (1 = tomorrow, so past dates and today are blocked). */
  minDaysAhead: 1,
  maxDaysAhead: 30,
  /** Statuses that a resident may cancel or reschedule. */
  changeableStatuses: ["Pending", "Confirmed"] as const,
  /** Changes must be made at least this many hours before the slot. Demo value. */
  minHoursBeforeChange: 24,
  /** Shown under the booking form (from the design reference). */
  arrivalNote: "Please arrive 15 minutes before your scheduled time.",
};
