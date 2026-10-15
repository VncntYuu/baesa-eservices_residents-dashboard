import type { CommunityCategory, ReportKind, ReportStatus } from "@/lib/types";

export interface CategoryOption {
  value: CommunityCategory;
  label: string;
  kind: ReportKind;
  color: string;
  isOther?: boolean;
}

/** Categories and dot colours follow the File a Complaint / File a Report screenshots. */
export const COMPLAINT_CATEGORIES: CategoryOption[] = [
  { value: "Garbage Collection", label: "Garbage Collection", kind: "Complaint", color: "#d6a100" },
  { value: "Noise Complaint", label: "Noise Complaint", kind: "Complaint", color: "#2e6fdc" },
  { value: "Drainage Problem", label: "Drainage Problem", kind: "Complaint", color: "#7c5cd6" },
  { value: "Illegal Parking", label: "Illegal Parking", kind: "Complaint", color: "#d64545" },
  { value: "Other Complaint", label: "Other", kind: "Complaint", color: "#899d94", isOther: true },
];

export const REPORT_CATEGORIES: CategoryOption[] = [
  { value: "Road Hazard", label: "Road Hazard", kind: "Report", color: "#e0662a" },
  { value: "Broken Streetlight", label: "Broken Streetlight", kind: "Report", color: "#3fbf3a" },
  { value: "Flooding", label: "Flooding", kind: "Report", color: "#4b2be0" },
  { value: "Damaged Public Property", label: "Damaged Public Property", kind: "Report", color: "#e57e86" },
  { value: "Other Report", label: "Other", kind: "Report", color: "#6f8079", isOther: true },
];

export const ALL_CATEGORIES: CategoryOption[] = [...COMPLAINT_CATEGORIES, ...REPORT_CATEGORIES];

export function categoryOption(category: CommunityCategory): CategoryOption {
  return ALL_CATEGORIES.find((c) => c.value === category) ?? COMPLAINT_CATEGORIES[4];
}

export function categoryColor(category: CommunityCategory): string {
  return categoryOption(category).color;
}

/** What residents see for a category, including the text they typed for "Other". */
export function categoryLabel(category: CommunityCategory, other?: string): string {
  const opt = categoryOption(category);
  if (opt.isOther) return other ? `Other: ${other}` : "Other";
  return opt.label;
}

export const REPORT_STATUSES: ReportStatus[] = ["Pending", "In Progress", "Resolved"];

/**
 * Map settings. Uses OpenStreetMap tiles + Nominatim search, which need no API
 * key. Both are free community services with usage policies — fine for a demo
 * and light use; for production traffic, point these at a self-hosted or paid
 * tile/geocoding provider (keep any secret keys on the server).
 */
export const MAP_CONFIG = {
  /** Barangay Baesa, Quezon City (approx. centre, per PhilAtlas). */
  center: { lat: 14.6687, lng: 121.0119 },
  defaultZoom: 16,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  geocodeSearchUrl: "https://nominatim.openstreetmap.org/search",
  geocodeReverseUrl: "https://nominatim.openstreetmap.org/reverse",
  /** Restrict search results to roughly the Baesa / Quezon City area. */
  searchViewbox: "120.995,14.685,121.03,14.652",
  /** Radius used to point out nearby reports to the resident (info only). */
  nearbyRadiusMeters: 50,
  nearbyWindowHours: 24,
};

export const PHOTO_RULES = { accept: "image/jpeg,image/png", maxSizeMb: 5 };
