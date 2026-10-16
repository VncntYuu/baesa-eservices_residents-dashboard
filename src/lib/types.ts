/**
 * Shared domain types for the Residents Portal.
 * These mirror the shapes a future backend/API is expected to return,
 * so the demo store can later be swapped for real API calls.
 */

export type ISODateString = string;

/* ----------------------------- Resident ----------------------------- */

export interface ProfileIdDocument {
  /** e.g. "Driver's License" */
  idType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: ISODateString;
  /** Downscaled image kept in this browser for the demo (not kept for PDFs). */
  previewDataUrl?: string;
}

export interface ResidentProfile {
  id: string;
  /** Barangay-issued resident number (sample). */
  residentId: string;
  memberSince: ISODateString;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  sex: string;
  nationality: string;
  email: string;
  contactNumber: string;
  address: string;
  purok: string;
  /** Whole years living in the barangay, as typed (e.g. "5"). */
  yearsOfResidency: string;
  registeredVoter: "Yes" | "No" | "";
  birthDate: string; // YYYY-MM-DD
  civilStatus: string;
  /** Small profile photo kept in this browser for the demo. */
  photoDataUrl?: string;
  validId?: ProfileIdDocument;
}

/* ------------------------- Document requests ------------------------ */

export type RequestStatus = "Pending" | "In Progress" | "Completed" | "Rejected";

export type CertificateId =
  | "barangay-clearance"
  | "barangay-indigency"
  | "barangay-residency"
  | "first-time-job-seeker";

export type AssistanceId = "burial-assistance" | "donation-assistance";
export type ServiceId = CertificateId | AssistanceId;
export type ServiceGroup = "certificate" | "assistance";

/** Personal details typed into the request form (may differ from the profile). */
export interface ApplicantInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string; // YYYY-MM-DD
  mobile: string;
  address: string;
}

/** A labelled answer from the service-specific part of the form. */
export interface SubmittedDetail {
  label: string;
  value: string;
}

export interface UploadedFileInfo {
  name: string;
  type: string;
  size: number;
}

export type PaymentMethod = "gcash" | "maya" | "paypal" | "face-to-face" | "none";

/**
 * There is no payment integration: the portal never marks a payment as paid
 * by itself. "Paid" only appears on sample data to show how a staff-confirmed
 * payment would look.
 */
export type PaymentStatus = "Not required" | "Awaiting online payment" | "Pay at barangay hall" | "To be assessed" | "Paid";

export interface FeeLine {
  label: string;
  amount: number;
}

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
  applicant: ApplicantInfo;
  /** One-line summary used in lists (e.g. the purpose). */
  summary: string;
  details: SubmittedDetail[];
  validId?: UploadedFileInfo;
  identityCheck?: { method: "camera" | "upload"; capturedAt: ISODateString };
  fee: { lines: FeeLine[]; total: number | null; label: string; isSample: boolean };
  payment: { method: PaymentMethod; status: PaymentStatus };
  submittedAt: ISODateString;
  status: RequestStatus;
  approvedAt?: ISODateString;
  remarks?: string;
  history: StatusHistoryEntry[];
}

/* ------------------------- Community reports ------------------------ */

export type ReportKind = "Complaint" | "Report";

export type ComplaintCategory =
  | "Garbage Collection"
  | "Noise Complaint"
  | "Drainage Problem"
  | "Illegal Parking"
  | "Other Complaint";

export type ReportCategory =
  | "Road Hazard"
  | "Broken Streetlight"
  | "Flooding"
  | "Damaged Public Property"
  | "Other Report";

export type CommunityCategory = ComplaintCategory | ReportCategory;

export type ReportStatus = "Pending" | "In Progress" | "Resolved";

export interface GeoLocation {
  /** Street or place name. */
  label: string;
  /** Secondary area line, e.g. "Purok 3". */
  area?: string;
  lat: number;
  lng: number;
}

export interface CommunityReport {
  id: string;
  referenceNo: string;
  kind: ReportKind;
  category: CommunityCategory;
  /** Filled when the resident chose "Other" and described it. */
  otherCategory?: string;
  title: string;
  description: string;
  /** Downscaled photo kept in this browser for the demo. */
  photo?: { name: string; dataUrl?: string };
  location: GeoLocation;
  submittedAt: ISODateString;
  status: ReportStatus;
  /** true when filed by the signed-in resident. */
  isMine: boolean;
  /** Sample entries use demonstration coordinates, not real incident locations. */
  isSample?: boolean;
  updates: { date: ISODateString; note: string }[];
}

/* --------------------------- Appointments --------------------------- */

export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  referenceNo: string;
  purpose: string;
  residentName: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (start of slot, 24h)
  status: AppointmentStatus;
  createdAt: ISODateString;
  history: { date: ISODateString; note: string }[];
}

/* --------------------------- Announcements -------------------------- */

export type AnnouncementCategory = "Alert" | "News" | "Event";

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  /** "urgent" and "featured" items appear under Urgent Alerts. */
  priority: "urgent" | "featured" | "normal";
  /** Short label shown in the pill, e.g. "Flood Alert". */
  tag?: string;
  publishedAt: ISODateString;
  summary: string;
  body: string;
  imageUrl?: string;
}

/* --------------------------- Notifications -------------------------- */

export type NotificationType = "request" | "report" | "appointment" | "announcement";
export type NotificationTag = "New" | "Urgent" | "Updated" | "Reminder";

export interface AppNotification {
  id: string;
  type: NotificationType;
  /** Badge shown while unread; read notifications show "Read". */
  tag: NotificationTag;
  title: string;
  message: string;
  createdAt: ISODateString;
  read: boolean;
  href?: string;
}
