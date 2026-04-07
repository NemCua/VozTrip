import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Dùng data tĩnh — không phụ thuộc API để tránh lỗi khi chưa kết nối
const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "ko", label: "한국어",      flag: "🇰🇷" },
  { code: "ja", label: "日本語",      flag: "🇯🇵" },
];

type Props = {
  onSelect: (languageCode: string) => void;
};

export default function LanguagePickerScreen({ onSelect }: Props) {
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
              style={styles.langItem}
              onPress={() => onSelect(item.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={styles.langLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#d8cbb0" />
            </TouchableOpacity>
          )}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: "#fdfaf4" },
  container: { flex: 1, paddingHorizontal: 24 },

  header: { alignItems: "center", paddingTop: 52, paddingBottom: 36 },
  sub:    { fontSize: 10, letterSpacing: 3, color: "#b09060", textTransform: "uppercase", marginBottom: 6 },
  logo:   { fontSize: 36, color: "#2c2416", fontWeight: "300", letterSpacing: 1 },
  divider: { width: 40, height: 1, backgroundColor: "#c8a96e", marginVertical: 20 },
  title:  { fontSize: 18, color: "#2c2416", fontWeight: "400", marginBottom: 6 },
  hint:   { fontSize: 13, color: "#b09878" },

  list: { gap: 10, paddingBottom: 40 },
  langItem: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#e8dfc8",
    paddingHorizontal: 18, paddingVertical: 16,
  },
  flag:      { fontSize: 28 },
  langLabel: { flex: 1, fontSize: 17, color: "#2c2416" },
});
