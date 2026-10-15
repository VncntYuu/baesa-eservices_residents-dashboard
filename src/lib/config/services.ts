import type { PaymentMethod, ServiceGroup, ServiceId } from "@/lib/types";

/**
 * Service catalogue for Document Request.
 *
 * ⚠️ CONFIGURATION, NOT OFFICIAL RULES
 * - Fee amounts are the SAMPLE values shown in the design references. They are
 *   flagged `isSample: true` and labelled in the UI until the barangay confirms them.
 * - `requiredDocuments` lists come from the design references. Services without a
 *   reference (burial/donation) are left empty and the UI says so.
 */

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export interface ServiceField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  /** For selects: the option that reveals a free-text "please specify" field. */
  otherOption?: string;
  otherLabel?: string;
  min?: number;
  max?: number;
  /** Shown before the input, e.g. "₱". */
  prefix?: string;
  /** Spans the full width of the two-column grid. */
  wide?: boolean;
}

export interface ServiceFee {
  /** null = amount is assessed by the barangay ("Variable"). */
  amount: number | null;
  label: string;
  isSample: boolean;
  note?: string;
}

export interface ServiceConfig {
  id: ServiceId;
  group: ServiceGroup;
  icon: "file" | "heart" | "home" | "briefcase" | "flower" | "hand-heart";
  name: string;
  formTitle: string;
  shortDescription: string;
  fee: ServiceFee;
  requiredDocuments: string[];
  detailsTitle: string;
  fields: ServiceField[];
  /** Whether the form shows payment options. */
  takesPayment: boolean;
}

const VALID_ID = "Valid government-issued ID (Passport, Driver's License, National ID)";

export const CLEARANCE_PURPOSES = [
  "Employment",
  "Government IDs",
  "Proof of Address / Residency",
  "Business Operations",
  "Banking & Loans",
  "School & Scholarships",
  "Utility Connections",
  "Others",
];

export const RESIDENCY_DURATIONS = [
  "Less than 6 months",
  "6 months to less than 1 year",
  "1 to less than 3 years",
  "3 to less than 5 years",
  "5 to less than 10 years",
  "10 years or more",
  "Other (specify)",
];

export const EDUCATION_LEVELS = [
  "Elementary graduate",
  "Junior High School graduate",
  "Senior High School graduate",
  "Technical-Vocational (TVET) graduate",
  "College undergraduate",
  "College graduate",
  "Post-graduate",
];

const FAMILY_SIZES = Array.from({ length: 20 }, (_, i) => String(i + 1)).concat("More than 20");

export const SERVICES: ServiceConfig[] = [
  {
    id: "barangay-clearance",
    group: "certificate",
    icon: "file",
    name: "Barangay Clearance",
    formTitle: "Barangay Clearance Request",
    shortDescription: "Official proof of residency and good standing",
    fee: { amount: 100, label: "₱100", isSample: true },
    requiredDocuments: [VALID_ID, "Proof of residency (e.g., utility bill, lease agreement)"],
    detailsTitle: "Request Details",
    takesPayment: true,
    fields: [
      {
        id: "purpose",
        label: "Purpose of Request",
        type: "select",
        required: true,
        options: CLEARANCE_PURPOSES,
        placeholder: "-- Select a purpose --",
        otherOption: "Others",
        otherLabel: "Please specify the purpose",
        wide: true,
      },
    ],
  },
  {
    id: "barangay-indigency",
    group: "certificate",
    icon: "heart",
    name: "Barangay Indigency",
    formTitle: "Barangay Indigency Request",
    shortDescription: "For educational assistance and benefits",
    fee: { amount: 50, label: "₱50", isSample: true },
    requiredDocuments: [
      VALID_ID,
      "Official household list/Census list",
      "Proof of income or lack thereof (such as employment certificate)",
    ],
    detailsTitle: "Financial Information",
    takesPayment: true,
    fields: [
      {
        id: "familyMembers",
        label: "Number of Family Members",
        type: "select",
        required: true,
        options: FAMILY_SIZES,
        placeholder: "-- Select --",
      },
      {
        id: "monthlyIncome",
        label: "Monthly Income (₱)",
        type: "number",
        required: true,
        min: 0,
        max: 10_000_000,
        prefix: "₱",
        placeholder: "e.g. 8000",
        helpText: "Total monthly household income. Enter 0 if none.",
      },
    ],
  },
  {
    id: "barangay-residency",
    group: "certificate",
    icon: "home",
    name: "Barangay Residency",
    formTitle: "Barangay Residency Request",
    shortDescription: "Proof of residency in the barangay",
    fee: { amount: 75, label: "₱75", isSample: true },
    requiredDocuments: [
      VALID_ID,
      "Proof of residence (utility bill, lease agreement, or property document)",
      "Certificate of household membership",
    ],
    detailsTitle: "Resident Details",
    takesPayment: true,
    fields: [
      {
        id: "residencyDuration",
        label: "How long have you been a resident?",
        type: "select",
        required: true,
        options: RESIDENCY_DURATIONS,
        placeholder: "-- Select duration --",
        otherOption: "Other (specify)",
        otherLabel: "Specify how long (e.g. 2 years and 4 months)",
        wide: true,
      },
    ],
  },
  {
    id: "first-time-job-seeker",
    group: "certificate",
    icon: "briefcase",
    name: "First-Time Job Seeker Certificate",
    formTitle: "First-Time Job Seeker Request",
    shortDescription: "For first-time job applicants",
    fee: {
      amount: 0,
      label: "Free",
      isSample: false,
      note: "Fees are waived for first-time jobseekers under RA 11261 (once only). Please confirm with the barangay.",
    },
    requiredDocuments: [
      VALID_ID,
      "Copy of educational attainment (High School diploma or higher)",
      "Certificate of graduation or school records",
    ],
    detailsTitle: "Educational & Professional Background",
    takesPayment: true,
    fields: [
      {
        id: "educationLevel",
        label: "Highest Education Level",
        type: "select",
        required: true,
        options: EDUCATION_LEVELS,
        placeholder: "-- Select Education Level --",
        wide: true,
      },
      {
        id: "skills",
        label: "Skills or Interests",
        type: "text",
        required: true,
        placeholder: "e.g. Customer service, basic computer skills, welding",
        wide: true,
      },
    ],
  },
  {
    id: "burial-assistance",
    group: "assistance",
    icon: "flower",
    name: "Burial Assistance",
    formTitle: "Burial Assistance Request",
    shortDescription: "Request assistance for the burial of a family member",
    fee: { amount: null, label: "Variable", isSample: false, note: "Assistance amounts are assessed by the barangay." },
    requiredDocuments: [],
    detailsTitle: "Assistance Details",
    takesPayment: false,
    fields: [
      { id: "deceasedName", label: "Full name of the deceased", type: "text", required: true },
      { id: "dateOfDeath", label: "Date of death", type: "date", required: true },
      {
        id: "relationship",
        label: "Your relationship to the deceased",
        type: "text",
        required: true,
        placeholder: "e.g. Son, Daughter, Spouse",
      },
      {
        id: "assistanceDetails",
        label: "Details of the assistance needed",
        type: "textarea",
        required: true,
        wide: true,
      },
    ],
  },
  {
    id: "donation-assistance",
    group: "assistance",
    icon: "hand-heart",
    name: "Donation Assistance",
    formTitle: "Donation Assistance Request",
    shortDescription: "Request donation or support from the barangay",
    fee: { amount: null, label: "Variable", isSample: false, note: "Assistance is assessed by the barangay." },
    requiredDocuments: [],
    detailsTitle: "Assistance Details",
    takesPayment: false,
    fields: [
      {
        id: "assistanceType",
        label: "Type of assistance needed",
        type: "text",
        required: true,
        placeholder: "e.g. Food packs, medical support",
        wide: true,
      },
      { id: "assistanceDetails", label: "Reason for the request", type: "textarea", required: true, wide: true },
    ],
  },
];

export const CERTIFICATE_SERVICES = SERVICES.filter((s) => s.group === "certificate");
export const ASSISTANCE_SERVICES = SERVICES.filter((s) => s.group === "assistance");

export function getService(id: string | null | undefined): ServiceConfig | undefined {
  return SERVICES.find((s) => s.id === id);
}

/* ------------------------------ Payments ------------------------------ */

export const ONLINE_METHODS: { id: Exclude<PaymentMethod, "face-to-face" | "none">; label: string }[] = [
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "paypal", label: "PayPal" },
];

export function paymentMethodLabel(m: PaymentMethod): string {
  if (m === "face-to-face") return "Face-to-face payment";
  if (m === "none") return "No payment";
  return ONLINE_METHODS.find((o) => o.id === m)?.label ?? m;
}

/** Generic instruction shown on requests until official rules are configured. */
export const DEFAULT_PICKUP_INSTRUCTION = "Please bring your ID and this reference number to the barangay hall.";

export const VALID_ID_RULES = {
  accept: "image/jpeg,image/png,application/pdf",
  extensions: [".jpg", ".jpeg", ".png", ".pdf"],
  maxSizeMb: 5,
};
