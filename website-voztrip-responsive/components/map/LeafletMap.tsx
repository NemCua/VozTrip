"use client";
import { useEffect, useRef, useState } from "react";
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

function RecenterControl({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  return (
    <button
      onClick={() => coords && map.flyTo([coords.lat, coords.lng], 16, { duration: 0.5 })}
      className="absolute right-4 bottom-32 z-[1000] w-11 h-11 rounded-full bg-white border border-[#e8dfc8] shadow-md flex items-center justify-center"
      title="Vị trí của tôi"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        <path d="M12 2a10 10 0 0 1 10 10A10 10 0 0 1 12 22 10 10 0 0 1 2 12 10 10 0 0 1 12 2z" opacity=".2"/>
      </svg>
    </button>
  );
}

type Props = {
  pois: Poi[];
  selectedPoiId: string | null;
  userCoords: { lat: number; lng: number } | null;
  onMarkerClick: (poi: Poi) => void;
};

export default function LeafletMap({ pois, selectedPoiId, userCoords, onMarkerClick }: Props) {
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
      <RecenterControl coords={userCoords} />
    </MapContainer>
  );
}
