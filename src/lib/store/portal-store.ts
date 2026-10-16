"use client";

/**
 * Shared client-side data store for the FRONTEND DEMONSTRATION.
 *
 * - One source of truth for requests, reports, appointments, announcements and
 *   notifications, shared by every page (Dashboard, My Requests, header bell…).
 * - Persisted to localStorage so data survives navigation and reloads.
 * - Every mutation below is SIMULATED. Each one maps 1:1 to a future API call
 *   (see the `// API:` comments) so the store can later be backed by a server.
 */

import { useSyncExternalStore } from "react";
import { APPOINTMENT_RULES } from "@/lib/config/appointments";
import { DEFAULT_PICKUP_INSTRUCTION, getService } from "@/lib/config/services";
import { createSeedData, type PortalData } from "@/lib/mock-data";
import type {
  ApplicantInfo,
  AppNotification,
  Appointment,
  CommunityCategory,
  CommunityReport,
  DocumentRequest,
  GeoLocation,
  PaymentMethod,
  PaymentStatus,
  ProfileIdDocument,
  ReportKind,
  ResidentProfile,
  ServiceId,
  SubmittedDetail,
  UploadedFileInfo,
} from "@/lib/types";
import { makeReference, uid } from "@/lib/utils";

const STORAGE_KEY = "baesa-portal-demo-v2";

let state: PortalData | null = null;
const listeners = new Set<() => void>();

function load(): PortalData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as PortalData;
      // Data saved before the My Profile page existed lacks the newer profile fields;
      // fill them from the sample profile so nothing the resident entered is lost.
      return { ...saved, resident: { ...createSeedData().resident, ...saved.resident } };
    }
  } catch {
    /* storage unavailable or corrupted — fall back to seed */
  }
  return createSeedData();
}

function persist(next: PortalData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Browser storage is small: if photos push it over the limit, keep their
    // file names but drop the image data, then try once more.
    try {
      const slim = { ...next, reports: next.reports.map((r) => (r.photo ? { ...r, photo: { name: r.photo.name } } : r)) };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* private mode or still too large: data stays in memory for this visit */
    }
  }
}

function getSnapshot(): PortalData | null {
  if (state === null && typeof window !== "undefined") state = load();
  return state;
}

function getServerSnapshot(): PortalData | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(mutator: (draft: PortalData) => PortalData) {
  const current = getSnapshot();
  if (!current) return;
  state = mutator(current);
  persist(state);
  listeners.forEach((l) => l());
}

function newNotification(n: Omit<AppNotification, "id" | "createdAt" | "read" | "tag"> & { tag?: AppNotification["tag"] }): AppNotification {
  return { tag: "New", ...n, id: uid(), createdAt: new Date().toISOString(), read: false };
}

/* ------------------------------- Hooks ------------------------------- */

/** Returns `null` until the client store has loaded (first client render). */
export function usePortalData(): PortalData | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------ Actions ------------------------------ */

export interface NewRequestInput {
  serviceId: ServiceId;
  applicant: ApplicantInfo;
  summary: string;
  details: SubmittedDetail[];
  validId: UploadedFileInfo;
  identityCheck: { method: "camera" | "upload" };
  /** Ignored when the service has no fee to collect online. */
  paymentMethod: PaymentMethod;
}

/** Works out what the resident owes and the honest payment status (no payment is ever marked paid here). */
export function paymentFor(serviceId: ServiceId, method: PaymentMethod): { method: PaymentMethod; status: PaymentStatus } {
  const service = getService(serviceId);
  const amount = service?.fee.amount;
  if (amount === null || amount === undefined) return { method: "none", status: "To be assessed" };
  if (amount === 0 || !service?.takesPayment) return { method: "none", status: "Not required" };
  if (method === "face-to-face") return { method, status: "Pay at barangay hall" };
  return { method, status: "Awaiting online payment" };
}

export function submitDocumentRequest(input: NewRequestInput): DocumentRequest {
  // API: POST /api/resident/requests (multipart: form fields + valid ID + verification photo)
  const service = getService(input.serviceId);
  if (!service) throw new Error(`Unknown service ${input.serviceId}`);
  const now = new Date();
  const request: DocumentRequest = {
    id: uid(),
    referenceNo: makeReference("REQ", now),
    serviceId: service.id,
    serviceName: service.name,
    applicant: input.applicant,
    summary: input.summary,
    details: input.details,
    validId: input.validId,
    identityCheck: { method: input.identityCheck.method, capturedAt: now.toISOString() },
    fee: {
      lines: service.fee.amount !== null ? [{ label: `${service.name} fee`, amount: service.fee.amount }] : [],
      total: service.fee.amount,
      label: service.fee.label,
      isSample: service.fee.isSample,
    },
    payment: paymentFor(service.id, input.paymentMethod),
    submittedAt: now.toISOString(),
    status: "Pending",
    remarks: DEFAULT_PICKUP_INSTRUCTION,
    history: [{ status: "Pending", date: now.toISOString(), note: "Request submitted." }],
  };
  update((d) => ({
    ...d,
    requests: [request, ...d.requests],
    notifications: [
      newNotification({
        type: "request",
        title: "Request submitted",
        message: `${service.name} request ${request.referenceNo} was received and is pending review.`,
        href: `/my-requests?ref=${request.referenceNo}`,
      }),
      ...d.notifications,
    ],
  }));
  return request;
}

export interface NewReportInput {
  kind: ReportKind;
  category: CommunityCategory;
  otherCategory?: string;
  title: string;
  description: string;
  photo?: { name: string; dataUrl?: string };
  location: GeoLocation;
}

export function submitCommunityReport(input: NewReportInput): CommunityReport {
  // API: POST /api/resident/reports (multipart, with optional photo)
  const now = new Date();
  const report: CommunityReport = {
    ...input,
    id: uid(),
    referenceNo: makeReference("RPT", now),
    submittedAt: now.toISOString(),
    status: "Pending",
    isMine: true,
    updates: [{ date: now.toISOString(), note: "Report submitted." }],
  };
  update((d) => ({
    ...d,
    reports: [report, ...d.reports],
    notifications: [
      newNotification({
        type: "report",
        title: `${input.kind} submitted`,
        message: `Your ${input.kind.toLowerCase()} "${input.title}" (${report.referenceNo}) was received.`,
        href: "/community-reports?tab=mine",
      }),
      ...d.notifications,
    ],
  }));
  return report;
}

export interface NewAppointmentInput {
  purpose: string;
  residentName: string;
  date: string;
  time: string;
  notes?: string;
}

export function requestAppointment(input: NewAppointmentInput): Appointment {
  // API: POST /api/resident/appointments
  const now = new Date().toISOString();
  const appt: Appointment = {
    ...input,
    id: uid(),
    referenceNo: makeReference("APT"),
    status: "Pending",
    createdAt: now,
    history: [{ date: now, note: "Appointment requested." }],
  };
  update((d) => ({
    ...d,
    appointments: [appt, ...d.appointments],
    notifications: [
      newNotification({
        type: "appointment",
        tag: "Updated",
        title: "Appointment requested",
        message: `Your appointment request ${appt.referenceNo} was received and is awaiting confirmation.`,
        href: "/appointments",
      }),
      ...d.notifications,
    ],
  }));
  return appt;
}

/** Whether the configured rules allow the resident to cancel/reschedule. */
export function canChangeAppointment(appt: Appointment, now = new Date()): { allowed: boolean; reason?: string } {
  const statuses: readonly string[] = APPOINTMENT_RULES.changeableStatuses;
  if (!statuses.includes(appt.status)) {
    return { allowed: false, reason: `${appt.status} appointments can no longer be changed.` };
  }
  const [y, m, d] = appt.date.split("-").map(Number);
  const [hh, mm] = appt.time.split(":").map(Number);
  const slot = new Date(y, m - 1, d, hh, mm);
  const hoursLeft = (slot.getTime() - now.getTime()) / 3_600_000;
  if (hoursLeft < APPOINTMENT_RULES.minHoursBeforeChange) {
    return {
      allowed: false,
      reason: `Changes must be made at least ${APPOINTMENT_RULES.minHoursBeforeChange} hours before the appointment.`,
    };
  }
  return { allowed: true };
}

export function cancelAppointment(id: string) {
  // API: POST /api/resident/appointments/:id/cancel
  const now = new Date().toISOString();
  update((d) => ({
    ...d,
    appointments: d.appointments.map((a) =>
      a.id === id
        ? { ...a, status: "Cancelled", history: [...a.history, { date: now, note: "Cancelled by resident." }] }
        : a,
    ),
    notifications: [
      newNotification({
        type: "appointment",
        tag: "Updated",
        title: "Appointment cancelled",
        message: "Your appointment was cancelled.",
        href: "/appointments",
      }),
      ...d.notifications,
    ],
  }));
}

export function rescheduleAppointment(id: string, date: string, time: string) {
  // API: POST /api/resident/appointments/:id/reschedule
  const now = new Date().toISOString();
  update((d) => ({
    ...d,
    appointments: d.appointments.map((a) =>
      a.id === id
        ? {
            ...a,
            date,
            time,
            status: "Pending",
            history: [...a.history, { date: now, note: `Reschedule requested for ${date} ${time}. Awaiting confirmation.` }],
          }
        : a,
    ),
    notifications: [
      newNotification({
        type: "appointment",
        tag: "Updated",
        title: "Reschedule requested",
        message: "Your new appointment schedule is awaiting confirmation.",
        href: "/appointments",
      }),
      ...d.notifications,
    ],
  }));
}

export function markNotificationRead(id: string, read = true) {
  // API: PATCH /api/resident/notifications/:id
  update((d) => ({
    ...d,
    notifications: d.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
  }));
}

export function markAllNotificationsRead() {
  // API: POST /api/resident/notifications/read-all
  update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
}

/* ------------------------------- Profile ------------------------------- */

export type ProfilePatch = Partial<Omit<ResidentProfile, "id" | "residentId" | "memberSince">>;

export function updateProfile(patch: ProfilePatch, message = "Your profile details were updated.") {
  // API: PATCH /api/resident/profile
  update((d) => ({
    ...d,
    resident: { ...d.resident, ...patch },
    notifications: [
      newNotification({ type: "request", tag: "Updated", title: "Profile updated", message, href: "/profile" }),
      ...d.notifications,
    ],
  }));
}

export function setProfilePhoto(photoDataUrl: string | undefined) {
  // API: PUT /api/resident/profile/photo
  update((d) => ({ ...d, resident: { ...d.resident, photoDataUrl } }));
}

export function setProfileValidId(validId: ProfileIdDocument | undefined) {
  // API: PUT /api/resident/profile/valid-id (multipart)
  update((d) => ({
    ...d,
    resident: { ...d.resident, validId },
    notifications: validId
      ? [
          newNotification({
            type: "request",
            tag: "Updated",
            title: "Valid ID uploaded",
            message: `${validId.idType} (${validId.fileName}) was added to your profile.`,
            href: "/profile",
          }),
          ...d.notifications,
        ]
      : d.notifications,
  }));
}

export function resetDemoData() {
  state = createSeedData();
  persist(state);
  listeners.forEach((l) => l());
}
