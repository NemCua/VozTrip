import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { API_URL } from "../constants";

const WEBSITE_URL = API_URL.replace(":5183", ":3000");

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "ko", label: "한국어",      flag: "🇰🇷" },
  { code: "ja", label: "日本語",      flag: "🇯🇵" },
];

type Props = {
  onSelect: (languageCode: string) => void;
  isFirstTime?: boolean; // true = lần đầu mở app, false = đổi lại từ Settings
};

export default function LanguagePickerScreen({ onSelect, isFirstTime = true }: Props) {
  const [agreed, setAgreed] = useState(!isFirstTime); // đổi lại thì bỏ qua consent
  const [showWarning, setShowWarning] = useState(false);

  const handleSelect = (code: string) => {
    if (!agreed) {
      setShowWarning(true);
      return;
    }
    onSelect(code);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.sub}>Tourism Guide</Text>
          <Text style={styles.logo}>VozTrip</Text>
          <View style={styles.divider} />
          <Text style={styles.title}>Chọn ngôn ngữ</Text>
          <Text style={styles.hint}>Select your language</Text>
        </View>

        {/* Language list */}
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.langItem, !agreed && styles.langItemDisabled]}
              onPress={() => handleSelect(item.code)}
              activeOpacity={agreed ? 0.7 : 1}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={[styles.langLabel, !agreed && { color: "#b09878" }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={agreed ? "#d8cbb0" : "#e8dfc8"} />
            </TouchableOpacity>
          )}
        />

        {/* Consent checkbox — chỉ hiện lần đầu */}
        {isFirstTime && <View style={styles.consentBox}>
          {showWarning && !agreed && (
            <Text style={styles.warningText}>
              Vui lòng đồng ý với chính sách bảo mật để tiếp tục.
            </Text>
          )}

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => { setAgreed(v => !v); setShowWarning(false); }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Ionicons name="checkmark" size={14} color="#fdfaf4" />}
            </View>
            <Text style={styles.consentText}>
              Tôi đã đọc và đồng ý với{" "}
              <Text
                style={styles.consentLink}
                onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy`)}
              >
                Chính sách bảo mật
              </Text>
              {" "}của VozTrip.
            </Text>
          </TouchableOpacity>

          <Text style={styles.consentSub}>
            By continuing, you agree to VozTrip's Privacy Policy.
          </Text>
        </View>}


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: "#fdfaf4" },
  container: { flex: 1, paddingHorizontal: 24 },

  header: { alignItems: "center", paddingTop: 44, paddingBottom: 28 },
  sub:    { fontSize: 10, letterSpacing: 3, color: "#b09060", textTransform: "uppercase", marginBottom: 6 },
  logo:   { fontSize: 36, color: "#2c2416", fontWeight: "300", letterSpacing: 1 },
  divider: { width: 40, height: 1, backgroundColor: "#c8a96e", marginVertical: 18 },
  title:  { fontSize: 18, color: "#2c2416", fontWeight: "400", marginBottom: 6 },
  hint:   { fontSize: 13, color: "#b09878" },

  list: { gap: 10, paddingBottom: 16 },
  langItem: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8dfc8",
    paddingHorizontal: 18, paddingVertical: 16,
  },
  langItemDisabled: {
    backgroundColor: "#faf7f2", borderColor: "#f0e8d8",
  },
  flag:      { fontSize: 28 },
  langLabel: { flex: 1, fontSize: 17, color: "#2c2416" },

  // Consent
  consentBox: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e8dfc8",
    gap: 10,
  },
  warningText: {
    fontSize: 11, color: "#c0392b",
    backgroundColor: "#fdf2f2",
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: "#f5c6c6",
  },
  checkRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: "#d8cbb0",
    backgroundColor: "#f5f0e8",
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#2c2416", borderColor: "#2c2416",
  },
  consentText: {
    flex: 1, fontSize: 13, color: "#5c4a30", lineHeight: 20,
  },
  consentLink: {
    color: "#c8a96e", textDecorationLine: "underline",
  },
  consentSub: {
    fontSize: 11, color: "#b09878", paddingLeft: 34,
  },
});
