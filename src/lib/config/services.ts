import type { ServiceGroup, ServiceId } from "@/lib/types";

/**
 * Document & assistance service catalogue.
 *
 * ⚠️ CONFIGURATION, NOT OFFICIAL RULES
 * - `feeLabel` values are copied from the design mockups and are NOT confirmed
 *   by the barangay. Keep `feeConfirmed: false` until they are.
 * - `requirements` is intentionally empty: official documentary requirements
 *   have not been provided. Add them here once confirmed and the request form
 *   will list them automatically.
 * - `processingNote` is null until official processing rules are provided.
 */

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox";

export interface ServiceField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  min?: number;
}

export interface ServiceIconKey {
  icon: "file" | "heart" | "home" | "briefcase" | "flower" | "hand-heart";
}

export interface ServiceConfig extends ServiceIconKey {
  id: ServiceId;
  group: ServiceGroup;
  name: string;
  shortDescription: string;
  feeLabel: string;
  feeConfirmed: boolean;
  requirements: string[];
  processingNote: string | null;
  fields: ServiceField[];
}

const purposeField: ServiceField = {
  id: "purpose",
  label: "Purpose of request",
  type: "text",
  required: true,
  placeholder: "e.g. Employment requirement",
  helpText: "Tell us what the document will be used for.",
};

export const SERVICES: ServiceConfig[] = [
  {
    id: "barangay-clearance",
    group: "certificate",
    icon: "file",
    name: "Barangay Clearance",
    shortDescription: "Official proof of residency and good standing",
    feeLabel: "₱100",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [purposeField],
  },
  {
    id: "barangay-indigency",
    group: "certificate",
    icon: "heart",
    name: "Barangay Indigency",
    shortDescription: "For educational assistance and benefits",
    feeLabel: "₱50",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [
      purposeField,
      {
        id: "beneficiary",
        label: "Beneficiary name (if not yourself)",
        type: "text",
        placeholder: "Leave blank if the certificate is for you",
      },
    ],
  },
  {
    id: "barangay-residency",
    group: "certificate",
    icon: "home",
    name: "Barangay Residency",
    shortDescription: "Proof of residency in the barangay",
    feeLabel: "₱75",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [
      purposeField,
      {
        id: "yearsOfResidency",
        label: "Years residing in Barangay Baesa",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 5",
      },
    ],
  },
  {
    id: "first-time-job-seeker",
    group: "certificate",
    icon: "briefcase",
    name: "First-Time Job Seeker Certificate",
    shortDescription: "For first-time job applicants",
    feeLabel: "Free",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [
      purposeField,
      {
        id: "firstTimeConfirmation",
        label: "I confirm that I am seeking employment for the first time.",
        type: "checkbox",
        required: true,
      },
    ],
  },
  {
    id: "burial-assistance",
    group: "assistance",
    icon: "flower",
    name: "Burial Assistance",
    shortDescription: "Request assistance for burial of a family member",
    feeLabel: "Variable",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [
      {
        id: "deceasedName",
        label: "Full name of the deceased",
        type: "text",
        required: true,
      },
      {
        id: "dateOfDeath",
        label: "Date of death",
        type: "date",
        required: true,
      },
      {
        id: "relationship",
        label: "Your relationship to the deceased",
        type: "text",
        required: true,
        placeholder: "e.g. Son, Daughter, Spouse",
      },
      {
        id: "purpose",
        label: "Details of the assistance needed",
        type: "textarea",
        required: true,
        placeholder: "Briefly describe the assistance you are requesting.",
      },
    ],
  },
  {
    id: "donation-assistance",
    group: "assistance",
    icon: "hand-heart",
    name: "Donation Assistance",
    shortDescription: "Request donation or support from the barangay",
    feeLabel: "Variable",
    feeConfirmed: false,
    requirements: [],
    processingNote: null,
    fields: [
      {
        id: "assistanceType",
        label: "Type of assistance needed",
        type: "text",
        required: true,
        placeholder: "e.g. Food packs, medical support",
      },
      {
        id: "purpose",
        label: "Reason for the request",
        type: "textarea",
        required: true,
        placeholder: "Briefly describe your situation.",
      },
    ],
  },
];

export const CERTIFICATE_SERVICES = SERVICES.filter((s) => s.group === "certificate");
export const ASSISTANCE_SERVICES = SERVICES.filter((s) => s.group === "assistance");

export function getService(id: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Generic instruction shown on requests until official rules are configured. */
export const DEFAULT_PICKUP_INSTRUCTION =
  "Please bring a valid ID and this reference number to the barangay hall.";

export const ATTACHMENT_RULES = {
  accept: ".jpg,.jpeg,.png,.pdf",
  maxSizeMb: 5,
  maxFiles: 3,
};
