import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { Poi } from "../services/api";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // metres
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

  useEffect(() => {
    if (pois.length === 0) return;

    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      setHasPermission(true);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (location) => {
          const { latitude, longitude } = location.coords;
          for (const poi of pois) {
            if (triggeredIds.current.has(poi.poiId)) continue;
            const dist = haversineDistance(latitude, longitude, poi.latitude, poi.longitude);
            if (dist <= (poi.triggerRadius ?? 10)) {
              triggeredIds.current.add(poi.poiId);
              onTrigger(poi);
            }
          }
        }
      );
    })();

    return () => { subscription?.remove(); };
  }, [pois]);

  return { hasPermission };
}
