// Mirror của FeaturesConfig.cs — giữ đồng bộ khi thêm flag mới

export interface EnabledCfg {
  enabled: boolean;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export interface MaintenanceCfg {
  enabled: boolean;
  message: string;
}

export interface AppCfg {
  name: string;
  version: string;
  maintenance: MaintenanceCfg;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthCfg {
  login: EnabledCfg;
  register: EnabledCfg;
  jwt: { accessTokenTTL: string };
}

// ─── Guest ───────────────────────────────────────────────────────────────────

export interface ExplorePoisCfg {
  enabled: boolean;
  localizedName: EnabledCfg;
  thumbnail: EnabledCfg;
}

export interface PoiDetailCfg {
  enabled: boolean;
  media: EnabledCfg;
  localization: EnabledCfg;
  audio: EnabledCfg;
}

export interface GpsVisitLogCfg {
  enabled: boolean;
  qrScan: EnabledCfg;
  session: EnabledCfg;
  visitLog: EnabledCfg;
}

export interface GuestCfg {
  languagePicker: EnabledCfg;
  explorePois: ExplorePoisCfg;
  poiDetail: PoiDetailCfg;
  qna: EnabledCfg;
  gpsVisitLog: GpsVisitLogCfg;
  usageLog: EnabledCfg;
}

// ─── Seller ──────────────────────────────────────────────────────────────────

export interface PlanLimitCfg {
  enabled: boolean;
  freePlanMaxPois: number;
}

export interface PoiManagementCfg {
  enabled: boolean;
  create: EnabledCfg;
  update: EnabledCfg;
  delete: EnabledCfg;
  planLimit: PlanLimitCfg;
}

export interface VipUpgradeCfg {
  enabled: boolean;
  mockPayment: EnabledCfg;
}

export interface SellerDashboardCfg {
  enabled: boolean;
  totalVisits: EnabledCfg;
  top5Pois: EnabledCfg;
  visitChart7Days: EnabledCfg;
}

export interface MediaUploadCfg {
  enabled: boolean;
  image: EnabledCfg;
  video: EnabledCfg;
}

export interface MediaManagementCfg {
  enabled: boolean;
  upload: MediaUploadCfg;
  reorder: EnabledCfg;
  delete: EnabledCfg;
}

export interface SellerCfg {
  profile: EnabledCfg;
  vipUpgrade: VipUpgradeCfg;
  dashboard: SellerDashboardCfg;
  poiManagement: PoiManagementCfg;
  localization: EnabledCfg;
  audioUpload: EnabledCfg;
  autoTranslate: EnabledCfg;
  mediaManagement: MediaManagementCfg;
  qnaManagement: EnabledCfg;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminCfg {
  dashboard: EnabledCfg;
  sellerManagement: EnabledCfg;
  userManagement: EnabledCfg;
  mediaModeration: EnabledCfg;
  poiModeration: EnabledCfg;
  zoneManagement: EnabledCfg;
  languageManagement: EnabledCfg;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export interface PagesCfg {
  privacy: EnabledCfg;
  emergency: { enabled: boolean; message: string };
}

// ─── Root ────────────────────────────────────────────────────────────────────

export interface FeaturesCfg {
  guest: GuestCfg;
  seller: SellerCfg;
  admin: AdminCfg;
}

export interface FeaturesConfig {
  app: AppCfg;
  auth: AuthCfg;
  features: FeaturesCfg;
  pages: PagesCfg;
}
