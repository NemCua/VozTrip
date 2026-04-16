import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tr } from "../i18n/translations";
import { API_URL } from "../constants";

// Lấy base URL website từ API URL (thay port 5183 → 3000)
const WEBSITE_URL = API_URL.replace(":5183", ":3000");

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

type Props = {
  languageCode: string;
  onChangeLanguage: () => void;
};

export default function ProfileScreen({ languageCode, onChangeLanguage }: Props) {
  const currentLang = LANGUAGES.find((l) => l.code === languageCode) ?? LANGUAGES[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>{tr("profile_guest", languageCode)}</Text>
          <Text style={styles.headerTitle}>{tr("tab_settings", languageCode)}</Text>
        </View>
        <View style={styles.divider} />

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={36} color="#c8a96e" />
          </View>
          <Text style={styles.guestLabel}>{tr("profile_guest", languageCode)}</Text>
          <Text style={styles.guestSub}>{tr("profile_no_login", languageCode)}</Text>
        </View>

        {/* Section: Ngôn ngữ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("profile_lang_title", languageCode)}</Text>

          <TouchableOpacity style={styles.settingRow} onPress={onChangeLanguage} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Ionicons name="language-outline" size={20} color="#c8a96e" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{tr("profile_current_lang", languageCode)}</Text>
              <Text style={styles.settingValue}>
                {currentLang.flag}  {currentLang.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d8cbb0" />
          </TouchableOpacity>

          <View style={styles.langGrid}>
            {LANGUAGES.map((l) => (
              <View
                key={l.code}
                style={[styles.langChip, l.code === languageCode && styles.langChipActive]}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, l.code === languageCode && styles.langLabelActive]}>
                  {l.label}
                </Text>
                {l.code === languageCode && (
                  <Ionicons name="checkmark-circle" size={14} color="#c8a96e" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Section: Về ứng dụng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("profile_about", languageCode)}</Text>

          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="map-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>VozTrip</Text>
                <Text style={styles.settingValue}>Tourism Guide v1.0</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.aboutRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="headset-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{tr("profile_audio", languageCode)}</Text>
                <Text style={styles.settingValue}>{tr("profile_audio_sub", languageCode)}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.aboutRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="radio-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{tr("profile_gps", languageCode)}</Text>
                <Text style={styles.settingValue}>{tr("profile_gps_sub", languageCode)}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.aboutRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="globe-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{tr("profile_support", languageCode)}</Text>
                <Text style={styles.settingValue}>VI · EN · ZH · KO · JA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Pháp lý */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("profile_legal", languageCode)}</Text>

          <View style={styles.card}>
            {/* GPS note */}
            <View style={styles.aboutRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{tr("profile_gps", languageCode)}</Text>
                <Text style={[styles.settingValue, { fontSize: 12, color: "#8c7a5e", fontWeight: "400" }]}>
                  {tr("profile_no_gps_note", languageCode)}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            {/* Privacy policy link */}
            <TouchableOpacity
              style={styles.aboutRow}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy`)}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="document-text-outline" size={20} color="#c8a96e" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{tr("profile_privacy_sub", languageCode)}</Text>
                <Text style={[styles.settingValue, { fontSize: 14 }]}>
                  {tr("profile_privacy", languageCode)}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#d8cbb0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change language CTA */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          <TouchableOpacity style={styles.ctaBtn} onPress={onChangeLanguage} activeOpacity={0.8}>
            <Ionicons name="language-outline" size={18} color="#fdfaf4" />
            <Text style={styles.ctaBtnText}>{tr("profile_change_lang", languageCode)}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  headerSub: { fontSize: 10, color: "#b09060", letterSpacing: 2, textTransform: "uppercase" },
  headerTitle: { fontSize: 24, color: "#2c2416", fontWeight: "300", letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: "#e8dfc8", marginHorizontal: 20, marginBottom: 24 },

  avatarSection: { alignItems: "center", paddingBottom: 28, gap: 8 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#f5f0e8", borderWidth: 2, borderColor: "#e8dfc8",
    alignItems: "center", justifyContent: "center",
  },
  guestLabel: { fontSize: 16, color: "#2c2416", fontWeight: "500" },
  guestSub: { fontSize: 12, color: "#b09878" },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 11, color: "#b09060", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8dfc8",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8dfc8",
    padding: 14, marginBottom: 12,
  },
  aboutRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
  },
  separator: { height: 1, backgroundColor: "#f0e8d8", marginHorizontal: 14 },

  settingIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#fdf6e8", alignItems: "center", justifyContent: "center",
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 12, color: "#b09878" },
  settingValue: { fontSize: 15, color: "#2c2416", fontWeight: "500", marginTop: 1 },

  langGrid: { gap: 8 },
  langChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 12, borderWidth: 1, borderColor: "#e8dfc8",
    backgroundColor: "#fff",
  },
  langChipActive: { borderColor: "#c8a96e", backgroundColor: "#fdf6e8" },
  langFlag: { fontSize: 20 },
  langLabel: { flex: 1, fontSize: 14, color: "#6b5c45" },
  langLabelActive: { color: "#2c2416", fontWeight: "500" },

  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#2c2416", borderRadius: 14, paddingVertical: 16,
  },
  ctaBtnText: { color: "#fdfaf4", fontSize: 15, fontWeight: "600" },
});
