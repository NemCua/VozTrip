import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPaid: () => void;
};

export default function PaymentScreen({ onPaid }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>NGUYỄN QUỐC HUY</Text>
      <Text style={styles.subtitle}>*******085</Text>

      <View style={styles.qrCard}>
        <Image
          source={require("../../assets/qr-payment.jpg")}
          style={styles.qrImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={onPaid} activeOpacity={0.85}>
        <Text style={styles.btnText}>Đã thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fce4ec",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c2416",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#8c7a5e",
    marginBottom: 8,
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  qrImage: {
    width: 260,
    height: 320,
  },
  btn: {
    backgroundColor: "#c8a96e",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#c8a96e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
