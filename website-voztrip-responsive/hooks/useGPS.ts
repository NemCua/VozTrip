"use client";
import { useEffect, useRef } from "react";
import { resolveGpsTrigger, TriggerResult } from "@/services/api";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGPS(
  langId: string | null,
  sessionId: string,
  onTriggers: (results: TriggerResult[]) => void
) {
  const triggeredIdsRef = useRef<Set<string>>(new Set());
  const lastCallRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const onTriggersRef = useRef(onTriggers);
  useEffect(() => { onTriggersRef.current = onTriggers; });

  useEffect(() => {
    if (!langId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const now = Date.now();
        const last = lastCallRef.current;

        // Throttle: skip if moved <10m AND <8s elapsed
        if (last) {
          const moved = haversine(last.lat, last.lon, lat, lon);
          if (moved < 10 && now - last.time < 8_000) return;
        }
        lastCallRef.current = { lat, lon, time: now };

        const results = await resolveGpsTrigger({
          lat, lon,
          languageId: langId,
          sessionId,
          alreadyTriggered: [...triggeredIdsRef.current],
        });

        if (results.length === 0) return;
        results.forEach(r => triggeredIdsRef.current.add(r.poiId));
        onTriggersRef.current(results);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5_000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [langId, sessionId]);
}
