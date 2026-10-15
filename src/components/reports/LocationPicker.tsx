"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAP_CONFIG, categoryColor } from "@/lib/config/reports";
import { reverseGeocode, searchPlaces, type GeocodeResult } from "@/lib/services/geocoding";
import type { CommunityReport, GeoLocation } from "@/lib/types";
import { cn, formatCoords } from "@/lib/utils";
import { MapImageryNotice } from "./MapImageryNotice";
import { createBaseMap, escapeHtml, pinIcon } from "./mapIcons";

export default function LocationPicker({
  value,
  onChange,
  otherReports,
  invalid,
}: {
  value: GeoLocation | null;
  onChange: (loc: GeoLocation) => void;
  otherReports: CommunityReport[];
  invalid?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const othersRef = useRef<L.LayerGroup | null>(null);
  const pinRef = useRef<{ marker: L.Marker; circle: L.Circle } | null>(null);
  const placePinRef = useRef<(lat: number, lng: number) => void>(() => {});
  const lookupId = useRef(0);

  const [tilesFailed, setTilesFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [geoError, setGeoError] = useState("");

  const placePin = async (lat: number, lng: number, knownLabel?: string) => {
    const id = ++lookupId.current;
    const fallback = "Pinned location";
    onChange({ lat, lng, label: knownLabel ?? fallback });
    if (knownLabel) return;
    setLookingUp(true);
    try {
      const label = await reverseGeocode(lat, lng);
      if (id === lookupId.current) onChange({ lat, lng, label: label || fallback });
    } catch {
      /* keep coordinates; address lookup is best-effort */
    } finally {
      if (id === lookupId.current) setLookingUp(false);
    }
  };

  // Leaflet handlers are registered once, so they call the latest placePin through a ref.
  useEffect(() => {
    placePinRef.current = (lat, lng) => void placePin(lat, lng);
  });

  // Create the map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = createBaseMap(el, () => setTilesFailed(true));
    othersRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => placePinRef.current(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      othersRef.current = null;
      pinRef.current = null;
    };
  }, []);

  // Other residents' active reports, shown as small dots for context.
  useEffect(() => {
    const layer = othersRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const r of otherReports) {
      L.circleMarker([r.location.lat, r.location.lng], {
        radius: 5,
        color: "#fff",
        weight: 1.5,
        fillColor: categoryColor(r.category),
        fillOpacity: 0.9,
      })
        .bindTooltip(escapeHtml(`${r.category}: ${r.title}`))
        .addTo(layer);
    }
  }, [otherReports]);

  // The resident's draggable pin and the "nearby" radius around it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      pinRef.current?.marker.remove();
      pinRef.current?.circle.remove();
      pinRef.current = null;
      return;
    }
    const ll: L.LatLngTuple = [value.lat, value.lng];
    if (pinRef.current) {
      pinRef.current.marker.setLatLng(ll);
      pinRef.current.circle.setLatLng(ll);
      return;
    }
    const circle = L.circle(ll, {
      radius: MAP_CONFIG.nearbyRadiusMeters,
      color: "#418054",
      weight: 1.5,
      dashArray: "6 6",
      fillColor: "#418054",
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(map);
    const marker = L.marker(ll, {
      icon: pinIcon("#418054", { size: 40, className: "picker-pin" }),
      draggable: true,
      keyboard: true,
      title: "Report location. Drag to adjust.",
      alt: "Report location pin",
    }).addTo(map);
    marker.bindTooltip("Drag to adjust", { permanent: true, direction: "top", offset: [0, -46], className: "drag-tip" });
    marker.on("drag", () => circle.setLatLng(marker.getLatLng()));
    marker.on("dragend", () => {
      const p = marker.getLatLng();
      placePinRef.current(p.lat, p.lng);
    });
    pinRef.current = { marker, circle };
  }, [value]);

  const onSearch = async () => {
    const q = query.trim();
    if (q.length < 3) {
      setSearchError("Type at least 3 characters.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const r = await searchPlaces(q);
      setResults(r);
      if (r.length === 0) setSearchError("No matching places found near Barangay Baesa.");
    } catch {
      setResults(null);
      setSearchError("Address search couldn't connect. Tap the map to place the pin instead.");
    } finally {
      setSearching(false);
    }
  };

  const useMyLocation = () => {
    setGeoError("");
    if (!("geolocation" in navigator)) {
      setGeoError("Location is not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 18);
        void placePin(latitude, longitude);
      },
      () => setGeoError("Couldn't get your location. Check your browser's location permission, or tap the map instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <div
        className={cn(
          "relative h-[320px] overflow-hidden rounded-2xl border sm:h-[420px]",
          invalid ? "border-status-red ring-2 ring-status-red/20" : "border-line",
        )}
      >
        <div ref={containerRef} className="size-full" />

        {/* Search overlay. Not a <form>: this component sits inside the report form, and forms can't nest. */}
        <div className="absolute top-3 right-14 left-3 z-[500] sm:right-auto sm:w-80">
          <div role="search" className="flex items-center gap-2 rounded-full bg-white pr-1.5 pl-4 shadow-lg">
            <Search className="size-4 shrink-0 text-muted" aria-hidden />
            <label htmlFor="map-search" className="sr-only">
              Search street or landmark
            </label>
            <input
              id="map-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onSearch();
                }
              }}
              placeholder="Search street or landmark"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              autoComplete="off"
            />
            {searching ? (
              <LoaderCircle className="mr-2 size-4 animate-spin text-muted" aria-label="Searching" />
            ) : (
              <button
                type="button"
                onClick={() => void onSearch()}
                className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Search
              </button>
            )}
          </div>
          {(results?.length || searchError) && (
            <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-lg">
              {searchError && <p className="px-4 py-3 text-xs text-muted">{searchError}</p>}
              {results && results.length > 0 && (
                <ul aria-label="Search results">
                  {results.map((r, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          setResults(null);
                          setQuery(r.label);
                          mapRef.current?.flyTo([r.lat, r.lng], 18);
                          void placePin(r.lat, r.lng, r.label);
                        }}
                        className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm hover:bg-brand-50"
                      >
                        <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
                        {r.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {!value && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-3 z-[500] mx-auto w-fit rounded-full bg-sidebar/90 px-4 py-2 text-center text-xs font-semibold text-white shadow",
              tilesFailed ? "bottom-20" : "bottom-8",
            )}
          >
            Tap the map to drop a pin
          </div>
        )}

        {tilesFailed && (
          <MapImageryNotice className="bottom-6 left-3 right-3 sm:right-auto">
            Map imagery can&apos;t load here. Tapping still places the pin and records its coordinates.
          </MapImageryNotice>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-500">
            <MapPin className="size-5" aria-hidden />
          </span>
          <div className="min-w-0" aria-live="polite">
            {value ? (
              <>
                <p className="truncate font-semibold text-ink">
                  {value.label}
                  {lookingUp && <span className="ml-2 text-xs font-normal text-muted">Looking up address…</span>}
                </p>
                <p className="text-sm text-muted">{formatCoords(value.lat, value.lng)}</p>
              </>
            ) : (
              <p className="text-sm text-muted">No location selected yet.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <LocateFixed className="size-4" aria-hidden />
          Current location
        </button>
      </div>
      {geoError && <p className="mt-2 text-xs text-status-red">{geoError}</p>}
    </div>
  );
}
