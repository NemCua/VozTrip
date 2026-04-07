import {
  View, Text, ScrollView, TextInput, Image,
  TouchableOpacity, StyleSheet, StatusBar, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getPois, Poi } from "../services/api";
import { useAudio } from "../hooks/useAudio";
import { useGPS } from "../hooks/useGPS";
import { logVisit } from "../services/api";

const FILTERS = ["Tất cả", "Gần đây", "Nổi bật"];

type Props = {
  languageCode: string;
  sessionId: string;
  onPoiPress: (poiId: string) => void;
  onChangeLanguage: () => void;
};

export default function HomeScreen({
  languageCode, sessionId, onPoiPress, onChangeLanguage
}: Props) {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [triggeredPoi, setTriggeredPoi] = useState<Poi | null>(null);
  const bannerAnim = useRef(new Animated.Value(100)).current;
  const { play, currentId, playing } = useAudio();

  const { data: pois = [], isLoading } = useQuery<Poi[]>({
    queryKey: ["pois"],
    queryFn: getPois,
  });

  // GPS hook — phát hiện POI gần
  useGPS(pois, async (poi) => {
    setTriggeredPoi(poi);
    // Hiện banner
    Animated.spring(bannerAnim, { toValue: 0, useNativeDriver: true }).start();
    // Tự phát audio
    play(poi.poiId, null, poi.poiName, languageCode);
    // Log visit
    try { await logVisit(sessionId, poi.poiId); } catch {}
    // Tự ẩn banner sau 8s
    setTimeout(() => hideBanner(), 8000);
  });

  const hideBanner = () => {
    Animated.timing(bannerAnim, { toValue: 100, duration: 300, useNativeDriver: true }).start(
      () => setTriggeredPoi(null)
    );
  };

  const filtered = pois.filter(p =>
    search.length === 0 || p.poiName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfaf4" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Tourism Guide</Text>
            <Text style={styles.headerLogo}>VozTrip</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={onChangeLanguage}>
              <Ionicons name="language-outline" size={20} color="#6b5c45" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#b09878" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm điểm tham quan..."
            placeholderTextColor="#b09878"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#b09878" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Hero ── */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hoan_Kiem_Lake_and_Ngoc_Son_Temple%2C_Hanoi%2C_Vietnam.jpg/640px-Hoan_Kiem_Lake_and_Ngoc_Son_Temple%2C_Hanoi%2C_Vietnam.jpg" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroLabel}>ĐANG Ở GẦN BẠN</Text>
            <Text style={styles.heroTitle}>Khám phá{"\n"}xung quanh</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="location-outline" size={13} color="#f5f0e8" />
              <Text style={styles.heroBadgeText}>{filtered.length} địa điểm</Text>
            </View>
          </View>
        </View>

        {/* ── Filters ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)}
              style={[styles.pill, activeFilter === f && styles.pillActive]}>
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── POI List ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Địa điểm gần bạn</Text>
          <Text style={styles.listCount}>{filtered.length} nơi</Text>
        </View>

        <View style={styles.listWrap}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <Ionicons name="map-outline" size={28} color="#c8a96e" />
              <Text style={styles.loadingText}>Đang tải địa điểm...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.loadingBox}>
              <Ionicons name="search-outline" size={28} color="#c8a96e" />
              <Text style={styles.loadingText}>Không tìm thấy địa điểm</Text>
            </View>
          ) : (
            filtered.map((poi, index) => {
              const isThisPlaying = playing && currentId === poi.poiId;
              return (
                <TouchableOpacity key={poi.poiId} style={styles.card}
                  activeOpacity={0.85} onPress={() => onPoiPress(poi.poiId)}>
                  <View style={styles.cardImageWrap}>
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#d8cbb0" />
                    </View>
                    {/* Play button overlay */}
                    <TouchableOpacity
                      style={styles.cardPlayBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        play(poi.poiId, null, poi.poiName, languageCode);
                      }}
                    >
                      <Ionicons
                        name={isThisPlaying ? "pause" : "play"}
                        size={18}
                        color="#fdfaf4"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <View style={styles.cardMeta}>
                        <View style={styles.zoneChip}>
                          <Text style={styles.cardZone}>POI</Text>
                        </View>
                        <View style={styles.distRow}>
                          <Ionicons name="location-outline" size={11} color="#b09878" />
                          <Text style={styles.cardDist}>{poi.triggerRadius}m radius</Text>
                        </View>
                      </View>
                      <Text style={styles.cardIndexText}>{String(index + 1).padStart(2, "0")}</Text>
                    </View>

                    <Text style={styles.cardName}>{poi.poiName}</Text>
                    <Text style={styles.cardShop} numberOfLines={1}>{poi.shopName}</Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.gpsChip}>
                        <Ionicons name="radio-outline" size={11} color="#16a34a" />
                        <Text style={styles.gpsChipText}>GPS trigger</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#d8cbb0" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── GPS Trigger Banner ── */}
      {triggeredPoi && (
        <Animated.View style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIcon}>
              <Ionicons name="radio" size={18} color="#c8a96e" />
            </View>
            <View>
              <Text style={styles.bannerLabel}>Bạn đang ở gần</Text>
              <Text style={styles.bannerName} numberOfLines={1}>{triggeredPoi.poiName}</Text>
            </View>
          </View>
          <View style={styles.bannerActions}>
            <TouchableOpacity style={styles.bannerDetailBtn}
              onPress={() => { hideBanner(); onPoiPress(triggeredPoi.poiId); }}>
              <Text style={styles.bannerDetailText}>Xem</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={hideBanner}>
              <Ionicons name="close" size={18} color="#8c7a5e" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerSub: { fontSize: 10, letterSpacing: 2, color: "#b09060", textTransform: "uppercase" },
  headerLogo: { fontSize: 24, color: "#2c2416", fontWeight: "300", letterSpacing: 1 },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#f5f0e8", borderWidth: 1, borderColor: "#e8dfc8",
    alignItems: "center", justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "#f5f0e8", borderRadius: 12,
    borderWidth: 1, borderColor: "#e8dfc8",
    paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#2c2416" },
  heroWrap: { marginHorizontal: 20, borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  heroImage: { width: "100%", height: 190 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(44,36,22,0.42)",
    padding: 20, justifyContent: "flex-end",
  },
  heroLabel: { fontSize: 10, color: "#c8a96e", letterSpacing: 2, marginBottom: 4 },
  heroTitle: { fontSize: 24, color: "#fff", fontWeight: "300", lineHeight: 30, marginBottom: 10 },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    backgroundColor: "rgba(200,169,110,0.2)", borderWidth: 1,
    borderColor: "rgba(200,169,110,0.6)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 12, color: "#f5f0e8" },
  filterScroll: { marginBottom: 20 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#d8cbb0" },
  pillActive: { backgroundColor: "#2c2416", borderColor: "#2c2416" },
  pillText: { fontSize: 13, color: "#8c7a5e" },
  pillTextActive: { color: "#f5f0e8" },
  listHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 12,
  },
  listTitle: { fontSize: 16, color: "#2c2416", fontWeight: "500" },
  listCount: { fontSize: 12, color: "#b09878" },
  listWrap: { paddingHorizontal: 20, gap: 14 },
  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText: { fontSize: 13, color: "#b09878" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "#e8dfc8",
    shadowColor: "#2c2416", shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardImageWrap: { position: "relative" },
  cardImagePlaceholder: {
    width: "100%", height: 140,
    backgroundColor: "#f5f0e8", alignItems: "center", justifyContent: "center",
  },
  cardPlayBtn: {
    position: "absolute", bottom: 12, right: 12,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#2c2416",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  zoneChip: { backgroundColor: "#fdf6e8", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  cardZone: { fontSize: 10, color: "#c8a96e", letterSpacing: 1, textTransform: "uppercase" },
  distRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  cardDist: { fontSize: 11, color: "#b09878" },
  cardIndexText: { fontSize: 12, color: "#c8b898", fontWeight: "500" },
  cardName: { fontSize: 16, color: "#2c2416", fontWeight: "500", marginBottom: 3 },
  cardShop: { fontSize: 12, color: "#b09878", marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gpsChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  gpsChipText: { fontSize: 10, color: "#16a34a", fontWeight: "500" },
  // GPS Banner
  banner: {
    position: "absolute", bottom: 20, left: 16, right: 16,
    backgroundColor: "#2c2416", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  bannerIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(200,169,110,0.15)", borderWidth: 1,
    borderColor: "rgba(200,169,110,0.4)", alignItems: "center", justifyContent: "center",
  },
  bannerLabel: { fontSize: 10, color: "#b09878", letterSpacing: 1 },
  bannerName: { fontSize: 14, color: "#f5f0e8", fontWeight: "500", maxWidth: 160 },
  bannerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  bannerDetailBtn: {
    backgroundColor: "#c8a96e", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  bannerDetailText: { fontSize: 12, color: "#2c2416", fontWeight: "600" },
});
