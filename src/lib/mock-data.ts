/**
 * SAMPLE DATA for the frontend demonstration.
 *
 * Nothing in this file is official barangay information. It is generated once
 * per browser (relative to the current date), then kept in localStorage by the
 * store so pages stay in sync. Replace with API responses when a backend exists.
 */
import { MAP_CONFIG } from "@/lib/config/reports";
import { DEFAULT_PICKUP_INSTRUCTION } from "@/lib/config/services";
import type {
  Announcement,
  AppNotification,
  Appointment,
  CommunityReport,
  DocumentRequest,
  ReportCategory,
  ResidentProfile,
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

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function createSeedData(now = new Date()): PortalData {
  const t = now.getTime();
  const ago = (ms: number) => new Date(t - ms).toISOString();
  const dayOffset = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    // skip weekends so demo appointments land on weekdays
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + (days >= 0 ? 1 : -1));
    return toYMD(d);
  };

  const resident: ResidentProfile = {
    id: "res-0001",
    firstName: "Maria",
    lastName: "Santos",
    middleName: "Reyes",
    email: "maria.santos@example.com",
    contactNumber: "0917 000 0000",
    address: "Blk 4 Lot 12, Ramos Street",
    purok: "Purok 3",
    birthDate: "1994-03-18",
    civilStatus: "Single",
  };

  const requests: DocumentRequest[] = [
    {
      id: "req-1",
      referenceNo: "REQ-SAMPLE-A7K2",
      serviceId: "barangay-indigency",
      serviceName: "Barangay Indigency",
      purpose: "Scholarship application",
      details: { purpose: "Scholarship application", beneficiary: "" },
      attachments: ["valid-id.jpg"],
      submittedAt: ago(6 * DAY),
      status: "Completed",
      feeLabel: "₱50",
      completedAt: ago(4 * DAY),
      remarks: DEFAULT_PICKUP_INSTRUCTION,
      history: [
        { status: "Pending", date: ago(6 * DAY), note: "Request submitted." },
        { status: "In Progress", date: ago(5 * DAY), note: "Request is being reviewed by barangay staff." },
        { status: "Completed", date: ago(4 * DAY), note: "Document is ready for pickup." },
      ],
    },
    {
      id: "req-2",
      referenceNo: "REQ-SAMPLE-B3M9",
      serviceId: "barangay-clearance",
      serviceName: "Barangay Clearance",
      purpose: "Employment requirement",
      details: { purpose: "Employment requirement" },
      attachments: ["valid-id.jpg"],
      submittedAt: ago(3 * DAY),
      status: "In Progress",
      feeLabel: "₱100",
      remarks: DEFAULT_PICKUP_INSTRUCTION,
      history: [
        { status: "Pending", date: ago(3 * DAY), note: "Request submitted." },
        { status: "In Progress", date: ago(2 * DAY), note: "Request is being reviewed by barangay staff." },
      ],
    },
    {
      id: "req-3",
      referenceNo: "REQ-SAMPLE-C8Q4",
      serviceId: "barangay-residency",
      serviceName: "Barangay Residency",
      purpose: "Bank account opening",
      details: { purpose: "Bank account opening", yearsOfResidency: "8" },
      attachments: [],
      submittedAt: ago(2 * DAY),
      status: "Pending",
      feeLabel: "₱75",
      remarks: DEFAULT_PICKUP_INSTRUCTION,
      history: [{ status: "Pending", date: ago(2 * DAY), note: "Request submitted." }],
    },
    {
      id: "req-4",
      referenceNo: "REQ-SAMPLE-D5T7",
      serviceId: "first-time-job-seeker",
      serviceName: "First-Time Job Seeker Certificate",
      purpose: "Job application",
      details: { purpose: "Job application", firstTimeConfirmation: "Yes" },
      attachments: [],
      submittedAt: ago(1 * DAY),
      status: "Pending",
      feeLabel: "Free",
      remarks: DEFAULT_PICKUP_INSTRUCTION,
      history: [{ status: "Pending", date: ago(1 * DAY), note: "Request submitted." }],
    },
    {
      id: "req-5",
      referenceNo: "REQ-SAMPLE-E2W6",
      serviceId: "barangay-clearance",
      serviceName: "Barangay Clearance",
      purpose: "Postal ID",
      details: { purpose: "Postal ID" },
      attachments: [],
      submittedAt: ago(20 * DAY),
      status: "Rejected",
      feeLabel: "₱100",
      remarks: "Sample remark: submitted details could not be verified. Please visit the barangay hall.",
      history: [
        { status: "Pending", date: ago(20 * DAY), note: "Request submitted." },
        { status: "Rejected", date: ago(18 * DAY), note: "Details could not be verified (sample)." },
      ],
    },
    {
      id: "req-6",
      referenceNo: "REQ-SAMPLE-F9H3",
      serviceId: "burial-assistance",
      serviceName: "Burial Assistance",
      purpose: "Assistance with funeral expenses",
      details: {
        deceasedName: "Jose Santos",
        dateOfDeath: toYMD(new Date(t - 40 * DAY)),
        relationship: "Grandchild",
        purpose: "Assistance with funeral expenses",
      },
      attachments: [],
      submittedAt: ago(38 * DAY),
      status: "Completed",
      feeLabel: "Variable",
      completedAt: ago(30 * DAY),
      remarks: DEFAULT_PICKUP_INSTRUCTION,
      history: [
        { status: "Pending", date: ago(38 * DAY), note: "Request submitted." },
        { status: "In Progress", date: ago(35 * DAY), note: "Under review." },
        { status: "Completed", date: ago(30 * DAY), note: "Request completed." },
      ],
    },
  ];

  /* -------- Community reports scattered around the barangay centre -------- */
  const { lat: cLat, lng: cLng } = MAP_CONFIG.center;
  // Deterministic offsets (in metres) so the demo map looks the same every time.
  const seeds: [ReportCategory, number, number, string, number, CommunityReport["status"]][] = [
    ["Garbage", 180, 150, "Uncollected garbage bags", 2, "Submitted"],
    ["Garbage", 200, 170, "Garbage pile on sidewalk", 10, "Submitted"],
    ["Garbage", 215, 140, "Overflowing trash bin", 30, "In Progress"],
    ["Garbage", -260, 90, "Burning of trash", 60, "Submitted"],
    ["Garbage", 320, 260, "Illegal dumping near vacant lot", 120, "In Progress"],
    ["Drainage", -160, -210, "Clogged canal", 3, "In Progress"],
    ["Drainage", -140, -230, "Flooding after rain", 8, "Submitted"],
    ["Drainage", -175, -195, "Canal overflowing", 20, "Submitted"],
    ["Drainage", 260, -320, "Open manhole", 70, "Submitted"],
    ["Streetlight", -300, 220, "Streetlight not working", 5, "Submitted"],
    ["Streetlight", 120, -120, "Flickering streetlight", 48, "In Progress"],
    ["Streetlight", 380, -60, "Dark corner, no lighting", 96, "Submitted"],
    ["Road Hazard", 90, -260, "Pothole on main road", 6, "Submitted"],
    ["Road Hazard", 110, -280, "Deep pothole", 26, "In Progress"],
    ["Road Hazard", -40, 320, "Fallen tree branch", 150, "Resolved"],
    ["Others", -380, -40, "Stray dogs in the area", 200, "Submitted"],
  ];
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((cLat * Math.PI) / 180);
  const reports: CommunityReport[] = seeds.map(([category, dx, dy, title, hoursAgo, status], i) => ({
    id: `rpt-c${i + 1}`,
    referenceNo: `RPT-SAMPLE-${String(i + 1).padStart(3, "0")}`,
    kind: i % 3 === 0 ? "Report" : "Complaint",
    category,
    title,
    description: "Sample community report for the demonstration map.",
    location: {
      label: "Barangay Baesa, Quezon City",
      lat: +(cLat + dy / mPerDegLat).toFixed(6),
      lng: +(cLng + dx / mPerDegLng).toFixed(6),
    },
    submittedAt: ago(hoursAgo * HOUR),
    status,
    isMine: false,
    updates: [],
  }));

  reports.unshift({
    id: "rpt-m1",
    referenceNo: "RPT-SAMPLE-M01",
    kind: "Complaint",
    category: "Drainage",
    title: "Clogged drainage on Ramos Street",
    description: "Water collects in front of the houses after light rain because the canal is blocked.",
    location: {
      label: "Ramos Street, Purok 3",
      lat: +(cLat - 200 / mPerDegLat).toFixed(6),
      lng: +(cLng - 150 / mPerDegLng).toFixed(6),
    },
    submittedAt: ago(4 * DAY),
    status: "In Progress",
    isMine: true,
    updates: [
      { date: ago(4 * DAY), note: "Report submitted." },
      { date: ago(3 * DAY), note: "Report forwarded to the barangay maintenance team (sample update)." },
    ],
  });

  const appointments: Appointment[] = [
    {
      id: "apt-1",
      referenceNo: "APT-SAMPLE-0001",
      purpose: "Document pickup",
      notes: "Pickup of Barangay Indigency certificate.",
      date: dayOffset(3),
      time: "10:00",
      status: "Confirmed",
      createdAt: ago(2 * DAY),
      history: [
        { date: ago(2 * DAY), note: "Appointment requested." },
        { date: ago(1 * DAY), note: "Appointment confirmed (sample)." },
      ],
    },
    {
      id: "apt-2",
      referenceNo: "APT-SAMPLE-0002",
      purpose: "Consultation with barangay official",
      date: dayOffset(8),
      time: "14:00",
      status: "Pending",
      createdAt: ago(5 * HOUR),
      history: [{ date: ago(5 * HOUR), note: "Appointment requested." }],
    },
    {
      id: "apt-3",
      referenceNo: "APT-SAMPLE-0003",
      purpose: "Health center visit",
      date: dayOffset(-12),
      time: "09:00",
      status: "Completed",
      createdAt: ago(20 * DAY),
      history: [
        { date: ago(20 * DAY), note: "Appointment requested." },
        { date: ago(19 * DAY), note: "Appointment confirmed (sample)." },
        { date: ago(12 * DAY), note: "Appointment completed." },
      ],
    },
    {
      id: "apt-4",
      referenceNo: "APT-SAMPLE-0004",
      purpose: "Lupon / mediation concern",
      date: dayOffset(-25),
      time: "13:00",
      status: "Cancelled",
      createdAt: ago(30 * DAY),
      history: [
        { date: ago(30 * DAY), note: "Appointment requested." },
        { date: ago(27 * DAY), note: "Cancelled by resident." },
      ],
    },
  ];

  const lorem =
    "This is sample announcement text for the frontend demonstration. The barangay office will replace it with the official announcement once the content management backend is connected.";

  const announcements: Announcement[] = [
    {
      id: "ann-1",
      title: "Sunog sa Purok 2",
      category: "News",
      publishedAt: ago(1 * DAY),
      summary: "Sample news item: update on the incident reported in Purok 2 and where affected families can ask for help.",
      body: `${lorem}\n\nAffected residents may visit the barangay hall for assistance. Details such as schedules and relief distribution points will be posted here by the barangay office.`,
      important: true,
    },
    {
      id: "ann-2",
      title: "Dental Cleaning",
      category: "Event",
      publishedAt: ago(2 * DAY),
      summary: "Sample event: free dental cleaning activity at the barangay health center. Watch this space for the schedule.",
      body: `${lorem}\n\nPlease bring a valid ID. Slots and schedule details will be announced by the health center.`,
    },
    {
      id: "ann-3",
      title: "Scheduled Declogging of Canals",
      category: "Advisory",
      publishedAt: ago(5 * DAY),
      summary: "Sample advisory: canal clearing operations in selected puroks. Please keep drainage areas clear.",
      body: `${lorem}\n\nResidents are asked to avoid throwing garbage into canals and to move vehicles parked over drainage covers.`,
    },
    {
      id: "ann-4",
      title: "Anti-Dengue Reminder",
      category: "Health",
      publishedAt: ago(9 * DAY),
      summary: "Sample health reminder: practice 4S — search and destroy breeding sites, self-protection, seek early consultation.",
      body: `${lorem}\n\nCover water containers, clean gutters and consult the health center if you develop a fever.`,
    },
    {
      id: "ann-5",
      title: "Barangay Assembly",
      category: "Event",
      publishedAt: ago(14 * DAY),
      summary: "Sample event: residents are invited to the barangay assembly. Agenda to be posted.",
      body: `${lorem}\n\nAll residents are encouraged to attend and participate.`,
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: "ntf-1",
      type: "announcement",
      title: "New announcement",
      message: "Sunog sa Purok 2 was posted.",
      createdAt: ago(1 * DAY),
      read: false,
      href: "/announcements/ann-1",
    },
    {
      id: "ntf-2",
      type: "request",
      title: "Request in progress",
      message: "Your Barangay Clearance (REQ-SAMPLE-B3M9) is being reviewed.",
      createdAt: ago(2 * DAY),
      read: true,
      href: "/my-requests?ref=REQ-SAMPLE-B3M9",
    },
    {
      id: "ntf-3",
      type: "appointment",
      title: "Appointment confirmed",
      message: "Your document pickup appointment has been confirmed.",
      createdAt: ago(1 * DAY),
      read: true,
      href: "/appointments",
    },
    {
      id: "ntf-4",
      type: "report",
      title: "Report update",
      message: "Your drainage report on Ramos Street is now in progress.",
      createdAt: ago(3 * DAY),
      read: true,
      href: "/community-reports",
    },
    {
      id: "ntf-5",
      type: "request",
      title: "Document ready for pickup",
      message: "Your Barangay Indigency (REQ-SAMPLE-A7K2) is ready for pickup.",
      createdAt: ago(4 * DAY),
      read: true,
      href: "/my-requests?ref=REQ-SAMPLE-A7K2",
    },
  ];

  return { resident, requests, reports, appointments, announcements, notifications };
}
