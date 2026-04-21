import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tr } from "./src/i18n/translations";
import { useSession } from "./src/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import { getLanguages, Language, logUsage, joinDevice } from "./src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LanguagePickerScreen from "./src/screens/LanguagePickerScreen";
import HomeScreen from "./src/screens/HomeScreen";
import POIDetailScreen from "./src/screens/POIDetailScreen";
import MapScreen from "./src/screens/MapScreen";
import NearbyScreen from "./src/screens/NearbyScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ScanScreen from "./src/screens/ScanScreen";
import MaintenanceScreen from "./src/screens/MaintenanceScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import { FeaturesProvider, useFeatures } from "./src/context/FeaturesContext";

const queryClient = new QueryClient();

// ─── Dữ liệu số khẩn cấp ───────────────────────────────────────────────────

const EMERGENCY_CONTACTS = [
  {
    group: "Khẩn cấp quốc gia",
    items: [
      { label: "Công an",         number: "113", icon: "shield-outline",       color: "#1d4ed8" },
      { label: "Cứu thương",      number: "115", icon: "medkit-outline",        color: "#dc2626" },
      { label: "Cứu hỏa",         number: "114", icon: "flame-outline",         color: "#ea580c" },
      { label: "Cấp cứu tổng hợp", number: "112", icon: "call-outline",         color: "#7c3aed" },
    ],
  },
  {
    group: "Hỗ trợ du lịch",
    items: [
      { label: "Đường dây du lịch",  number: "1800599920", icon: "information-circle-outline", color: "#0891b2" },
      { label: "Hỗ trợ VozTrip",     number: "1900123456", icon: "headset-outline",             color: "#c8a96e" },
    ],
  },
  {
    group: "Công an khu vực (Demo)",
    items: [
      { label: "CA Quận 1 – TP.HCM",   number: "02838296801", icon: "location-outline", color: "#1d4ed8" },
      { label: "CA Hoàn Kiếm – Hà Nội", number: "02439362154", icon: "location-outline", color: "#1d4ed8" },
      { label: "CA TP. Hội An",          number: "02353861011", icon: "location-outline", color: "#1d4ed8" },
      { label: "CA TP. Đà Lạt",          number: "02633822254", icon: "location-outline", color: "#1d4ed8" },
    ],
  },
];

// ─── Emergency Modal ────────────────────────────────────────────────────────

function EmergencyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={em.overlay}>
        <TouchableOpacity style={em.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={[em.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>

          {/* Header */}
          <View style={em.header}>
            <View style={em.headerLeft}>
              <View style={em.sosIcon}>
                <Ionicons name="warning" size={20} color="#fff" />
              </View>
              <View>
                <Text style={em.headerTitle}>Số khẩn cấp</Text>
                <Text style={em.headerSub}>Emergency Contacts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={em.closeBtn}>
              <Ionicons name="close" size={22} color="#8c7a5e" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
            {EMERGENCY_CONTACTS.map((group) => (
              <View key={group.group} style={em.group}>
                <Text style={em.groupLabel}>{group.group}</Text>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.number}
                    style={em.contactRow}
                    activeOpacity={0.75}
                    onPress={() => Linking.openURL(`tel:${item.number}`)}
                  >
                    <View style={[em.contactIcon, { backgroundColor: item.color + "18" }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={em.contactInfo}>
                      <Text style={em.contactLabel}>{item.label}</Text>
                      <Text style={em.contactNumber}>{item.number}</Text>
                    </View>
                    <View style={[em.callBtn, { backgroundColor: item.color }]}>
                      <Ionicons name="call" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          <Text style={em.note}>
            Bấm vào số để gọi ngay · Tap to call immediately
          </Text>
        </View>
      </View>
    </Modal>
  );
}

type Tab = "home" | "nearby" | "map" | "scan" | "profile";

const TABS: { key: Tab; labelKey: string; icon: string; iconActive: string }[] = [
  { key: "home",    labelKey: "tab_explore",  icon: "compass-outline",  iconActive: "compass" },
  { key: "nearby",  labelKey: "tab_nearby",   icon: "navigate-outline", iconActive: "navigate" },
  { key: "map",     labelKey: "tab_map",      icon: "map-outline",      iconActive: "map" },
  { key: "scan",    labelKey: "tab_scan",     icon: "qr-code-outline",  iconActive: "qr-code" },
  { key: "profile", labelKey: "tab_settings", icon: "person-outline",   iconActive: "person" },
];

function TabBar({ activeTab, onTabPress, languageCode }: { activeTab: Tab; onTabPress: (tab: Tab) => void; languageCode: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(active ? tab.iconActive : tab.icon) as any}
              size={23}
              color={active ? "#c8a96e" : "#b09878"}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tr(tab.labelKey as any, languageCode)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppContent() {
  const { sessionId, languageId, saveLanguage, ready } = useSession();
  const [screen, setScreen] = useState<"payment" | "main" | "detail" | "language" | "loading">("loading");
  const joiningRef = useRef(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const insets = useSafeAreaInsets();
  const features = useFeatures();

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const currentLang = languages.find((l) => l.languageId === languageId);
  const languageCode = currentLang?.languageCode ?? "vi";

  useEffect(() => {
    if (!ready || !sessionId) return;
    (async () => {
      logUsage("app_open", sessionId);
      const joined = await AsyncStorage.getItem("device_joined");
      if (joined === "true") {
        setScreen("main");
      } else {
        setScreen("payment");
      }
    })();
  }, [ready, sessionId]);

  if (screen === "loading") return null;

  if (screen === "payment") {
    return (
      <PaymentScreen
        onPaid={async () => {
          if (joiningRef.current) return;
          joiningRef.current = true;
          const deviceId = sessionId ?? "unknown";
          await joinDevice(deviceId, Platform.OS, Platform.Version.toString());
          await AsyncStorage.setItem("device_joined", "true");
          joiningRef.current = false;
          setScreen("main");
        }}
      />
    );
  }

  // ── Maintenance toàn app ──────────────────────────────────────────────────
  if (features.app.maintenance.enabled) {
    return (
      <MaintenanceScreen
        featureName="VozTrip"
        message={features.app.maintenance.message}
      />
    );
  }

  if (!languageId || screen === "language") {
    return (
      <LanguagePickerScreen
        isFirstTime={!languageId}
        onSelect={async (langCode) => {
          let lang = languages.find((l) => l.languageCode === langCode);
          if (!lang) {
            // languages chưa load xong — fetch trực tiếp
            try {
              const { getLanguages } = await import("./src/services/api");
              const fresh = await getLanguages();
              lang = fresh.find((l) => l.languageCode === langCode);
            } catch {}
          }
          if (lang) await saveLanguage(lang.languageId);
          setScreen("main");
        }}
      />
    );
  }

  if (screen === "detail" && selectedPoiId) {
    if (!features.features.guest.poiDetail.enabled) {
      return (
        <MaintenanceScreen
          featureName="Chi tiết điểm tham quan"
          onBack={() => setScreen("main")}
        />
      );
    }
    return (
      <POIDetailScreen
        poiId={selectedPoiId}
        languageId={languageId}
        languageCode={languageCode}
        onBack={() => setScreen("main")}
      />
    );
  }

  const handlePoiPress = (poiId: string) => {
    setSelectedPoiId(poiId);
    setScreen("detail");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        if (!features.features.guest.explorePois.enabled)
          return <MaintenanceScreen featureName="Khám phá POI" onBack={() => setActiveTab("home")} />;
        return (
          <HomeScreen
            languageCode={languageCode}
            languageId={languageId}
            sessionId={sessionId ?? ""}
            onPoiPress={handlePoiPress}
            onChangeLanguage={() => setScreen("language")}
          />
        );
      case "nearby":
        if (!features.features.guest.explorePois.enabled)
          return <MaintenanceScreen featureName="Địa điểm gần đây" onBack={() => setActiveTab("home")} />;
        return (
          <NearbyScreen
            languageCode={languageCode}
            languageId={languageId}
            onPoiPress={handlePoiPress}
          />
        );
      case "map":
        if (!features.features.guest.explorePois.enabled)
          return <MaintenanceScreen featureName="Bản đồ" onBack={() => setActiveTab("home")} />;
        return (
          <MapScreen
            languageCode={languageCode}
            languageId={languageId}
            sessionId={sessionId ?? ""}
            onPoiPress={handlePoiPress}
          />
        );
      case "scan":
        if (!features.features.guest.gpsVisitLog.qrScan?.enabled)
          return <MaintenanceScreen featureName="Quét QR" onBack={() => setActiveTab("home")} />;
        return (
          <ScanScreen
            languageCode={languageCode}
            sessionId={sessionId ?? ""}
            onPoiPress={handlePoiPress}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            languageCode={languageCode}
            onChangeLanguage={() => setScreen("language")}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>{renderTab()}</View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} languageCode={languageCode} />

      {/* Floating SOS Button */}
      <TouchableOpacity
        style={[styles.sosFab, { bottom: Math.max(insets.bottom, 10) + 64 }]}
        onPress={() => setShowEmergency(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="warning" size={18} color="#fff" />
        <Text style={styles.sosFabText}>SOS</Text>
      </TouchableOpacity>

      <EmergencyModal visible={showEmergency} onClose={() => setShowEmergency(false)} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FeaturesProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </FeaturesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fdfaf4",
    borderTopWidth: 1,
    borderTopColor: "#e8dfc8",
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabLabel: { fontSize: 10, color: "#b09878" },
  tabLabelActive: { color: "#c8a96e", fontWeight: "600" },

  // SOS FAB
  sosFab: {
    position: "absolute",
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  sosFabText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

// ─── Emergency Modal Styles ─────────────────────────────────────────────────

const em = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fdfaf4",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#e8dfc8",
    marginBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  sosIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#dc2626",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#2c2416" },
  headerSub:   { fontSize: 11, color: "#b09878", marginTop: 1 },
  closeBtn: { padding: 4 },

  group: { marginTop: 16 },
  groupLabel: {
    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    color: "#b09060", marginBottom: 8,
  },

  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14, borderWidth: 1, borderColor: "#e8dfc8",
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8,
  },
  contactIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  contactInfo: { flex: 1 },
  contactLabel:  { fontSize: 13, color: "#2c2416", fontWeight: "500" },
  contactNumber: { fontSize: 17, color: "#2c2416", fontWeight: "700", marginTop: 1, letterSpacing: 0.5 },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },

  note: {
    textAlign: "center", fontSize: 11, color: "#b09878",
    marginTop: 12, marginBottom: 4,
  },
});
