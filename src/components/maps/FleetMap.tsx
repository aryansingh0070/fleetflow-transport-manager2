import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { Vehicle } from "../../types";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const fleetIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconAnchor: [12, 41],
});

const baseCenter = { lat: 40.7128, lng: -74.006 };

type FleetMapProps = {
  vehicles: Vehicle[];
};

export function FleetMap({ vehicles }: FleetMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const markers = useMemo(
    () =>
      vehicles.map((vehicle, index) => ({
        id: vehicle.id,
        position: [
          baseCenter.lat + ((index + 1) * 0.016) % 0.24 - 0.12,
          baseCenter.lng + ((index + 2) * 0.02) % 0.3 - 0.15,
        ] as [number, number],
        label: vehicle.name,
        status: vehicle.status,
      })),
    [vehicles],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([baseCenter.lat, baseCenter.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();
    } else {
      markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    markers.forEach((marker) => {
      L.marker(marker.position, { icon: fleetIcon })
        .bindPopup(`<strong>${marker.label}</strong><br/>Status: ${marker.status}`)
        .addTo(markerGroupRef.current!);
    });
  }, [markers]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fleet map</p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Live vehicle locations</h3>
      </div>
      <div ref={containerRef} className="h-80 w-full rounded-2xl" aria-live="polite" />
    </section>
  );
}
