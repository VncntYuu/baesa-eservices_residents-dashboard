/**
 * Shared domain types for the Residents Portal.
 * These mirror the shapes a future backend/API is expected to return,
 * so the mock store can later be swapped for real API calls.
 */

export type ISODateString = string;

/* ----------------------------- Resident ----------------------------- */

export interface ResidentProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  contactNumber: string;
  address: string;
  purok: string;
  birthDate: ISODateString;
  civilStatus: string;
}

/* ------------------------- Document requests ------------------------ */

export type RequestStatus = "Pending" | "In Progress" | "Completed" | "Rejected";

export type ServiceId =
  | "barangay-clearance"
  | "barangay-indigency"
  | "barangay-residency"
  | "first-time-job-seeker"
  | "burial-assistance"
  | "donation-assistance";

export type ServiceGroup = "certificate" | "assistance";

export interface StatusHistoryEntry {
  status: RequestStatus;
  date: ISODateString;
  note: string;
}

export interface DocumentRequest {
  id: string;
  referenceNo: string;
  serviceId: ServiceId;
  serviceName: string;
  purpose: string;
  /** Service-specific answers keyed by field id (see config/services.ts). */
  details: Record<string, string>;
  attachments: string[];
  submittedAt: ISODateString;
  status: RequestStatus;
  feeLabel: string;
  completedAt?: ISODateString;
  remarks?: string;
  history: StatusHistoryEntry[];
}

/* ------------------------- Community reports ------------------------ */

export type ReportCategory =
  | "Garbage"
  | "Drainage"
  | "Streetlight"
  | "Road Hazard"
  | "Others";

export type ReportKind = "Complaint" | "Report";

export type ReportStatus = "Submitted" | "In Progress" | "Resolved";

export interface GeoLocation {
  label: string;
  lat: number;
  lng: number;
}

export interface CommunityReport {
  id: string;
  referenceNo: string;
  kind: ReportKind;
  category: ReportCategory;
  title: string;
  description: string;
  /** File name only; the image itself is not persisted in the demo. */
  photoName?: string;
  location: GeoLocation;
  submittedAt: ISODateString;
  status: ReportStatus;
  /** true when filed by the signed-in resident. */
  isMine: boolean;
  updates: { date: ISODateString; note: string }[];
}

/* --------------------------- Appointments --------------------------- */

export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  referenceNo: string;
  purpose: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  status: AppointmentStatus;
  createdAt: ISODateString;
  history: { date: ISODateString; note: string }[];
}

/* --------------------------- Announcements -------------------------- */

export type AnnouncementCategory = "News" | "Event" | "Advisory" | "Health";

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  publishedAt: ISODateString;
  summary: string;
  body: string;
  important?: boolean;
}

/* --------------------------- Notifications -------------------------- */

export type NotificationType = "request" | "report" | "appointment" | "announcement";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: ISODateString;
  read: boolean;
  href?: string;
}
