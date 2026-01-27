"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

type Props = {
  lat?: number | null;
  lng?: number | null;
  label?: string;
  height?: number;
};

// Fix default marker icons for Leaflet on Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function MapView({ lat, lng, label, height = 260 }: Props) {
  const position = useMemo(() => {
    if (!lat || !lng) return null;
    return { lat, lng };
  }, [lat, lng]);

  if (!position) {
    return <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">Координати відсутні</div>;
  }

  return (
    <MapContainer center={[position.lat, position.lng]} zoom={14} scrollWheelZoom={false} style={{ height, width: "100%", borderRadius: "18px" }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[position.lat, position.lng]}>
        <Popup>{label ?? "Партнер"}</Popup>
      </Marker>
    </MapContainer>
  );
}
