"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Poi } from "@/services/api";

function makeIcon(selected: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:${selected ? "#c8a96e" : "#fff"};
          border:2px solid #c8a96e;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.18);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${selected ? "#fff" : "#c8a96e"}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:6px solid #c8a96e;margin-top:-1px;
        "></div>
      </div>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  });
}

// Handles auto-center on first GPS fix + manual flyTo triggered from outside
function MapController({
  userCoords,
  flyToTrigger,
}: {
  userCoords: { lat: number; lng: number } | null;
  flyToTrigger: number;
}) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (userCoords && !hasCenteredRef.current) {
      hasCenteredRef.current = true;
      map.flyTo([userCoords.lat, userCoords.lng], 16, { duration: 1 });
    }
  }, [userCoords, map]);

  useEffect(() => {
    if (flyToTrigger > 0 && userCoords) {
      map.flyTo([userCoords.lat, userCoords.lng], 16, { duration: 0.5 });
    }
  }, [flyToTrigger, map]);

  return null;
}

type Props = {
  pois: Poi[];
  selectedPoiId: string | null;
  userCoords: { lat: number; lng: number } | null;
  flyToTrigger: number;
  onMarkerClick: (poi: Poi) => void;
};

export default function LeafletMap({ pois, selectedPoiId, userCoords, flyToTrigger, onMarkerClick }: Props) {
  const center = pois.length
    ? {
        lat: pois.reduce((s, p) => s + p.latitude, 0) / pois.length,
        lng: pois.reduce((s, p) => s + p.longitude, 0) / pois.length,
      }
    : { lat: 21.028, lng: 105.834 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pois.map((poi) => (
        <Marker
          key={poi.poiId}
          position={[poi.latitude, poi.longitude]}
          icon={makeIcon(selectedPoiId === poi.poiId)}
          eventHandlers={{ click: () => onMarkerClick(poi) }}
        />
      ))}
      {userCoords && (
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={L.divIcon({
            className: "",
            html: `
              <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
                <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(59,130,246,0.25);animation:userPulse 1.8s ease-out infinite"></div>
                <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(59,130,246,0.12);animation:userPulse 1.8s ease-out 0.6s infinite"></div>
                <div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,0.6);position:relative;z-index:1"></div>
              </div>`,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          })}
        />
      )}
      <MapController userCoords={userCoords} flyToTrigger={flyToTrigger} />
    </MapContainer>
  );
}
