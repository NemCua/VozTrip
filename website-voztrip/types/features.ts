// Mirror của FeaturesConfig.cs — giữ đồng bộ khi thêm flag mới

export interface EnabledCfg { enabled: boolean }

export interface MaintenanceCfg { enabled: boolean; message: string }
export interface AppCfg { name: string; version: string; maintenance: MaintenanceCfg }

export interface AuthCfg {
  login: EnabledCfg;
  register: EnabledCfg;
  jwt: { accessTokenTTL: string };
}

export interface GuestCfg {
  languagePicker: EnabledCfg;
  explorePois: { enabled: boolean; localizedName: EnabledCfg; thumbnail: EnabledCfg };
  poiDetail: { enabled: boolean; media: EnabledCfg; localization: EnabledCfg; audio: EnabledCfg };
  qna: EnabledCfg;
  gpsVisitLog: { enabled: boolean; session: EnabledCfg; visitLog: EnabledCfg };
}

export interface SellerCfg {
  profile: EnabledCfg;
  vipUpgrade: { enabled: boolean; mockPayment: EnabledCfg };
  dashboard: { enabled: boolean; totalVisits: EnabledCfg; top5Pois: EnabledCfg; visitChart7Days: EnabledCfg };
  poiManagement: { enabled: boolean; create: EnabledCfg; update: EnabledCfg; delete: EnabledCfg; planLimit: { enabled: boolean; freePlanMaxPois: number } };
  localization: EnabledCfg;
  audioUpload: EnabledCfg;
  autoTranslate: EnabledCfg;
  mediaManagement: { enabled: boolean; upload: { enabled: boolean; image: EnabledCfg; video: EnabledCfg }; reorder: EnabledCfg; delete: EnabledCfg };
  qnaManagement: EnabledCfg;
}

export interface AdminCfg {
  dashboard: EnabledCfg;
  sellerManagement: EnabledCfg;
  userManagement: EnabledCfg;
  mediaModeration: EnabledCfg;
  poiModeration: EnabledCfg;
  zoneManagement: EnabledCfg;
  languageManagement: EnabledCfg;
}

export interface FeaturesCfg { guest: GuestCfg; seller: SellerCfg; admin: AdminCfg }

export interface FeaturesConfig {
  app: AppCfg;
  auth: AuthCfg;
  features: FeaturesCfg;
  pages: { privacy: EnabledCfg; emergency: { enabled: boolean; message: string } };
}
