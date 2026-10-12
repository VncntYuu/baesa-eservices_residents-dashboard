"use client";

import dynamic from "next/dynamic";

function MapLoading() {
  return (
    <div className="grid size-full min-h-[320px] place-items-center rounded-2xl bg-brand-50 text-sm text-muted" aria-busy="true">
      Loading map…
    </div>
  );
}

/** Leaflet touches `window`, so the maps are client-only. */
export const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false, loading: MapLoading });
export const ReportsMap = dynamic(() => import("./ReportsMap"), { ssr: false, loading: MapLoading });
