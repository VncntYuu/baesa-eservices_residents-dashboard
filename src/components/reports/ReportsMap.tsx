"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MAP_CONFIG, REPORT_CATEGORIES, categoryColor } from "@/lib/config/reports";
import type { CommunityReport } from "@/lib/types";
import { distanceMeters, formatDate } from "@/lib/utils";
import { pinIcon } from "./mapIcons";

export default function ReportsMap({
  reports,
  onViewDetails,
}: {
  reports: CommunityReport[];
  onViewDetails: (report: CommunityReport) => void;
}) {
  const icons = useMemo(() => {
    const m = new Map<string, ReturnType<typeof pinIcon>>();
    for (const c of REPORT_CATEGORIES) {
      m.set(c.value, pinIcon(c.color));
      m.set(`${c.value}:mine`, pinIcon(c.color, { ring: true, size: 34 }));
    }
    return m;
  }, []);

  // Count nearby reports of the same category (information only — never merged automatically).
  const nearbyCount = (r: CommunityReport) =>
    reports.filter((o) => o.id !== r.id && o.category === r.category && distanceMeters(o.location, r.location) <= MAP_CONFIG.nearbyRadiusMeters).length;

  return (
    <MapContainer
      center={[MAP_CONFIG.center.lat, MAP_CONFIG.center.lng]}
      zoom={MAP_CONFIG.defaultZoom}
      className="size-full"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.tileAttribution} />
      <ZoomControl position="topright" />
      {reports.map((r) => {
        const near = nearbyCount(r);
        return (
          <Marker
            key={r.id}
            position={[r.location.lat, r.location.lng]}
            icon={icons.get(r.isMine ? `${r.category}:mine` : r.category)}
            title={`${r.category}: ${r.title}`}
            keyboard
          >
            <Popup>
              <div className="min-w-52 font-sans">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold" style={{ color: categoryColor(r.category) }}>
                    {r.category}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="!my-1 text-sm font-semibold text-ink">{r.title}</p>
                <p className="!my-0 text-xs text-muted">
                  {r.location.label} · {formatDate(r.submittedAt)}
                  {near > 0 && ` · ${near} similar nearby`}
                </p>
                {r.isMine && (
                  <button
                    type="button"
                    onClick={() => onViewDetails(r)}
                    className="mt-2 text-sm font-semibold text-brand-500 hover:underline"
                  >
                    View details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
