"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type PoiMapItem = {
  poiId: string;
  poiName: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  visits24h: number;
};

function getColor(visits: number): string {
  if (visits >= 20) return "#dc2626";
  if (visits >= 10) return "#ea580c";
  if (visits >= 5)  return "#ca8a04";
  if (visits >= 1)  return "#16a34a";
  return "#94a3b8";
}

// pixel radius — luôn nhìn thấy bất kể zoom
function getPixelRadius(visits: number): number {
  if (visits >= 20) return 22;
  if (visits >= 10) return 18;
  if (visits >= 5)  return 14;
  if (visits >= 1)  return 11;
  return 8;
}

function FitBounds({ pois }: { pois: PoiMapItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pois.length) return;
    const bounds = L.latLngBounds(pois.map(p => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [map, pois]);
  return null;
}

export default function MapView({ pois }: { pois: PoiMapItem[] }) {
  const center = pois.length
    ? [
        pois.reduce((s, p) => s + p.latitude, 0) / pois.length,
        pois.reduce((s, p) => s + p.longitude, 0) / pois.length,
      ] as [number, number]
    : [21.028, 105.834] as [number, number];

  return (
    <MapContainer center={center} zoom={14} className="w-full h-full z-0" zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds pois={pois} />
      {pois.map(poi => (
        <CircleMarker
          key={poi.poiId}
          center={[poi.latitude, poi.longitude]}
          radius={getPixelRadius(poi.visits24h)}
          pathOptions={{
            color: "#fff",
            weight: 2,
            fillColor: getColor(poi.visits24h),
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: "#2c2416" }}>{poi.poiName}</div>
              <div style={{ fontSize: 13, color: "#8c7a5e" }}>
                Lượt visit 24h:{" "}
                <span style={{ fontWeight: 700, color: getColor(poi.visits24h) }}>
                  {poi.visits24h}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#b09878", marginTop: 2 }}>
                Trigger radius: {poi.triggerRadius}m
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
