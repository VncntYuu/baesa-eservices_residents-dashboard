"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { statusTone, toneClasses } from "@/components/ui/StatusBadge";
import { MAP_CONFIG, categoryColor } from "@/lib/config/reports";
import type { CommunityReport } from "@/lib/types";
import { distanceMeters, formatDate } from "@/lib/utils";
import { MapImageryNotice } from "./MapImageryNotice";
import { createBaseMap, escapeHtml, pinIcon } from "./mapIcons";

function popupHtml(r: CommunityReport, nearby: number): string {
  const badge = toneClasses[statusTone(r.status)].badge;
  return `
    <div class="min-w-52 font-sans">
      <div class="flex items-center justify-between gap-3">
        <p class="!m-0 text-base font-bold" style="color:${categoryColor(r.category)}">${escapeHtml(r.category)}</p>
        <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${badge}">${escapeHtml(r.status)}</span>
      </div>
      <p class="!my-1 text-sm font-semibold text-ink">${escapeHtml(r.title)}</p>
      <p class="!my-0 text-xs text-muted">${escapeHtml(r.location.label)} · ${formatDate(r.submittedAt)}${
        nearby > 0 ? ` · ${nearby} similar nearby` : ""
      }</p>
      ${
        r.isMine
          ? `<button type="button" data-view-report class="mt-2 text-sm font-semibold text-brand-500 hover:underline">View details →</button>`
          : ""
      }
    </div>`;
}

export default function ReportsMap({
  reports,
  onViewDetails,
}: {
  reports: CommunityReport[];
  onViewDetails: (report: CommunityReport) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    return () => {
      map.remove();
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const r of reports) {
      // Count nearby reports of the same category (information only — never merged automatically).
      const nearby = reports.filter(
        (o) => o.id !== r.id && o.category === r.category && distanceMeters(o.location, r.location) <= MAP_CONFIG.nearbyRadiusMeters,
      ).length;
      const marker = L.marker([r.location.lat, r.location.lng], {
        icon: pinIcon(categoryColor(r.category), r.isMine ? { ring: true, size: 34 } : {}),
        title: `${r.category}: ${r.title}`,
        alt: `${r.category} report`,
        keyboard: true,
      }).bindPopup(popupHtml(r, nearby), { minWidth: 220 });
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
        <MapImageryNotice className="top-3 left-3 right-16 sm:right-auto">
          Map imagery can&apos;t load here. Pins are placed at each report&apos;s recorded coordinates.
        </MapImageryNotice>
      )}
    </div>
  );
}
