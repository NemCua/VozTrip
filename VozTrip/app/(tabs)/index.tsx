import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Poi } from "@/Type/type";
import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");
  const [pois, setpois] = useState<Poi[]>();
  useEffect(() => {
    async function GetAllPois() {
      let res = await fetch("http://localhost:5241/api/poi");
      let data = await res.json();
      setpois(data);
    }
    GetAllPois();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#000", dark: "#000" }}
      headerImage={
        <Image
          source={require("@/assets/images/hoi_an_background.jpg")}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          contentFit="cover"
        />
      }
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>
          <Entypo name="magnifying-glass" size={21} color="black" />
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Where do you want to go?"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterIcon}></Text>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>hoian</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Nearby label */}
      <View style={styles.nearbyRow}>
        <Text style={styles.pinIcon}>
          <Entypo name="location-pin" size={21} color="black" />
        </Text>
        <Text style={styles.nearbyText}>
          Near <Text style={styles.nearbyBold}>Da Nang, Vietnam</Text>
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        {pois?.map((poi) => (
          <View key={poi.id} style={styles.card}>
            {/* Card Image */}
            <View style={styles.cardImageContainer}>
              <Image
                source="https://lh6.googleusercontent.com/proxy/5gjTEen2_a5WDNvjlVtY84zkA_0Z7rWJX0ToeDuP0pnGfX5KqjSKZG3pZ9VrbW2HjgPW3qDAvKNLfTW75Uvo-MaD3DMiJ9JJ2g6r6xOxvMrd4SgPz4AgKejBRi-_med0bp-YthV4gbrdSfeRJ3JarAmRy-Lrl0aqcycXm-0wGSVMkc6THn7E3w"
                style={styles.cardImage}
                contentFit="cover"
              />

              {/* <TouchableOpacity style={styles.favoriteBtn}>
              <Text style={styles.favoriteIcon}>
                <EvilIcons name="heart" size={27} color="black" />
              </Text>
            </TouchableOpacity> */}
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>HOIAN</Text>
              <View style={styles.cardLocationRow}>
                <Text style={styles.cardLocationIcon}>
                  <Entypo name="location-pin" size={21} color="black" />
                </Text>
                <Text style={styles.cardLocation}>12'12'434'455</Text>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>
                Dia danh noi tieng viet nam
              </Text>
              <View style={styles.cardFooter}>
                {/* <View style={styles.cardManagerRow}>
                  <Text style={styles.cardManagerIcon}>
                    <Entypo name="check" size={24} color="black" />
                  </Text>
                  <Text style={styles.cardManager}>HOI an</Text>
                </View> */}
                <TouchableOpacity>
                  <Text style={styles.viewDetails}>VIEW DETAILS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8603C",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    shadowColor: "#E8603C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: "#1a1a1a" },
  filterBtn: { padding: 4 },
  filterIcon: { fontSize: 16 },

  // Tags
  tagsContainer: { marginBottom: 16 },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  tagActive: { backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" },
  tagText: { fontSize: 14, color: "#555", fontWeight: "500" },
  tagTextActive: { color: "#fff", fontWeight: "600" },

  // Nearby
  nearbyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  pinIcon: { fontSize: 14 },
  nearbyText: { fontSize: 14, color: "#555" },
  nearbyBold: { fontWeight: "700", color: "#1a1a1a" },

  // Cards
  cardsContainer: { gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImageContainer: { position: "relative", height: 220 },
  cardImage: { width: "100%", height: "100%" },
  tagBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(30,30,30,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
  },
  tagBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteIcon: { fontSize: 16 },
  cardContent: { padding: 16, gap: 6 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  cardLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardLocationIcon: { fontSize: 12 },
  cardLocation: { fontSize: 13, color: "#777" },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cardManagerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  cardManagerIcon: { fontSize: 12 },
  cardManager: { fontSize: 12, color: "#888", flex: 1 },
  viewDetails: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E8603C",
    letterSpacing: 0.5,
  },
});
