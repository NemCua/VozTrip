import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { getPois, Poi } from "../services/api";
import { useAudio } from "../hooks/useAudio";
import { tr } from "../i18n/translations";

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

function formatDist(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

type PoiWithDist = Poi & { distance: number | null };

type Props = {
  languageCode: string;
  languageId: string;
  onPoiPress: (poiId: string) => void;
};

export default function NearbyScreen({ languageCode, languageId, onPoiPress }: Props) {
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locError, setLocError] = useState(false);
  const { play, stop, playing, currentId } = useAudio();

  const { data: pois = [], isLoading } = useQuery<Poi[]>({
    queryKey: ["pois", languageId],
    queryFn: () => getPois(languageId),
  });

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setLocError(true); return; }
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (loc) => setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  const sorted: PoiWithDist[] = pois
    .map((p) => ({
      ...p,
      distance: userCoords
        ? haversine(userCoords.latitude, userCoords.longitude, p.latitude, p.longitude)
        : null,
    }))
    .sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  const renderItem = ({ item, index }: { item: PoiWithDist; index: number }) => {
    const isPlaying = playing && currentId === item.poiId;
    const isClose = item.distance !== null && item.distance <= item.triggerRadius;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPoiPress(item.poiId)}
      >
        {/* Rank badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{String(index + 1).padStart(2, "0")}</Text>
        </View>

        {/* Thumbnail */}
        <View style={styles.thumb}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbImg} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="image-outline" size={22} color="#d8cbb0" />
            </View>
          )}
          {isClose && (
            <View style={styles.closeBadge}>
              <Ionicons name="radio" size={9} color="#fff" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.localizedName ?? item.poiName}</Text>
          <Text style={styles.shop} numberOfLines={1}>{item.shopName}</Text>

          <View style={styles.row}>
            {item.distance !== null ? (
              <View style={[styles.distChip, isClose && styles.distChipClose]}>
                <Ionicons
                  name="navigate"
                  size={10}
                  color={isClose ? "#16a34a" : "#b09060"}
                />
                <Text style={[styles.distText, isClose && styles.distTextClose]}>
                  {formatDist(item.distance)}
                </Text>
              </View>
            ) : (
              <View style={styles.distChip}>
                <Ionicons name="location-outline" size={10} color="#b09060" />
                <Text style={styles.distText}>{tr("nearby_locating_dist", languageCode)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Play button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={(e) => {
            e.stopPropagation();
            play(item.poiId, null, item.localizedName ?? item.poiName, languageCode);
          }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={16} color={isPlaying ? "#c8a96e" : "#8c7a5e"} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>{tr("nearby_sub", languageCode)}</Text>
          <Text style={styles.headerTitle}>{tr("tab_nearby", languageCode)}</Text>
        </View>
        {userCoords ? (
          <View style={styles.gpsActive}>
            <Ionicons name="locate" size={13} color="#16a34a" />
            <Text style={styles.gpsActiveText}>{tr("nearby_locating", languageCode)}</Text>
          </View>
        ) : (
          <ActivityIndicator size="small" color="#c8a96e" />
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {locError && (
        <View style={styles.errorBox}>
          <Ionicons name="location-outline" size={20} color="#c8a96e" />
          <Text style={styles.errorText}>{tr("nearby_no_perm", languageCode)}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c8a96e" />
          <Text style={styles.loadingText}>{tr("home_loading", languageCode)}</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(p) => p.poiId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHint}>
              {sorted.length} · {tr("nearby_hint", languageCode)}
            </Text>
          }
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
  },
  headerSub: { fontSize: 10, color: "#b09060", letterSpacing: 2, textTransform: "uppercase" },
  headerTitle: { fontSize: 24, color: "#2c2416", fontWeight: "300", letterSpacing: 0.5 },
  gpsActive: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  gpsActiveText: { fontSize: 11, color: "#16a34a", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#e8dfc8", marginHorizontal: 20, marginBottom: 4 },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    margin: 20, padding: 14, backgroundColor: "#fdf6e8",
    borderRadius: 12, borderWidth: 1, borderColor: "#e8d5a8",
  },
  errorText: { flex: 1, fontSize: 13, color: "#8c7a5e" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13, color: "#b09878" },

  listHint: { fontSize: 12, color: "#b09878", paddingHorizontal: 20, paddingVertical: 12 },
  list: { paddingHorizontal: 20 },

  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8dfc8",
    padding: 12, marginBottom: 10, gap: 12,
    shadowColor: "#2c2416", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },

  rankBadge: { width: 26, alignItems: "center" },
  rankText: { fontSize: 13, color: "#c8b898", fontWeight: "600" },

  thumb: { position: "relative" },
  thumbImg: { width: 64, height: 64, borderRadius: 10 },
  thumbPlaceholder: {
    width: 64, height: 64, borderRadius: 10,
    backgroundColor: "#f5f0e8", alignItems: "center", justifyContent: "center",
  },
  closeBadge: {
    position: "absolute", top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },

  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, color: "#2c2416", fontWeight: "500" },
  shop: { fontSize: 12, color: "#b09878" },
  row: { flexDirection: "row", marginTop: 4 },

  distChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fdf6e8", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-start",
  },
  distChipClose: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  distText: { fontSize: 11, color: "#b09060" },
  distTextClose: { color: "#16a34a", fontWeight: "500" },

  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f5f0e8", alignItems: "center", justifyContent: "center",
  },
});
