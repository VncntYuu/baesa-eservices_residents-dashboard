"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { REPORT_TONE, toneClasses } from "@/components/ui/StatusBadge";
import { MAP_CONFIG, categoryColor, categoryLabel } from "@/lib/config/reports";
import type { CommunityReport } from "@/lib/types";
import { distanceMeters, formatDate } from "@/lib/utils";
import { MapImageryNotice } from "./MapImageryNotice";
import { createBaseMap, escapeHtml, pinIcon } from "./mapIcons";

/** Popup layout from the Community Map reference: category + status, location, date and similar count, "View details →". */
function popupHtml(r: CommunityReport, similar: number): string {
  const badge = toneClasses[REPORT_TONE[r.status]].badge;
  const status = r.status === "In Progress" ? "In Progress" : r.status;
  const where = r.location.area ? `${r.location.label}, ${r.location.area}` : r.location.label;
  return `
    <div class="w-60 font-sans">
      <div class="flex items-start justify-between gap-3">
        <p class="!m-0 text-lg font-bold text-ink">${escapeHtml(categoryLabel(r.category, r.otherCategory))}</p>
        <span class="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${badge}">${escapeHtml(status)}</span>
      </div>
      <p class="!mt-1.5 !mb-0 text-sm font-semibold text-ink">${escapeHtml(r.title)}</p>
      <p class="!mt-1 !mb-0 text-sm text-muted">${escapeHtml(where)}</p>
      <p class="!mt-1 !mb-0 text-xs text-subtle">Reported ${formatDate(r.submittedAt)}${
        similar > 0 ? ` · ${similar} similar report${similar > 1 ? "s" : ""}` : ""
      }</p>
      <button type="button" data-view-report class="mt-2 text-sm font-semibold text-brand-500 hover:underline">View details →</button>
    </div>`;
}

export default function ReportsMap({
  reports,
  onViewDetails,
  focus,
}: {
  reports: CommunityReport[];
  onViewDetails: (report: CommunityReport) => void;
  /** When set, the map flies to this point (used by the search box). */
  focus?: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onViewRef = useRef(onViewDetails);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    onViewRef.current = onViewDetails;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = createBaseMap(el, () => setTilesFailed(true));
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Keep tiles correct when the container changes size (sidebar, rotation, window resize).
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (focus) mapRef.current?.flyTo([focus.lat, focus.lng], 17);
  }, [focus]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const r of reports) {
      // Similar = same category within the "nearby" radius. Information only; nothing is merged.
      const similar = reports.filter(
        (o) => o.id !== r.id && o.category === r.category && distanceMeters(o.location, r.location) <= MAP_CONFIG.nearbyRadiusMeters,
      ).length;
      const marker = L.marker([r.location.lat, r.location.lng], {
        icon: pinIcon(categoryColor(r.category), r.isMine ? { ring: true, size: 34 } : {}),
        title: `${categoryLabel(r.category, r.otherCategory)}: ${r.title}`,
        alt: `${categoryLabel(r.category, r.otherCategory)} report`,
        keyboard: true,
      }).bindPopup(popupHtml(r, similar), { minWidth: 240, closeButton: false });
      marker.on("popupopen", (e: L.PopupEvent) => {
        e.popup
          .getElement()
          ?.querySelector("[data-view-report]")
          ?.addEventListener("click", () => {
            marker.closePopup();
            onViewRef.current(r);
          });
      });
      marker.addTo(layer);
    }
  }, [reports]);

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />
      {tilesFailed && (
        <MapImageryNotice className="top-20 left-3 right-16 sm:right-auto">
          Map imagery can&apos;t load here. Pins are placed at each report&apos;s recorded coordinates.
        </MapImageryNotice>
      )}
    </div>
  );
}
