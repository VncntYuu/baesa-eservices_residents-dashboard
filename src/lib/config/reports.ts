import type { ReportCategory } from "@/lib/types";

export const REPORT_CATEGORIES: { value: ReportCategory; label: string; color: string }[] = [
  { value: "Garbage", label: "Garbage", color: "#E3A72F" },
  { value: "Drainage", label: "Drainage", color: "#3B6FD8" },
  { value: "Streetlight", label: "Streetlight", color: "#7A5AD6" },
  { value: "Road Hazard", label: "Road hazard", color: "#D04545" },
  { value: "Others", label: "Other", color: "#7C8A83" },
];

export function categoryColor(category: ReportCategory): string {
  return REPORT_CATEGORIES.find((c) => c.value === category)?.color ?? "#7C8A83";
}

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
