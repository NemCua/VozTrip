import { useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Animated, Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { getPois, getPoiDetail, Poi, PoiDetail } from "../services/api";
import { useAudio } from "../hooks/useAudio";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.38;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
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

type Props = {
  languageCode: string;
  languageId: string;
  sessionId: string;
  onPoiPress: (poiId: string) => void;
};

export default function MapScreen({ languageCode, languageId, onPoiPress }: Props) {
  const mapRef = useRef<MapView>(null);
  const panelAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const { play, stop, playing, currentId } = useAudio();
  const insets = useSafeAreaInsets();

  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PoiDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const { data: pois = [] } = useQuery({
    queryKey: ["pois", languageId],
    queryFn: () => getPois(languageId),
  });

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
        (loc) => setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  const showPanel = () => {
    setPanelVisible(true);
    Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const hidePanel = () => {
    Animated.timing(panelAnim, { toValue: PANEL_HEIGHT, duration: 250, useNativeDriver: true }).start(
      () => { setPanelVisible(false); setSelectedPoi(null); setSelectedDetail(null); }
    );
  };

  const handleMarkerPress = async (poi: Poi) => {
    stop();
    setSelectedPoi(poi);
    setSelectedDetail(null);
    setLoadingDetail(true);
    showPanel();
    try {
      const detail = await getPoiDetail(poi.poiId, languageId);
      setSelectedDetail(detail);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRecenter = () => {
    if (!userCoords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...userCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  };

  const localization = selectedDetail?.localizations.find(
    (l) => l.languageCode === languageCode
  );
  const thumbnail = selectedDetail?.media?.[0]?.mediaUrl ?? null;
  const distance =
    userCoords && selectedPoi
      ? haversine(userCoords.latitude, userCoords.longitude, selectedPoi.latitude, selectedPoi.longitude)
      : null;
  const isCurrentPlaying = playing && currentId === selectedPoi?.poiId;

  const initialRegion = pois.length
    ? {
        latitude: pois.reduce((s, p) => s + p.latitude, 0) / pois.length,
        longitude: pois.reduce((s, p) => s + p.longitude, 0) / pois.length,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : { latitude: 21.028, longitude: 105.834, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={panelVisible ? hidePanel : undefined}
      >
        {pois.map((poi) => {
          const isSelected = selectedPoi?.poiId === poi.poiId;
          return (
            <Marker
              key={poi.poiId}
              coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
              onPress={(e) => { e.stopPropagation(); handleMarkerPress(poi); }}
            >
              <View style={styles.markerWrap}>
                <View style={[styles.markerBubble, isSelected && styles.markerBubbleSelected]}>
                  <Ionicons name="location" size={20} color={isSelected ? "#fff" : "#c8a96e"} />
                </View>
                <View style={[styles.markerTail, isSelected && styles.markerTailSelected]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Recenter FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: panelVisible ? PANEL_HEIGHT + 16 : 80 + insets.bottom }]}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Ionicons name="locate-outline" size={22} color="#2c2416" />
      </TouchableOpacity>

      {/* Slide-up panel */}
      {panelVisible && (
        <Animated.View
          style={[
            styles.panel,
            { height: PANEL_HEIGHT + insets.bottom, transform: [{ translateY: panelAnim }] },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={hidePanel}>
            <Ionicons name="close" size={20} color="#b09878" />
          </TouchableOpacity>

          {selectedPoi && (
            <View style={styles.sheetContent}>
              {/* Row: thumbnail + info */}
              <View style={styles.infoRow}>
                <View style={styles.thumbBox}>
                  {loadingDetail ? (
                    <ActivityIndicator color="#c8a96e" />
                  ) : thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={30} color="#d8cbb0" />
                  )}
                </View>

                <View style={styles.infoText}>
                  <Text style={styles.poiName} numberOfLines={2}>
                    {localization?.title ?? selectedPoi.poiName}
                  </Text>
                  <Text style={styles.shopName} numberOfLines={1}>
                    {selectedPoi.shopName}
                  </Text>
                  {distance !== null && (
                    <View style={styles.distRow}>
                      <Ionicons name="navigate-outline" size={12} color="#b09060" />
                      <Text style={styles.distText}>
                        {distance < 1000
                          ? `~${Math.round(distance)}m từ bạn`
                          : `~${(distance / 1000).toFixed(1)}km từ bạn`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Description preview */}
              {!loadingDetail && localization?.description ? (
                <Text style={styles.desc} numberOfLines={2}>
                  {localization.description}
                </Text>
              ) : null}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPlay]}
                  activeOpacity={0.8}
                  disabled={loadingDetail}
                  onPress={() =>
                    play(
                      selectedPoi.poiId,
                      localization?.audioUrl,
                      localization?.description ?? selectedPoi.poiName,
                      languageCode
                    )
                  }
                >
                  <Ionicons
                    name={isCurrentPlaying ? "pause-circle" : "play-circle"}
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.btnPlayText}>
                    {isCurrentPlaying ? "Dừng" : "Nghe thuyết minh"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnDetail]}
                  activeOpacity={0.8}
                  onPress={() => { stop(); hidePanel(); onPoiPress(selectedPoi.poiId); }}
                >
                  <Ionicons name="book-outline" size={18} color="#2c2416" />
                  <Text style={styles.btnDetailText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  markerWrap: { alignItems: "center" },
  markerBubble: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#c8a96e",
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  markerBubbleSelected: { backgroundColor: "#c8a96e", borderColor: "#c8a96e" },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#c8a96e", marginTop: -1,
  },
  markerTailSelected: { borderTopColor: "#c8a96e" },

  fab: {
    position: "absolute", right: 16,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6,
    elevation: 5, borderWidth: 1, borderColor: "#e8dfc8",
  },

  panel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fdfaf4",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12,
    elevation: 10,
  },
  handleWrap: { alignItems: "center", paddingTop: 10 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#d8cbb0" },
  closeBtn: { position: "absolute", top: 10, right: 16, padding: 4 },

  sheetContent: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },

  infoRow: { flexDirection: "row", gap: 14 },
  thumbBox: {
    width: 76, height: 76, borderRadius: 12,
    backgroundColor: "#f0e8d8",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  thumb: { width: 76, height: 76 },

  infoText: { flex: 1, gap: 3, justifyContent: "center" },
  poiName: { fontSize: 16, fontWeight: "600", color: "#2c2416" },
  shopName: { fontSize: 12, color: "#b09878" },
  distRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  distText: { fontSize: 12, color: "#b09060" },

  desc: { fontSize: 13, color: "#6b5c45", lineHeight: 19 },

  actions: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 13, borderRadius: 12,
  },
  btnPlay: { backgroundColor: "#c8a96e" },
  btnPlayText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  btnDetail: { backgroundColor: "#f0e8d8" },
  btnDetailText: { color: "#2c2416", fontSize: 14, fontWeight: "600" },
});
