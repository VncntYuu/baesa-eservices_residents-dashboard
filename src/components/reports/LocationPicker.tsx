"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMapEvents } from "react-leaflet";
import { MAP_CONFIG, categoryColor } from "@/lib/config/reports";
import { reverseGeocode, searchPlaces, type GeocodeResult } from "@/lib/services/geocoding";
import type { CommunityReport, GeoLocation } from "@/lib/types";
import { cn, formatCoords } from "@/lib/utils";
import { pinIcon } from "./mapIcons";

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

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
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [geoError, setGeoError] = useState("");
  const lookupId = useRef(0);

  const icon = useMemo(() => pinIcon("#418054", { size: 40, className: "picker-pin" }), []);

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
      setSearchError("Search is unavailable right now. You can still tap the map to place the pin.");
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
        map?.flyTo([latitude, longitude], 18);
        void placePin(latitude, longitude);
      },
      () => setGeoError("Couldn't get your location. Check your browser's location permission."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const center = value ?? MAP_CONFIG.center;

  return (
    <div>
      <div
        className={cn(
          "relative h-[320px] overflow-hidden rounded-2xl border sm:h-[420px]",
          invalid ? "border-status-red ring-2 ring-status-red/20" : "border-line",
        )}
      >
        <MapContainer
          ref={setMap}
          center={[center.lat, center.lng]}
          zoom={MAP_CONFIG.defaultZoom}
          className="size-full"
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.tileAttribution} />
          <ZoomControl position="topright" />
          <ClickToPlace onPick={(lat, lng) => void placePin(lat, lng)} />
          {otherReports.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.location.lat, r.location.lng]}
              radius={5}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: categoryColor(r.category), fillOpacity: 0.9 }}
            >
              <Tooltip>
                {r.category}: {r.title}
              </Tooltip>
            </CircleMarker>
          ))}
          {value && (
            <>
              <Circle
                center={[value.lat, value.lng]}
                radius={MAP_CONFIG.nearbyRadiusMeters}
                pathOptions={{ color: "#418054", weight: 1.5, dashArray: "6 6", fillColor: "#418054", fillOpacity: 0.08 }}
              />
              <Marker
                position={[value.lat, value.lng]}
                icon={icon}
                draggable
                keyboard
                title="Report location. Drag to adjust."
                eventHandlers={{
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    void placePin(ll.lat, ll.lng);
                  },
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -46]} className="!rounded-full !border-0 !bg-sidebar !px-3 !py-1 !text-xs !font-semibold !text-white !shadow">
                  Drag to adjust
                </Tooltip>
              </Marker>
            </>
          )}
        </MapContainer>

        {/* Search overlay (outside MapContainer so typing/clicking doesn't move the map) */}
        <div className="absolute top-3 right-14 left-3 z-[500] sm:right-auto sm:w-80">
          {/* Not a <form>: this component sits inside the report form, and forms can't nest. */}
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
                          map?.flyTo([r.lat, r.lng], 18);
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
          <div className="pointer-events-none absolute inset-x-3 bottom-8 z-[500] mx-auto w-fit rounded-full bg-sidebar/90 px-4 py-2 text-center text-xs font-semibold text-white shadow">
            Tap the map to drop a pin
          </div>
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
          Use my location
        </button>
      </div>
      {geoError && <p className="mt-2 text-xs text-status-red">{geoError}</p>}
    </div>
  );
}
