import L from "leaflet";
import { MAP_CONFIG } from "@/lib/config/reports";

/** Teardrop map pin as an inline-SVG Leaflet divIcon (no external image assets). */
export function pinIcon(color: string, opts: { size?: number; ring?: boolean; className?: string } = {}) {
  const size = opts.size ?? 30;
  const h = Math.round(size * 1.3);
  const ring = opts.ring
    ? `<circle cx="12" cy="11" r="11" fill="none" stroke="#2b5639" stroke-width="2" opacity="0.9"/>`
    : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 34" width="${size}" height="${h}" aria-hidden="true">
      ${ring}
      <path d="M12 0C5.9 0 1 4.9 1 11c0 8.3 11 19 11 19s11-10.7 11-19C23 4.9 18.1 0 12 0z"
        fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="11" r="4" fill="#ffffff"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: opts.className ?? "report-pin",
    iconSize: [size, h],
    iconAnchor: [size / 2, h - 2],
    popupAnchor: [0, -h + 6],
  });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Creates a Leaflet map with the portal's defaults. `onTilesFailed` fires when
 * map imagery can't be loaded (offline, or blocked by the hosting page's
 * security policy) so the UI can say so instead of showing a silent blank map.
 */
export function createBaseMap(el: HTMLElement, onTilesFailed: () => void): L.Map {
  const { center, defaultZoom, tileUrl, tileAttribution } = MAP_CONFIG;
  const map = L.map(el, { center: [center.lat, center.lng], zoom: defaultZoom, scrollWheelZoom: false, zoomControl: false });
  L.control.zoom({ position: "topright" }).addTo(map);
  let failures = 0;
  L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 })
    .on("tileerror", () => {
      failures += 1;
      if (failures === 2) onTilesFailed();
    })
    .addTo(map);
  return map;
}
