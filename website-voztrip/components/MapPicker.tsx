"use client";

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

// Dùng dynamic import tránh SSR error của leaflet
export default function MapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Import leaflet chỉ ở client
    import("leaflet").then((L) => {
      // Fix default icon
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = isNaN(lat) || lat === 0 ? 21.028 : lat;
      const initLng = isNaN(lng) || lng === 0 ? 105.834 : lng;

      const map = L.map(containerRef.current!).setView([initLat, initLng], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      // Drag marker
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      // Click map → move marker
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });
    });

    // CSS leaflet
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật marker khi lat/lng thay đổi từ bên ngoài (input thủ công)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (isNaN(lat) || isNaN(lng)) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: "280px", width: "100%", borderRadius: "2px", border: "1px solid #d8cbb0" }}
    />
  );
}
