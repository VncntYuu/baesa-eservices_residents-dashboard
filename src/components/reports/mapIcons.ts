import L from "leaflet";

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
