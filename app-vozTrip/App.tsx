import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "./src/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import { getLanguages, Language } from "./src/services/api";
import LanguagePickerScreen from "./src/screens/LanguagePickerScreen";
import HomeScreen from "./src/screens/HomeScreen";
import POIDetailScreen from "./src/screens/POIDetailScreen";

const queryClient = new QueryClient();

function AppContent() {
  const { sessionId, languageId, saveLanguage, ready } = useSession();
  const [screen, setScreen] = useState<"home" | "detail" | "language">("home");
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  // Lấy language code từ languageId đang chọn
  const currentLang = languages.find(l => l.languageId === languageId);
  const languageCode = currentLang?.languageCode ?? "vi";

  if (!ready) return null;

  // Chưa chọn ngôn ngữ → Language Picker
  if (!languageId || screen === "language") {
    return (
      <LanguagePickerScreen
        onSelect={async (langId) => {
          await saveLanguage(langId);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "detail" && selectedPoiId) {
    return (
      <POIDetailScreen
        poiId={selectedPoiId}
        languageId={languageId}
        languageCode={languageCode}
        onBack={() => setScreen("home")}
      />
    );
  }

  return (
    <HomeScreen
      languageCode={languageCode}
      sessionId={sessionId ?? ""}
      onPoiPress={(poiId) => { setSelectedPoiId(poiId); setScreen("detail"); }}
      onChangeLanguage={() => setScreen("language")}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
