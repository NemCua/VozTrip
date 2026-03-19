import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Ionicons name="person-outline" size={32} color="#E8603C" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Traveler</Text>
              <Text style={styles.profileRole}>Tourist</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="pencil-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>alex.traveler@example.com</Text>
          </View>

          <View style={styles.divider} />

          {/* Phone */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>+84 123 456 789</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={24} color="#E8603C" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color="#E8603C" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Visited</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bookmark-outline" size={24} color="#E8603C" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.card}>
          {/* Settings Header */}
          <View style={styles.settingsHeader}>
            <Ionicons name="settings-outline" size={20} color="#E8603C" />
            <Text style={styles.settingsTitle}>Settings</Text>
          </View>

          <View style={styles.divider} />

          {/* Language */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="globe-outline" size={20} color="#8B6F5E" />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Dark Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color="#8B6F5E" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#ddd", true: "#E8603C" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#8B6F5E"
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#ddd", true: "#E8603C" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#E8603C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAD9CC",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  profileRole: {
    fontSize: 14,
    color: "#888",
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8E0D8",
    alignItems: "center",
    justifyContent: "center",
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  divider: {
    height: 1,
    backgroundColor: "#E0D5CB",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F2EAE1",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },

  // Settings
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  settingValue: {
    fontSize: 14,
    color: "#888",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8603C",
    backgroundColor: "#fff",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E8603C",
  },
});
