import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tr } from "../i18n/translations";
import { logUsage } from "../services/api";

type Props = {
  languageCode: string;
  sessionId: string;
  onPoiPress: (poiId: string) => void;
};

export default function ScanScreen({ languageCode, sessionId, onPoiPress }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();

  // Reset scanned sau 3 giây để cho phép quét lại nếu cần
  useEffect(() => {
    if (!scanned) return;
    const t = setTimeout(() => setScanned(false), 3000);
    return () => clearTimeout(t);
  }, [scanned]);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="camera-outline" size={48} color="#b09878" />
        <Text style={styles.permTitle}>Cần quyền camera</Text>
        <Text style={styles.permSub}>Để quét mã QR của điểm tham quan</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.permBtnText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned) return;

    // Parse format: voztrip:poi:{poiId}
    const match = data.match(/^voztrip:poi:(.+)$/);
    if (!match) {
      setScanned(true); // tạm block để tránh spam, nhưng không navigate
      return;
    }

    setScanned(true);
    Vibration.vibrate(80);
    logUsage("qr_scan", sessionId);
    onPoiPress(match[1]);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerEnabled
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
      />

      {/* Overlay tối 4 góc */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Top */}
        <View style={[styles.overlayBlock, { top: 0, left: 0, right: 0, height: "25%" }]} />
        {/* Bottom */}
        <View style={[styles.overlayBlock, { bottom: 0, left: 0, right: 0, height: "25%" }]} />
        {/* Left */}
        <View style={[styles.overlayBlock, { top: "25%", left: 0, width: "12%", height: "50%" }]} />
        {/* Right */}
        <View style={[styles.overlayBlock, { top: "25%", right: 0, width: "12%", height: "50%" }]} />

        {/* Viewfinder border corners */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerSub}>VozTrip</Text>
        <Text style={styles.headerTitle}>Quét mã QR</Text>
      </View>

      {/* Hint */}
      <View style={styles.hintWrap}>
        {scanned ? (
          <View style={styles.hintPill}>
            <Ionicons name="checkmark-circle" size={16} color="#c8a96e" />
            <Text style={styles.hintText}>Đang mở điểm tham quan...</Text>
          </View>
        ) : (
          <View style={styles.hintPill}>
            <Ionicons name="scan-outline" size={16} color="#f5f0e8" />
            <Text style={styles.hintText}>Đưa mã QR vào khung hình</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },

  permTitle: { fontSize: 18, fontWeight: "600", color: "#2c2416", marginTop: 8 },
  permSub: { fontSize: 13, color: "#8c7a5e", textAlign: "center" },
  permBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 12,
    backgroundColor: "#2c2416", borderRadius: 8,
  },
  permBtnText: { color: "#f5f0e8", fontSize: 14, fontWeight: "600" },

  overlay: { ...StyleSheet.absoluteFillObject },
  overlayBlock: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#c8a96e",
  },
  cornerTL: { top: "25%", left: "12%", borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerTR: { top: "25%", right: "12%", borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cornerBL: { bottom: "25%", left: "12%", borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerBR: { bottom: "25%", right: "12%", borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },

  header: {
    position: "absolute", top: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerSub: { fontSize: 10, letterSpacing: 4, color: "#c8a96e", textTransform: "uppercase" },
  headerTitle: { fontSize: 22, color: "#f5f0e8", fontWeight: "300", marginTop: 2 },

  hintWrap: {
    position: "absolute", bottom: 120, left: 0, right: 0, alignItems: "center",
  },
  hintPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: "rgba(44,36,22,0.75)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(200,169,110,0.3)",
  },
  hintText: { fontSize: 13, color: "#f5f0e8" },
});
