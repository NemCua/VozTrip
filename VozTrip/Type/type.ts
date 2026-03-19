// ================= USER =================
export interface User {
  id: number;
  name: string;
  phone?: string;
  email: string;
  role: string; // admin / seller / tourist
  passHash: string;
  status: number;
  createdAt: string;
  updatedAt: string;

  seller?: Seller;
}

// ================= SELLER =================
export interface Seller {
  id: number;
  ownerId: number;
  shopName: string;
  description?: string;
  address?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;

  owner?: User;
  pois?: Poi[];
}

// ================= POI =================
export interface Poi {
  id: number;
  sellerId: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  triggerRadiusMeters: number;
  status: number;
  createdAt: string;
  updatedAt: string;

  seller?: Seller;
  medias?: Media[];
  narrations?: Narration[];
  questions?: Question[];
}

// ================= MEDIA =================
export interface Media {
  id: number;
  poiId: number;
  url: string;
  type: string; // image / video

  poi?: Poi;
}

// ================= AUDIO =================
export interface Audio {
  id: number;
  audioUrl: string;
  durationSec?: number;
  sourceType?: string; // upload / tts

  narrations?: Narration[];
  questionAnswers?: QuestionAnswer[];
}

// ================= NARRATION =================
export interface Narration {
  id: number;
  poiId: number;
  text: string;
  language: string;
  audioId?: number;
  status: number;

  poi?: Poi;
  audio?: Audio;
}

// ================= QUESTION =================
export interface Question {
  id: number;
  poiId: number;
  questionText: string;
  sortOrder: number;
  status: number;

  poi?: Poi;
  answers?: QuestionAnswer[];
}

// ================= QUESTION ANSWER =================
export interface QuestionAnswer {
  id: number;
  questionId: number;
  answerText: string;
  language: string;
  audioId?: number;

  question?: Question;
  audio?: Audio;
}
