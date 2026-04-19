"use client";
import { useEffect, useRef, useState } from "react";
import { Poi } from "@/services/api";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGPS(pois: Poi[], onTrigger: (poi: Poi) => void) {
  const triggeredIds = useRef<Set<string>>(new Set());
  const [hasPermission, setHasPermission] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation || pois.length === 0) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setHasPermission(true);
        setUserCoords({ lat: latitude, lng: longitude });
        for (const poi of pois) {
          if (triggeredIds.current.has(poi.poiId)) continue;
          const dist = haversineDistance(latitude, longitude, poi.latitude, poi.longitude);
          if (dist <= (poi.triggerRadius ?? 10)) {
            triggeredIds.current.add(poi.poiId);
            onTrigger(poi);
          }
        }
      },
      () => setHasPermission(false),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [pois]);

  return { hasPermission, userCoords };
}
