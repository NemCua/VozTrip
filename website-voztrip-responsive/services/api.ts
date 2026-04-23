const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5183";

export type Poi = {
  poiId: string;
  poiName: string;
  localizedName: string | null;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  shopName: string;
  thumbnailUrl: string | null;
};

export type PoiDetail = Poi & {
  zoneName: string | null;
  media: { mediaId: string; mediaType: string; mediaUrl: string; sortOrder: number }[];
  localizations: {
    languageId: string;
    languageCode: string;
    title: string | null;
    description: string | null;
    audioUrl: string | null;
    audioDuration: number | null;
  }[];
};

export type Language = {
  languageId: string;
  languageCode: string;
  languageName: string;
};

export type Question = {
  questionId: string;
  questionText: string;
  answer: { answerText: string; audioUrl: string | null } | null;
};

export type TriggerResult = {
  poiId: string;
  poiName: string;
  audioUrl: string | null;
  audioDuration: number | null;
  isVipAudio: boolean;
  isBoosted: boolean;
  distance: number;
  priority: number;
};

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const getPois = (languageId?: string) =>
  apiFetch<Poi[]>("/api/pois", languageId ? { languageId } : undefined);

export const getPoiDetail = (id: string, languageId?: string) =>
  apiFetch<PoiDetail>(`/api/pois/${id}`, languageId ? { languageId } : undefined);

export const getLanguages = () => apiFetch<Language[]>("/api/languages");

export const getQuestions = (poiId: string, languageId?: string) =>
  apiFetch<Question[]>(`/api/pois/${poiId}/questions`, languageId ? { languageId } : undefined);

export const resolveGpsTrigger = async (params: {
  lat: number; lon: number;
  languageId: string; sessionId: string;
  alreadyTriggered: string[];
}): Promise<TriggerResult[]> => {
  try {
    const res = await fetch(`${API_URL}/api/gps/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: params.lat, lon: params.lon,
        languageId: params.languageId,
        sessionId: params.sessionId,
        alreadyTriggered: params.alreadyTriggered,
      }),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

export const logVisit = async (sessionId: string, poiId: string) => {
  try {
    await fetch(`${API_URL}/api/visitlogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, poiId }),
    });
  } catch {}
};

export const submitFeedback = async (payload: {
  sessionId?: string;
  deviceId?: string;
  type: "bug" | "suggestion" | "content" | "other";
  message: string;
  poiId?: string;
  platform?: string;
  lang?: string;
}) => {
  const res = await fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
};

export const joinDevice = async (deviceId: string) => {
  const ua = navigator.userAgent;
  const platform = /iPhone|iPad|iPod/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : "web";
  await fetch(`${API_URL}/api/devices/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, platform, userAgent: ua }),
  });
};

// Returns false khi device bị xóa (404) — caller dùng để kick user ra
export const pingDevice = async (deviceId: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/api/devices/${deviceId}/ping`, { method: "POST" });
    if (res.status === 404) return false;
    return true;
  } catch {
    return true; // network error → assume still valid, không kick nhầm
  }
};

export const checkDeviceStatus = async (deviceId: string): Promise<"approved" | "pending" | "unreachable"> => {
  try {
    const res = await fetch(`${API_URL}/api/devices/${deviceId}/status`);
    if (res.status === 404 || res.status === 405) return "unreachable";
    if (!res.ok) return "pending";
    const data = await res.json();
    return data.approved === true ? "approved" : "pending";
  } catch {
    return "unreachable";
  }
};
