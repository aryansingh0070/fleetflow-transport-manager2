import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { Trip } from "../../types";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const routeIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconAnchor: [12, 41],
});

const center = { lat: 40.7128, lng: -74.006 };

type RouteMapProps = {
  trips: Trip[];
};

const distanceBetween = (from: [number, number], to: [number, number]) => {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = rad(to[0] - from[0]);
  const dLon = rad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(from[0])) * Math.cos(rad(to[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function RouteMap({ trips }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const routeTrip = useMemo(() => {
    return [...trips].sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0))[0] ?? null;
  }, [trips]);

  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!routeTrip) {
      return [
        [center.lat, center.lng],
        [center.lat + 0.03, center.lng + 0.04],
        [center.lat + 0.05, center.lng - 0.02],
      ] as [number, number][];
    }
    const base: [number, number] = [center.lat, center.lng];
    return [
      base,
      [base[0] + 0.02, base[1] + 0.03],
      [base[0] + 0.05, base[1] + 0.01],
    ];
  }, [routeTrip]);

  const routeDistance = useMemo(() => {
    let distance = 0;
    for (let i = 1; i < routeCoordinates.length; i += 1) {
      distance += distanceBetween(routeCoordinates[i - 1], routeCoordinates[i]);
    }
    return distance;
  }, [routeCoordinates]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([center.lat, center.lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    } else {
      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const polyline = L.polyline(routeCoordinates, { color: "#6366F1", weight: 4 }).addTo(routeLayerRef.current);
    routeCoordinates.forEach((position, index) => {
      L.marker(position, { icon: routeIcon })
        .bindPopup(index === 0 ? "Route start" : index === routeCoordinates.length - 1 ? "Route end" : "Waypoint")
        .addTo(routeLayerRef.current!);
    });
    mapRef.current.fitBounds(polyline.getBounds().pad(0.5));
  }, [routeCoordinates]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Route analytics</p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Recommended journey</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Distance summary: {routeDistance.toFixed(1)} km • Revenue potential {currencyFormatter.format(routeTrip?.revenue ?? 0)}
        </p>
      </div>
      <div ref={containerRef} className="h-80 w-full rounded-2xl" aria-live="polite" />
    </section>
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
