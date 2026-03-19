import { Image } from "expo-image";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INITIAL_FAVORITES = [
  {
    id: "1",
    name: "Hoi An Ancient Town",
    location: "Hoi An, Quang Nam",
    tag: "Heritage",
    image: require("@/assets/images/hoi_an_background.jpg"),
  },
  {
    id: "2",
    name: "My Son Sanctuary",
    location: "Duy Xuyen, Quang Nam",
    tag: "History",
    image: require("@/assets/images/hoi_an_background.jpg"),
  },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>Your saved collection</Text>
        </View>

        {favorites.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyIcon}>🤍</Text>
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDesc}>
              Explore the map and save{"\n"}places you love to build{"\n"}your
              itinerary.
            </Text>
          </View>
        ) : (
          /* Cards */
          <View style={styles.cardsContainer}>
            {favorites.map((place) => (
              <View key={place.id} style={styles.card}>
                <Image
                  source={place.image}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                {/* Overlay gradient effect */}
                <View style={styles.cardOverlay} />

                {/* Tag Badge */}
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>
                    {place.tag.toUpperCase()}
                  </Text>
                </View>

                {/* Remove favorite button */}
                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={() => removeFromFavorites(place.id)}
                >
                  <Text style={styles.favoriteBtnIcon}>❤️</Text>
                </TouchableOpacity>

                {/* Card Info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{place.name}</Text>
                  <View style={styles.cardLocationRow}>
                    <Text style={styles.cardLocationIcon}>📍</Text>
                    <Text style={styles.cardLocation}>{place.location}</Text>
                  </View>
                  <TouchableOpacity style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>VIEW DETAILS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5EF",
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ECDFD3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    height: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tagBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(30,30,30,0.8)",
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteBtnIcon: {
    fontSize: 16,
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardLocationIcon: {
    fontSize: 12,
  },
  cardLocation: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  viewBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#E8603C",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
