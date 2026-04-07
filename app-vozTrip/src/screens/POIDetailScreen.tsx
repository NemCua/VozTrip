import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getPoiDetail, getLanguages, getQuestions, Language, PoiDetail, Question } from "../services/api";
import { useAudio } from "../hooks/useAudio";

const { width } = Dimensions.get("window");

type Props = {
  poiId: string;
  languageId: string;
  languageCode: string;
  onBack: () => void;
};

export default function POIDetailScreen({ poiId, languageId, languageCode, onBack }: Props) {
  const [activeLangId, setActiveLangId] = useState(languageId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const { play, currentId, playing } = useAudio();

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const activeLang = languages.find(l => l.languageId === activeLangId);
  const activeLangCode = activeLang?.languageCode ?? languageCode;

  const { data: poi, isLoading } = useQuery<PoiDetail>({
    queryKey: ["poi", poiId, activeLangId],
    queryFn: () => getPoiDetail(poiId, activeLangId),
    enabled: !!poiId,
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["questions", poiId, activeLangId],
    queryFn: () => getQuestions(poiId, activeLangId),
    enabled: !!poiId,
  });

  const loc = poi?.localizations?.[0];
  const hasContent = !!(loc?.title || loc?.description);

  const handlePlayPOI = () => {
    play(`poi-${poiId}`, loc?.audioUrl, loc?.description ?? poi?.poiName, activeLangCode);
  };

  const isPoiPlaying = playing && currentId === `poi-${poiId}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        {/* ── Hero image ── */}
        <View style={styles.heroWrap}>
          {poi?.media && poi.media.length > 0 ? (
            <Image
              source={{ uri: poi.media[activeImageIndex]?.mediaUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#d8cbb0" />
              <Text style={styles.heroPlaceholderText}>Chưa có ảnh</Text>
            </View>
          )}

          {/* Overlay: back + heart */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color="#2c2416" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="heart-outline" size={20} color="#2c2416" />
            </TouchableOpacity>
          </View>

          {/* Badge số ảnh — chỉ show khi có nhiều media */}
          {poi?.media && poi.media.length > 1 && (
            <View style={styles.mediaCountBadge}>
              <Ionicons name="images-outline" size={12} color="#f5f0e8" />
              <Text style={styles.mediaCountText}>
                {activeImageIndex + 1} / {poi.media.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Thumbnail strip (chỉ show khi media > 1) ── */}
        {poi?.media && poi.media.length > 1 && (
          <View style={styles.thumbWrap}>
            <FlatList
              data={poi.media}
              keyExtractor={(item) => item.mediaId}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbContent}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setActiveImageIndex(index)}
                  style={[
                    styles.thumbItem,
                    index === activeImageIndex && styles.thumbItemActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.mediaUrl }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                  {/* Video badge */}
                  {item.mediaType === "video" && (
                    <View style={styles.videoBadge}>
                      <Ionicons name="play" size={10} color="#fff" />
                    </View>
                  )}
                  {/* Active border overlay */}
                  {index === activeImageIndex && (
                    <View style={styles.thumbActiveOverlay} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.content}>

          {/* ── POI header ── */}
          <View style={styles.poiHeader}>
            <View style={styles.poiMeta}>
              {poi?.zoneName && (
                <View style={styles.zoneChip}>
                  <Text style={styles.zoneText}>{poi.zoneName}</Text>
                </View>
              )}
            </View>
            <Text style={styles.poiName}>
              {isLoading ? "Đang tải..." : (loc?.title ?? poi?.poiName ?? "—")}
            </Text>
          </View>

          {/* ── Language selector ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={styles.langScroll} contentContainerStyle={styles.langContent}>
            {languages.map(l => {
              const hasData = poi?.localizations?.some(loc => loc.languageId === l.languageId);
              return (
                <TouchableOpacity key={l.languageId} onPress={() => setActiveLangId(l.languageId)}
                  style={[styles.langPill, activeLangId === l.languageId && styles.langPillActive]}>
                  <Text style={[styles.langCode, activeLangId === l.languageId && styles.langCodeActive]}>
                    {l.languageCode.toUpperCase()}
                  </Text>
                  {!hasData && (
                    <View style={styles.ttsIndicator}>
                      <Ionicons name="mic-outline" size={9} color="#c8a96e" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Audio player ── */}
          <View style={styles.playerCard}>
            <View style={styles.playerLeft}>
              <TouchableOpacity style={styles.playBtn} onPress={handlePlayPOI}>
                <Ionicons name={isPoiPlaying ? "pause" : "play"} size={22} color="#fdfaf4" />
              </TouchableOpacity>
              <View>
                <Text style={styles.playerTitle}>
                  {isPoiPlaying ? "Đang phát..." : "Thuyết minh"}
                </Text>
                <View style={styles.playerSourceRow}>
                  {loc?.audioUrl ? (
                    <>
                      <Ionicons name="musical-notes-outline" size={11} color="#c8a96e" />
                      <Text style={styles.playerSource}>Audio gốc</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="mic-outline" size={11} color="#c8a96e" />
                      <Text style={styles.playerSource}>Text-to-Speech</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.waveform}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={[styles.waveBar, {
                  height: 6 + Math.sin(i * 0.8) * 10 + Math.cos(i * 1.3) * 6,
                  opacity: isPoiPlaying ? 1 : 0.35,
                  backgroundColor: isPoiPlaying && i < 8 ? "#c8a96e" : "#d8cbb0",
                }]} />
              ))}
            </View>
          </View>

          {/* ── Description ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            {isLoading ? (
              <Text style={styles.descText}>Đang tải...</Text>
            ) : hasContent ? (
              <Text style={styles.descText}>{loc?.description}</Text>
            ) : (
              <View style={styles.noContentBox}>
                <Ionicons name="globe-outline" size={20} color="#c8a96e" />
                <Text style={styles.noContentText}>
                  Chưa có nội dung bằng ngôn ngữ này.{"\n"}Nội dung sẽ được tự động dịch sớm.
                </Text>
              </View>
            )}
          </View>

          {/* ── Q&A ── */}
          {questions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Hỏi & Đáp</Text>
                <View style={styles.qaBadge}>
                  <Text style={styles.qaBadgeText}>{questions.length} câu hỏi</Text>
                </View>
              </View>
              <View style={styles.qaList}>
                {questions.map(qa => {
                  const isAnswerPlaying = playing && currentId === `qa-${qa.questionId}`;
                  return (
                    <View key={qa.questionId}>
                      <TouchableOpacity style={styles.questionBubble}
                        onPress={() => setExpandedQA(expandedQA === qa.questionId ? null : qa.questionId)}
                        activeOpacity={0.8}>
                        <Ionicons name="help-circle-outline" size={16} color="#8c7a5e" style={{ marginTop: 1 }} />
                        <Text style={styles.questionText}>{qa.questionText}</Text>
                        <Ionicons name={expandedQA === qa.questionId ? "chevron-up" : "chevron-down"} size={14} color="#b09878" />
                      </TouchableOpacity>
                      {expandedQA === qa.questionId && qa.answer && (
                        <View style={styles.answerBubble}>
                          <Text style={styles.answerText}>{qa.answer.answerText}</Text>
                          <TouchableOpacity style={styles.answerAudioBtn}
                            onPress={() => play(`qa-${qa.questionId}`, qa.answer!.audioUrl, qa.answer!.answerText, activeLangCode)}>
                            <Ionicons name={isAnswerPlaying ? "pause" : (qa.answer.audioUrl ? "musical-notes-outline" : "mic-outline")}
                              size={13} color={qa.answer.audioUrl ? "#c8a96e" : "#8c7a5e"} />
                            <Text style={styles.answerAudioText}>
                              {isAnswerPlaying ? "Đang phát" : (qa.answer.audioUrl ? "Nghe câu trả lời" : "Đọc (TTS)")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfaf4" },
  scroll: { flex: 1 },
  heroWrap: { position: "relative" },
  heroImage: { width, height: 260 },
  heroPlaceholder: { backgroundColor: "#f5f0e8", alignItems: "center", justifyContent: "center", gap: 8 },
  heroPlaceholderText: { fontSize: 12, color: "#b09878" },
  mediaCountBadge: {
    position: "absolute", bottom: 12, right: 12,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(44,36,22,0.6)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  mediaCountText: { fontSize: 11, color: "#f5f0e8", fontWeight: "500" },
  // Thumbnail strip
  thumbWrap: { backgroundColor: "#fdfaf4", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e8dfc8" },
  thumbContent: { paddingHorizontal: 16, gap: 8 },
  thumbItem: { borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  thumbItemActive: { borderColor: "#c8a96e" },
  thumbImage: { width: 64, height: 64 },
  videoBadge: {
    position: "absolute", bottom: 4, right: 4,
    backgroundColor: "rgba(44,36,22,0.7)", borderRadius: 10,
    width: 20, height: 20, alignItems: "center", justifyContent: "center",
  },
  thumbActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6, borderWidth: 2, borderColor: "#c8a96e",
  },
  heroTopBar: {
    position: "absolute", top: 12, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(253,250,244,0.92)", alignItems: "center", justifyContent: "center",
  },
  dotRow: { position: "absolute", bottom: 12, flexDirection: "row", alignSelf: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { backgroundColor: "#fff", width: 18 },
  content: { padding: 20, gap: 20 },
  poiHeader: { gap: 8 },
  poiMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  zoneChip: { backgroundColor: "#fdf6e8", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  zoneText: { fontSize: 10, color: "#c8a96e", letterSpacing: 1, textTransform: "uppercase" },
  poiName: { fontSize: 22, color: "#2c2416", fontWeight: "400", lineHeight: 28 },
  langScroll: { marginHorizontal: -20 },
  langContent: { paddingHorizontal: 20, gap: 8 },
  langPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#d8cbb0" },
  langPillActive: { backgroundColor: "#2c2416", borderColor: "#2c2416" },
  langCode: { fontSize: 12, fontWeight: "600", color: "#8c7a5e" },
  langCodeActive: { color: "#f5f0e8" },
  ttsIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#fdf6e8", alignItems: "center", justifyContent: "center" },
  playerCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#2c2416", borderRadius: 14, padding: 16, gap: 12 },
  playerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#c8a96e", alignItems: "center", justifyContent: "center" },
  playerTitle: { fontSize: 14, color: "#f5f0e8", fontWeight: "500", marginBottom: 3 },
  playerSourceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  playerSource: { fontSize: 11, color: "#c8a96e" },
  waveform: { flexDirection: "row", alignItems: "center", gap: 2, flex: 1, justifyContent: "flex-end" },
  waveBar: { width: 3, borderRadius: 2 },
  section: { gap: 12 },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 16, color: "#2c2416", fontWeight: "500" },
  qaBadge: { backgroundColor: "#f5f0e8", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  qaBadgeText: { fontSize: 11, color: "#8c7a5e" },
  descText: { fontSize: 14, color: "#5a4a35", lineHeight: 22 },
  noContentBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fdf6e8", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#e8dfc8" },
  noContentText: { fontSize: 13, color: "#b09878", lineHeight: 19, flex: 1 },
  qaList: { gap: 8 },
  questionBubble: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#f5f0e8", borderRadius: 12, padding: 13, borderWidth: 1, borderColor: "#e8dfc8" },
  questionText: { flex: 1, fontSize: 13, color: "#2c2416", lineHeight: 19 },
  answerBubble: { marginTop: 4, marginLeft: 16, backgroundColor: "#fff", borderRadius: 12, padding: 13, borderWidth: 1, borderColor: "#e8dfc8", gap: 10 },
  answerText: { fontSize: 13, color: "#5a4a35", lineHeight: 19 },
  answerAudioBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  answerAudioText: { fontSize: 11, color: "#8c7a5e" },
});
