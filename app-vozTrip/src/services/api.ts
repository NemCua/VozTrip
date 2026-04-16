import axios from "axios";
import { API_URL } from "../constants";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

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

export const getPois = (languageId?: string) =>
  api.get<Poi[]>("/api/pois", { params: languageId ? { languageId } : undefined }).then(r => r.data);
export const getPoiDetail = (id: string, languageId?: string) =>
  api.get<PoiDetail>(`/api/pois/${id}`, { params: { languageId } }).then(r => r.data);
export const getLanguages = () => api.get<Language[]>("/api/languages").then(r => r.data);
export const getQuestions = (poiId: string, languageId?: string) =>
  api.get<Question[]>(`/api/pois/${poiId}/questions`, { params: { languageId } }).then(r => r.data);
export const createSession = (sessionId: string, languageId?: string) =>
  api.post("/api/sessions", { sessionId, languageId }).then(r => r.data);
export const logVisit = (sessionId: string, poiId: string) =>
  api.post("/api/visitlogs", { sessionId, poiId }).then(r => r.data);
