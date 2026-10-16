/**
 * SAMPLE DATA for the frontend demonstration.
 *
 * Nothing in this file is official barangay information. Titles and labels follow
 * the design references; dates are generated relative to "now" so the demo always
 * looks current. Community report coordinates are DEMONSTRATION positions placed
 * around the barangay centre, not real incident locations.
 * The store keeps this in localStorage; replace with API responses when a backend exists.
 */
import { MAP_CONFIG } from "@/lib/config/reports";
import { DEFAULT_PICKUP_INSTRUCTION, getService } from "@/lib/config/services";
import type {
  Announcement,
  AppNotification,
  Appointment,
  ApplicantInfo,
  CommunityCategory,
  CommunityReport,
  DocumentRequest,
  PaymentMethod,
  PaymentStatus,
  ReportKind,
  ReportStatus,
  RequestStatus,
  ResidentProfile,
  ServiceId,
  SubmittedDetail,
} from "@/lib/types";
import { toYMD } from "@/lib/utils";

export interface PortalData {
  resident: ResidentProfile;
  requests: DocumentRequest[];
  reports: CommunityReport[];
  appointments: Appointment[];
  announcements: Announcement[];
  notifications: AppNotification[];
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function createSeedData(now = new Date()): PortalData {
  const t = now.getTime();
  const ago = (ms: number) => new Date(t - ms).toISOString();
  const weekday = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + (days >= 0 ? 1 : -1));
    return toYMD(d);
  };

  // Sample resident (values follow the My Profile design reference).
  const resident: ResidentProfile = {
    id: "res-0001",
    residentId: "BAESA-2026-00127",
    memberSince: "2026-01-12T09:00:00+08:00",
    firstName: "Maria",
    middleName: "Reyes",
    lastName: "Santos",
    suffix: "",
    sex: "Female",
    nationality: "Filipino",
    email: "maria.santos@example.com",
    contactNumber: "+63 917 123 4567",
    address: "24 Sampaguita Street, Barangay Baesa, Quezon City",
    purok: "Purok 2",
    yearsOfResidency: "5",
    registeredVoter: "Yes",
    birthDate: "1994-03-14",
    civilStatus: "Single",
    validId: {
      idType: "Driver's License",
      fileName: "valid_id.jpg",
      mimeType: "image/jpeg",
      size: 412_000,
      uploadedAt: "2026-05-05T10:00:00+08:00",
    },
  };

  const applicant: ApplicantInfo = {
    firstName: resident.firstName,
    middleName: resident.middleName ?? "",
    lastName: resident.lastName,
    suffix: "",
    birthDate: resident.birthDate,
    mobile: resident.contactNumber,
    address: resident.address,
  };

  /* --------------------------- Document requests --------------------------- */

  let refSeq = 1040;
  const req = (
    serviceId: ServiceId,
    summary: string,
    details: SubmittedDetail[],
    submittedDaysAgo: number,
    status: RequestStatus,
    payment: { method: PaymentMethod; status: PaymentStatus },
    opts: { approvedDaysAgo?: number; remarks?: string; withId?: boolean } = {},
  ): DocumentRequest => {
    const service = getService(serviceId)!;
    const submittedAt = ago(submittedDaysAgo * DAY + 3 * HOUR);
    const history: DocumentRequest["history"] = [{ status: "Pending", date: submittedAt, note: "Request submitted." }];
    if (status !== "Pending" && status !== "Rejected")
      history.push({ status: "In Progress", date: ago((submittedDaysAgo - 1) * DAY), note: "Being reviewed by barangay staff (sample)." });
    if (status === "Completed")
      history.push({ status: "Completed", date: ago((opts.approvedDaysAgo ?? 0) * DAY), note: "Approved and ready for pickup (sample)." });
    if (status === "Rejected")
      history.push({ status: "Rejected", date: ago((submittedDaysAgo - 2) * DAY), note: "Submitted details could not be verified (sample)." });
    refSeq += 1;
    return {
      id: `req-${refSeq}`,
      referenceNo: `DR-2026-${refSeq}`,
      serviceId,
      serviceName: service.name,
      applicant,
      summary,
      details,
      validId: opts.withId === false ? undefined : { name: "valid-id.jpg", type: "image/jpeg", size: 412_000 },
      identityCheck: { method: "camera", capturedAt: submittedAt },
      fee: {
        lines: service.fee.amount !== null ? [{ label: `${service.name} fee`, amount: service.fee.amount }] : [],
        total: service.fee.amount,
        label: service.fee.label,
        isSample: service.fee.isSample,
      },
      payment,
      submittedAt,
      status,
      approvedAt: status === "Completed" ? ago((opts.approvedDaysAgo ?? 0) * DAY) : undefined,
      remarks: opts.remarks ?? DEFAULT_PICKUP_INSTRUCTION,
      history,
    };
  };

  const requests: DocumentRequest[] = [
    req("barangay-clearance", "Employment", [{ label: "Purpose of Request", value: "Employment" }], 1, "Pending", {
      method: "gcash",
      status: "Awaiting online payment",
    }),
    req("barangay-residency", "Resident for 10 years or more", [{ label: "How long have you been a resident?", value: "10 years or more" }], 2, "Pending", {
      method: "face-to-face",
      status: "Pay at barangay hall",
    }),
    req(
      "first-time-job-seeker",
      "Senior High School graduate",
      [
        { label: "Highest Education Level", value: "Senior High School graduate" },
        { label: "Skills or Interests", value: "Customer service, basic computer skills" },
      ],
      3,
      "Pending",
      { method: "none", status: "Not required" },
    ),
    req("barangay-clearance", "Banking & Loans", [{ label: "Purpose of Request", value: "Banking & Loans" }], 4, "In Progress", {
      method: "face-to-face",
      status: "Pay at barangay hall",
    }),
    req(
      "barangay-indigency",
      "Family of 5",
      [
        { label: "Number of Family Members", value: "5" },
        { label: "Monthly Income (₱)", value: "₱9,500" },
      ],
      6,
      "In Progress",
      { method: "maya", status: "Awaiting online payment" },
    ),
    req("barangay-residency", "Resident for 5 to less than 10 years", [{ label: "How long have you been a resident?", value: "5 to less than 10 years" }], 8, "Completed", {
      method: "face-to-face",
      status: "Paid",
    }, { approvedDaysAgo: 1 }),
    req(
      "barangay-indigency",
      "Family of 5",
      [
        { label: "Number of Family Members", value: "5" },
        { label: "Monthly Income (₱)", value: "₱9,500" },
      ],
      30,
      "Completed",
      { method: "face-to-face", status: "Paid" },
      { approvedDaysAgo: 27 },
    ),
    req("barangay-clearance", "Government IDs", [{ label: "Purpose of Request", value: "Government IDs" }], 40, "Rejected", {
      method: "face-to-face",
      status: "Pay at barangay hall",
    }, { remarks: "Sample remark: submitted details could not be verified. Please visit the barangay hall." }),
  ];

  /* ---------------------------- Community reports --------------------------- */

  const { lat: cLat, lng: cLng } = MAP_CONFIG.center;
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((cLat * Math.PI) / 180);
  const at = (dx: number, dy: number) => ({
    lat: +(cLat + dy / mPerDegLat).toFixed(6),
    lng: +(cLng + dx / mPerDegLng).toFixed(6),
  });

  type Seed = [
    title: string,
    kind: ReportKind,
    category: CommunityCategory,
    street: string,
    purok: string,
    dx: number,
    dy: number,
    hoursAgo: number,
    status: ReportStatus,
  ];

  // The resident's own reports (titles from the My Reports reference).
  const mine: Seed[] = [
    ["Uncollected garbage along Ramos St.", "Complaint", "Garbage Collection", "Ramos Street", "Purok 3", -170, -190, 3 * 24, "Pending"],
    ["Streetlight not working near chapel", "Report", "Broken Streetlight", "Baesa Road", "Purok 2", 210, 160, 4 * 24, "In Progress"],
    ["Clogged drainage after heavy rain", "Complaint", "Drainage Problem", "Reparo Road", "Purok 4", 230, -170, 5 * 24, "In Progress"],
    ["Damaged pavement by the market", "Report", "Road Hazard", "Baesa Road", "Purok 1", -250, 170, 7 * 24, "Pending"],
    ["Illegal dumping in vacant lot", "Complaint", "Garbage Collection", "Ramos Street", "Purok 3", -120, -240, 9 * 24, "Resolved"],
    ["Fallen branches blocking sidewalk", "Report", "Other Report", "Quirino Highway", "Purok 1", -320, 240, 11 * 24, "Resolved"],
    ["Loud karaoke past midnight", "Complaint", "Noise Complaint", "Ramos Street", "Purok 3", -90, -150, 13 * 24, "Resolved"],
    ["Flooded street corner after rain", "Report", "Flooding", "Reparo Road", "Purok 4", 280, -240, 15 * 24, "Resolved"],
    ["Vehicles parked on the sidewalk", "Complaint", "Illegal Parking", "Baesa Road", "Purok 2", 150, 110, 17 * 24, "Resolved"],
    ["Broken bench at the covered court", "Report", "Damaged Public Property", "Baesa Road", "Purok 2", 90, 60, 19 * 24, "Resolved"],
    ["Open canal cover near the school", "Report", "Road Hazard", "Reparo Road", "Purok 4", 330, -110, 22 * 24, "Resolved"],
    ["Garbage not collected on schedule", "Complaint", "Garbage Collection", "Ramos Street", "Purok 3", -200, -120, 25 * 24, "Resolved"],
  ];

  // Other residents' reports (shown on the Community Map only).
  const others: Seed[] = [
    ["Overflowing trash bin", "Complaint", "Garbage Collection", "Baesa Road", "Purok 2", 190, 175, 10, "Pending"],
    ["Garbage pile on sidewalk", "Complaint", "Garbage Collection", "Baesa Road", "Purok 2", 225, 150, 30, "Pending"],
    ["Uncollected garbage bags", "Complaint", "Garbage Collection", "Baesa Road", "Purok 2", 260, 195, 50, "In Progress"],
    ["Burning of trash", "Complaint", "Garbage Collection", "Quirino Highway", "Purok 1", -280, 120, 80, "Pending"],
    ["Canal overflowing", "Complaint", "Drainage Problem", "Ramos Street", "Purok 3", -150, -210, 6, "In Progress"],
    ["Water not draining", "Complaint", "Drainage Problem", "Ramos Street", "Purok 3", -185, -175, 20, "Pending"],
    ["Videoke noise every night", "Complaint", "Noise Complaint", "Reparo Road", "Purok 4", 200, -260, 36, "Pending"],
    ["Double parking blocks the road", "Complaint", "Illegal Parking", "Baesa Road", "Purok 1", -60, 290, 70, "Pending"],
    ["Streetlight flickering", "Report", "Broken Streetlight", "Quirino Highway", "Purok 1", -300, 210, 14, "Pending"],
    ["Dark corner, no lighting", "Report", "Broken Streetlight", "Reparo Road", "Purok 4", 380, -60, 96, "In Progress"],
    ["Pothole on main road", "Report", "Road Hazard", "Reparo Road", "Purok 4", 140, -280, 8, "Pending"],
    ["Deep pothole near corner", "Report", "Road Hazard", "Reparo Road", "Purok 4", 160, -300, 26, "In Progress"],
    ["Knee-deep flooding", "Report", "Flooding", "Ramos Street", "Purok 3", -40, -320, 40, "Pending"],
    ["Vandalized waiting shed", "Report", "Damaged Public Property", "Baesa Road", "Purok 2", 60, 230, 120, "Pending"],
  ];

  const build = (s: Seed, i: number, isMine: boolean): CommunityReport => {
    const [title, kind, category, street, purok, dx, dy, hoursAgo, status] = s;
    const submittedAt = ago(hoursAgo * HOUR);
    const updates = [{ date: submittedAt, note: "Report submitted." }];
    if (status !== "Pending") updates.push({ date: ago((hoursAgo - 12) * HOUR), note: "Forwarded to the barangay team for follow-up (sample)." });
    if (status === "Resolved") updates.push({ date: ago((hoursAgo - 48) * HOUR), note: "Marked as resolved (sample)." });
    return {
      id: `${isMine ? "rpt-m" : "rpt-o"}${i + 1}`,
      referenceNo: `RPT-2026-${String(isMine ? 128 - i * 3 : 200 + i).padStart(4, "0")}`,
      kind,
      category,
      title,
      description: isMine
        ? `${title}. Sample report for the frontend demonstration.`
        : "Sample community report for the demonstration map.",
      location: { label: street, area: purok, ...at(dx, dy) },
      submittedAt,
      status,
      isMine,
      isSample: true,
      updates,
    };
  };

  const reports: CommunityReport[] = [...mine.map((s, i) => build(s, i, true)), ...others.map((s, i) => build(s, i, false))];

  /* ------------------------------ Appointments ------------------------------ */

  const residentName = `${resident.firstName} ${resident.lastName}`;
  const appointments: Appointment[] = [
    {
      id: "apt-1",
      referenceNo: "APT-2026-0311",
      purpose: "Consultation with barangay official",
      residentName,
      notes: "Meeting with the Barangay Secretary.",
      date: weekday(1),
      time: "10:00",
      status: "Confirmed",
      createdAt: ago(5 * DAY),
      history: [
        { date: ago(5 * DAY), note: "Appointment requested." },
        { date: ago(4 * DAY), note: "Appointment confirmed (sample)." },
      ],
    },
    {
      id: "apt-2",
      referenceNo: "APT-2026-0318",
      purpose: "Barangay Clearance",
      residentName,
      notes: "Need a clearance for business permit renewal.",
      date: weekday(6),
      time: "14:00",
      status: "Confirmed",
      createdAt: ago(6 * DAY),
      history: [
        { date: ago(6 * DAY), note: "Appointment requested." },
        { date: ago(3 * DAY), note: "Rescheduled by barangay staff (sample)." },
      ],
    },
    {
      id: "apt-3",
      referenceNo: "APT-2026-0325",
      purpose: "Document pickup",
      residentName,
      date: weekday(9),
      time: "09:00",
      status: "Pending",
      createdAt: ago(5 * HOUR),
      history: [{ date: ago(5 * HOUR), note: "Appointment requested." }],
    },
    {
      id: "apt-4",
      referenceNo: "APT-2026-0280",
      purpose: "Barangay Indigency",
      residentName,
      date: weekday(-12),
      time: "09:30",
      status: "Completed",
      createdAt: ago(20 * DAY),
      history: [
        { date: ago(20 * DAY), note: "Appointment requested." },
        { date: ago(19 * DAY), note: "Appointment confirmed (sample)." },
        { date: ago(12 * DAY), note: "Appointment completed." },
      ],
    },
    {
      id: "apt-5",
      referenceNo: "APT-2026-0251",
      purpose: "Lupon / mediation concern",
      residentName,
      date: weekday(-25),
      time: "13:00",
      status: "Cancelled",
      createdAt: ago(30 * DAY),
      history: [
        { date: ago(30 * DAY), note: "Appointment requested." },
        { date: ago(27 * DAY), note: "Cancelled by resident." },
      ],
    },
  ];

  /* ------------------------------ Announcements ----------------------------- */

  const sampleNote =
    "This is sample text for the frontend demonstration. The barangay office will publish the official announcement here once the announcements backend is connected.";

  const announcements: Announcement[] = [
    {
      id: "ann-baha-purok-4",
      title: "Baha sa Purok 4",
      category: "Alert",
      priority: "urgent",
      tag: "Flood Alert",
      publishedAt: ago(3 * HOUR),
      summary: "Sample flood alert: streets in Purok 4 are flooded. Avoid the area and move vehicles to higher ground.",
      body: `${sampleNote}\n\nResidents near low-lying streets should stay alert, keep emergency kits ready and follow instructions from barangay responders.`,
    },
    {
      id: "ann-sunog-purok-2",
      title: "Sunog sa Purok 2",
      category: "News",
      priority: "featured",
      publishedAt: ago(9 * HOUR),
      summary: "Sample news: fire incident reported near Purok 2. Residents are advised to stay safe and follow evacuation instructions.",
      body: `${sampleNote}\n\nAffected families may visit the barangay hall for assistance.`,
    },
    {
      id: "ann-dental-cleaning",
      title: "Dental Cleaning",
      category: "Event",
      priority: "normal",
      publishedAt: ago(2 * DAY),
      summary: "Sample event: free dental cleaning at the barangay health center. Schedule and slots will be posted.",
      body: `${sampleNote}\n\nPlease bring a valid ID.`,
    },
    {
      id: "ann-eye-refraction",
      title: "Eye Refraction",
      category: "Event",
      priority: "normal",
      publishedAt: ago(4 * DAY),
      summary: "Sample event: eye refraction check-up for residents. Registration details to follow.",
      body: `${sampleNote}\n\nRegistration details will be announced by the health center.`,
    },
    {
      id: "ann-libreng-tuli",
      title: "Libreng Tuli",
      category: "Event",
      priority: "normal",
      publishedAt: ago(8 * DAY),
      summary: "Sample event: free circumcision program for boys. Parents may pre-register at the barangay hall.",
      body: `${sampleNote}\n\nA parent or guardian must accompany each child.`,
    },
    {
      id: "ann-declogging",
      title: "Scheduled Declogging of Canals",
      category: "News",
      priority: "normal",
      publishedAt: ago(10 * DAY),
      summary: "Sample news: canal clearing operations in selected puroks. Please keep drainage areas clear.",
      body: `${sampleNote}\n\nAvoid throwing garbage into canals and move vehicles parked over drainage covers.`,
    },
    {
      id: "ann-clean-up-drive",
      title: "Community Clean-up Drive",
      category: "Event",
      priority: "normal",
      publishedAt: ago(12 * DAY),
      summary: "Sample event: join neighbors for a community clean-up drive. Meeting point and time to be announced.",
      body: `${sampleNote}\n\nVolunteers are encouraged to bring gloves and reusable bags.`,
    },
    {
      id: "ann-anti-dengue",
      title: "Anti-Dengue Reminder",
      category: "News",
      priority: "normal",
      publishedAt: ago(16 * DAY),
      summary: "Sample health reminder: search and destroy mosquito breeding sites and seek early consultation for fever.",
      body: `${sampleNote}\n\nCover water containers, clean gutters and consult the health center if you develop a fever.`,
    },
  ];

  /* ------------------------------ Notifications ----------------------------- */

  const residencyDone = requests.find((r) => r.serviceId === "barangay-residency" && r.status === "Completed")!;
  const notifications: AppNotification[] = [
    {
      id: "ntf-1",
      type: "announcement",
      tag: "New",
      title: "New announcement: Sunog sa Purok 2",
      message: "Fire incident reported near Purok 2. Residents are advised to stay safe and follow evacuation instructions.",
      createdAt: ago(9 * HOUR),
      read: false,
      href: "/announcements/ann-sunog-purok-2",
    },
    {
      id: "ntf-2",
      type: "request",
      tag: "Updated",
      title: "Your document request is approved",
      message: `Barangay Residency request ${residencyDone.referenceNo} has been approved and is ready for pickup.`,
      createdAt: ago(1 * DAY + 2 * HOUR),
      read: true,
      href: `/my-requests?ref=${residencyDone.referenceNo}`,
    },
    {
      id: "ntf-3",
      type: "appointment",
      tag: "Urgent",
      title: "Reminder: Appointment rescheduled",
      message: "Your Barangay Clearance appointment has been moved. Check the new date and time.",
      createdAt: ago(3 * DAY),
      read: false,
      href: "/appointments",
    },
    {
      id: "ntf-4",
      type: "report",
      tag: "Updated",
      title: "Community report updated",
      message: "Report RPT-2026-0125 (Streetlight not working near chapel) is now in progress.",
      createdAt: ago(3 * DAY + 5 * HOUR),
      read: false,
      href: "/community-reports?tab=mine",
    },
    {
      id: "ntf-5",
      type: "announcement",
      tag: "New",
      title: "New announcement published",
      message: "Barangay Baesa posted a new announcement about the upcoming community clean-up drive.",
      createdAt: ago(12 * DAY),
      read: true,
      href: "/announcements/ann-clean-up-drive",
    },
    {
      id: "ntf-6",
      type: "appointment",
      tag: "Reminder",
      title: "Reminder: Appointment tomorrow",
      message: "You have an appointment with the Barangay Secretary tomorrow at 10:00 AM.",
      createdAt: ago(4 * HOUR),
      read: false,
      href: "/appointments",
    },
    {
      id: "ntf-7",
      type: "request",
      tag: "Updated",
      title: "Request in progress",
      message: "Your Barangay Indigency request is being reviewed by barangay staff.",
      createdAt: ago(5 * DAY),
      read: true,
      href: "/my-requests",
    },
    {
      id: "ntf-8",
      type: "report",
      tag: "Updated",
      title: "Community report resolved",
      message: "Report RPT-2026-0116 (Illegal dumping in vacant lot) was marked as resolved.",
      createdAt: ago(7 * DAY),
      read: true,
      href: "/community-reports?tab=mine",
    },
    {
      id: "ntf-9",
      type: "announcement",
      tag: "New",
      title: "New announcement: Dental Cleaning",
      message: "Free dental cleaning at the barangay health center. Watch for the schedule.",
      createdAt: ago(2 * DAY),
      read: true,
      href: "/announcements/ann-dental-cleaning",
    },
  ];

  return { resident, requests, reports, appointments, announcements, notifications };
}
