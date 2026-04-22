namespace back_end_vozTrip.Config;

// ─── Root ────────────────────────────────────────────────────────────────────

public class FeaturesConfig
{
    public AppCfg     App      { get; set; } = new();
    public AuthCfg    Auth     { get; set; } = new();
    public FeaturesCfg Features { get; set; } = new();
    public PagesCfg   Pages    { get; set; } = new();
}

// ─── App ─────────────────────────────────────────────────────────────────────

public class AppCfg
{
    public string         Name        { get; set; } = "VozTrip";
    public string         Version     { get; set; } = "1.0.0";
    public MaintenanceCfg Maintenance { get; set; } = new();
}

public class MaintenanceCfg
{
    public bool   Enabled { get; set; }
    public string Message { get; set; } = "VozTrip đang bảo trì. Vui lòng quay lại sau.";
}

// ─── Auth ────────────────────────────────────────────────────────────────────

public class AuthCfg
{
    public EnabledCfg Login    { get; set; } = new();
    public EnabledCfg Register { get; set; } = new();
    public JwtCfg     Jwt      { get; set; } = new();
}

public class JwtCfg
{
    public string AccessTokenTTL { get; set; } = "7d";
}

// ─── Features root ───────────────────────────────────────────────────────────

public class FeaturesCfg
{
    public GuestCfg  Guest  { get; set; } = new();
    public SellerCfg Seller { get; set; } = new();
    public AdminCfg  Admin  { get; set; } = new();
}

// ─── Guest ───────────────────────────────────────────────────────────────────

public class GuestCfg
{
    public EnabledCfg      LanguagePicker { get; set; } = new();
    public ExplorePoisCfg  ExplorePois    { get; set; } = new();
    public EnabledCfg      NearbyPois     { get; set; } = new();
    public EnabledCfg      Map            { get; set; } = new();
    public PoiDetailCfg    PoiDetail      { get; set; } = new();
    public EnabledCfg      Qna            { get; set; } = new();
    public GpsVisitLogCfg  GpsVisitLog    { get; set; } = new();
    public EnabledCfg      UsageLog       { get; set; } = new();
}

public class ExplorePoisCfg
{
    public bool       Enabled       { get; set; } = true;
    public EnabledCfg LocalizedName { get; set; } = new();
    public EnabledCfg Thumbnail     { get; set; } = new();
}

public class PoiDetailCfg
{
    public bool       Enabled      { get; set; } = true;
    public EnabledCfg Media        { get; set; } = new();
    public EnabledCfg Localization { get; set; } = new();
    public EnabledCfg Audio        { get; set; } = new();
}

public class GpsVisitLogCfg
{
    public bool       Enabled  { get; set; } = true;
    public EnabledCfg QrScan   { get; set; } = new();
    public EnabledCfg Session  { get; set; } = new();
    public EnabledCfg VisitLog { get; set; } = new();
}

// ─── Seller ──────────────────────────────────────────────────────────────────

public class SellerCfg
{
    public EnabledCfg          Profile         { get; set; } = new();
    public VipUpgradeCfg       VipUpgrade      { get; set; } = new();
    public SellerDashboardCfg  Dashboard       { get; set; } = new();
    public PoiManagementCfg    PoiManagement   { get; set; } = new();
    public LocalizationCfg     Localization    { get; set; } = new();
    public AudioUploadCfg      AudioUpload     { get; set; } = new();
    public AutoTranslateCfg    AutoTranslate   { get; set; } = new();
    public MediaManagementCfg  MediaManagement { get; set; } = new();
    public QnaManagementCfg    QnaManagement   { get; set; } = new();
}

public class VipUpgradeCfg
{
    public bool       Enabled     { get; set; } = true;
    public EnabledCfg MockPayment { get; set; } = new();
}

public class SellerDashboardCfg
{
    public bool       Enabled          { get; set; } = true;
    public EnabledCfg TotalVisits      { get; set; } = new();
    public EnabledCfg Top5Pois         { get; set; } = new();
    public EnabledCfg VisitChart7Days  { get; set; } = new();
}

public class PoiManagementCfg
{
    public bool          Enabled   { get; set; } = true;
    public EnabledCfg    Create    { get; set; } = new();
    public EnabledCfg    Update    { get; set; } = new();
    public EnabledCfg    Delete    { get; set; } = new();
    public PlanLimitCfg  PlanLimit { get; set; } = new();
}

public class PlanLimitCfg
{
    public bool Enabled        { get; set; } = true;
    public int  FreePlanMaxPois { get; set; } = 1;
}

public class LocalizationCfg
{
    public bool       Enabled { get; set; } = true;
    public EnabledCfg Upsert  { get; set; } = new();
    public EnabledCfg Delete  { get; set; } = new();
}

public class AudioUploadCfg
{
    public bool       Enabled            { get; set; } = true;
    public EnabledCfg UploadToCloudinary { get; set; } = new();
    public EnabledCfg DeleteOldOnReplace { get; set; } = new();
}

public class AutoTranslateCfg
{
    public bool       Enabled             { get; set; } = true;
    public string     Provider            { get; set; } = "LibreTranslate";
    public EnabledCfg SkipExistingManual  { get; set; } = new();
}

public class MediaManagementCfg
{
    public bool            Enabled { get; set; } = true;
    public MediaUploadCfg  Upload  { get; set; } = new();
    public EnabledCfg      Reorder { get; set; } = new();
    public EnabledCfg      Delete  { get; set; } = new();
}

public class MediaUploadCfg
{
    public bool       Enabled { get; set; } = true;
    public EnabledCfg Image   { get; set; } = new();
    public EnabledCfg Video   { get; set; } = new();
}

public class QnaManagementCfg
{
    public bool       Enabled        { get; set; } = true;
    public EnabledCfg CreateQuestion { get; set; } = new();
    public EnabledCfg UpsertAnswer   { get; set; } = new();
    public EnabledCfg DeleteQuestion { get; set; } = new();
}

// ─── Admin ───────────────────────────────────────────────────────────────────

public class AdminCfg
{
    public AdminDashboardCfg     Dashboard         { get; set; } = new();
    public SellerManagementCfg   SellerManagement  { get; set; } = new();
    public UserManagementCfg     UserManagement    { get; set; } = new();
    public MediaModerationCfg    MediaModeration   { get; set; } = new();
    public PoiModerationCfg      PoiModeration     { get; set; } = new();
    public ZoneManagementCfg     ZoneManagement    { get; set; } = new();
    public LanguageManagementCfg LanguageManagement { get; set; } = new();
    public DeviceTrackingCfg      DeviceTracking    { get; set; } = new();
}

public class AdminDashboardCfg
{
    public bool       Enabled         { get; set; } = true;
    public EnabledCfg SystemStats     { get; set; } = new();
    public EnabledCfg Top5Pois        { get; set; } = new();
    public EnabledCfg VisitChart7Days { get; set; } = new();
}

public class SellerManagementCfg
{
    public bool       Enabled { get; set; } = true;
    public EnabledCfg List    { get; set; } = new();
    public EnabledCfg Approve { get; set; } = new();
    public EnabledCfg Create  { get; set; } = new();
}

public class UserManagementCfg
{
    public bool       Enabled    { get; set; } = true;
    public EnabledCfg List       { get; set; } = new();
    public EnabledCfg ToggleLock { get; set; } = new();
    public EnabledCfg Delete     { get; set; } = new();
}

public class MediaModerationCfg
{
    public bool                  Enabled         { get; set; } = true;
    public EnabledCfg            ViewAll         { get; set; } = new();
    public DeleteCloudinaryCfg   DeleteViolation { get; set; } = new();
}

public class PoiModerationCfg
{
    public bool                Enabled      { get; set; } = true;
    public EnabledCfg          List         { get; set; } = new();
    public EnabledCfg          Detail       { get; set; } = new();
    public EnabledCfg          ToggleActive { get; set; } = new();
    public DeleteCloudinaryCfg Delete       { get; set; } = new();
}

public class DeleteCloudinaryCfg
{
    public bool       Enabled        { get; set; } = true;
    public EnabledCfg CleanCloudinary { get; set; } = new();
}

public class ZoneManagementCfg
{
    public bool       Enabled { get; set; } = true;
    public EnabledCfg Create  { get; set; } = new();
    public EnabledCfg Update  { get; set; } = new();
    public EnabledCfg Delete  { get; set; } = new();
}

public class LanguageManagementCfg
{
    public bool       Enabled      { get; set; } = true;
    public EnabledCfg Create       { get; set; } = new();
    public EnabledCfg Update       { get; set; } = new();
    public EnabledCfg ToggleActive { get; set; } = new();
}

public class DeviceTrackingCfg
{
    public bool       Enabled { get; set; } = true;
    public EnabledCfg Delete  { get; set; } = new();
}

// ─── Pages ───────────────────────────────────────────────────────────────────

public class PagesCfg
{
    public EnabledCfg       Privacy   { get; set; } = new();
    public EmergencyPageCfg Emergency { get; set; } = new();
    public EnabledCfg       Feedback  { get; set; } = new();
}

public class EmergencyPageCfg
{
    public bool   Enabled { get; set; }
    public string Message { get; set; } = "";
}

// ─── Common ──────────────────────────────────────────────────────────────────

public class EnabledCfg
{
    public bool Enabled { get; set; } = true;
}
