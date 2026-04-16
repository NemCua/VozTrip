import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  featureName?: string;
  message?: string;
  onBack?: () => void;
};

export default function MaintenanceScreen({
  featureName,
  message,
  onBack,
}: Props) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    // Icon float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* Back button */}
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#6b5c45" />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
        )}

        <View style={styles.body}>
          {/* Floating icon */}
          <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons name="construct-outline" size={44} color="#c8a96e" />
              </View>
            </View>

            {/* Decorative dots */}
            <View style={[styles.dot, styles.dotTopRight]} />
            <View style={[styles.dot, styles.dotBottomLeft]} />
            <View style={[styles.dotSmall, styles.dotTopLeft]} />
          </Animated.View>

          {/* Text */}
          <View style={styles.textBlock}>
            <Text style={styles.label}>ĐANG BẢO TRÌ</Text>
            <Text style={styles.title}>
              {featureName
                ? `${featureName} tạm thời\nkhông khả dụng`
                : "Tính năng tạm thời\nkhông khả dụng"}
            </Text>
            <Text style={styles.desc}>
              {message ??
                "Chúng tôi đang nâng cấp để mang lại trải nghiệm tốt hơn.\nVui lòng quay lại sau."}
            </Text>
          </View>

          {/* Status badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Hệ thống đang cập nhật</Text>
          </View>

          {/* Back button (bottom, only if onBack provided) */}
          {onBack && (
            <TouchableOpacity style={styles.homeBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back-outline" size={18} color="#fdfaf4" />
              <Text style={styles.homeBtnText}>Về trang trước</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Decorative bottom strip */}
        <View style={styles.strip}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.stripItem}>
              <Ionicons name="construct-outline" size={12} color="#e8dfc8" />
            </View>
          ))}
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fdfaf4",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Back button (top left)
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    color: "#6b5c45",
  },

  // Center body
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 32,
  },

  // Icon
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 140,
    height: 140,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f0e8",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c8a96e",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fdfaf4",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c8a96e",
  },
  dotSmall: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#d8cbb0",
  },
  dotTopRight:    { top: 10,  right: 10 },
  dotBottomLeft:  { bottom: 6, left: 14 },
  dotTopLeft:     { top: 18, left: 4 },

  // Text
  textBlock: {
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c8a96e",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    color: "#2c2416",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 13,
    color: "#8c7a5e",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },

  // Status badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#fff8ec",
    borderWidth: 1,
    borderColor: "#f0e0b8",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
  },
  badgeText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "500",
  },

  // Home button
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2c2416",
    shadowColor: "#2c2416",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  homeBtnText: {
    fontSize: 14,
    color: "#fdfaf4",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Bottom decorative strip
  strip: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0ebe0",
  },
  stripItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
