/**
 * Address search / reverse lookup via OpenStreetMap Nominatim (no API key).
 *
 * Nominatim's usage policy allows light use with attribution and at most
 * ~1 request per second; this module only calls it on explicit user actions
 * (search submit, pin drop) and caches results. For production traffic, swap
 * these URLs for a self-hosted Nominatim or a paid geocoder proxied through a
 * Next.js route handler so any API key stays on the server.
 */
import { MAP_CONFIG } from "@/lib/config/reports";

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const reverseCache = new Map<string, string>();

interface NominatimItem {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

function shortLabel(item: NominatimItem): string {
  const a = item.address ?? {};
  const street = a.road ?? a.pedestrian ?? a.footway ?? a.neighbourhood ?? a.amenity ?? a.building;
  const area = a.suburb ?? a.quarter ?? a.village ?? a.city_district;
  const parts = [a.house_number && street ? `${a.house_number} ${street}` : street, area].filter(Boolean);
  return parts.length ? parts.join(", ") : item.display_name.split(",").slice(0, 2).join(",");
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = new URL(MAP_CONFIG.geocodeSearchUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "ph");
  url.searchParams.set("viewbox", MAP_CONFIG.searchViewbox);
  url.searchParams.set("bounded", "1");
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = (await res.json()) as NominatimItem[];
  return data.map((d) => ({ label: shortLabel(d), lat: Number(d.lat), lng: Number(d.lon) }));
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;
  const url = new URL(MAP_CONFIG.geocodeReverseUrl);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = (await res.json()) as NominatimItem;
  const label = shortLabel(data);
  reverseCache.set(key, label);
  return label;
}
