using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;

namespace back_end_vozTrip.Services;

// Danh sách tất cả flag với giá trị mặc định và nhãn hiển thị
public static class KnownFlags
{
    public static readonly (string Key, bool Default, string Label)[] All =
    [
        ("app.maintenance",                    false, "Bảo trì toàn app"),

        ("guest.languagePicker",               true,  "Chọn ngôn ngữ"),
        ("guest.explorePois",                  true,  "Khám phá POI (danh sách)"),
        ("guest.poiDetail",                    true,  "Chi tiết POI"),
        ("guest.poiDetail.media",              true,  "Media trong POI detail"),
        ("guest.poiDetail.audio",              true,  "Audio thuyết minh"),
        ("guest.qna",                          true,  "Hỏi đáp tại POI"),
        ("guest.gpsVisitLog",                  true,  "GPS trigger & visit log"),
        ("guest.gpsVisitLog.qrScan",           true,  "Tab quét QR (web + mobile)"),
        ("guest.usageLog",                     true,  "Ghi sự kiện dùng app"),

        ("seller.profile",                     true,  "Seller: xem thông tin shop"),
        ("seller.vipUpgrade",                  true,  "Seller: nâng cấp VIP"),
        ("seller.dashboard",                   true,  "Seller: dashboard thống kê"),
        ("seller.poiManagement",               true,  "Seller: quản lý POI"),
        ("seller.localization",                true,  "Seller: dịch nội dung POI"),
        ("seller.audioUpload",                 true,  "Seller: upload audio"),
        ("seller.autoTranslate",               true,  "Seller: tự động dịch"),
        ("seller.mediaManagement",             true,  "Seller: quản lý media"),
        ("seller.qnaManagement",               true,  "Seller: quản lý Q&A"),

        ("admin.dashboard",                    true,  "Admin: dashboard hệ thống"),
        ("admin.sellerManagement",             true,  "Admin: quản lý seller"),
        ("admin.userManagement",               true,  "Admin: quản lý user"),
        ("admin.mediaModeration",              true,  "Admin: kiểm duyệt media"),
        ("admin.poiModeration",                true,  "Admin: kiểm duyệt POI"),
        ("admin.zoneManagement",               true,  "Admin: quản lý khu vực"),
        ("admin.languageManagement",           true,  "Admin: quản lý ngôn ngữ"),
        ("admin.deviceTracking",               true,  "Admin: theo dõi thiết bị"),
    ];
}

public interface IFeaturesService
{
    FeaturesConfig GetConfig();
    Task SeedDefaultsAsync(AppDbContext db);
    Task SetFlagAsync(string key, bool enabled, AppDbContext db);
    Task RefreshCacheAsync(AppDbContext db);
}

public class FeaturesService(IMemoryCache cache) : IFeaturesService
{
    private const string CacheKey = "features_config";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public FeaturesConfig GetConfig() =>
        cache.Get<FeaturesConfig>(CacheKey) ?? new FeaturesConfig();

    public void InvalidateCache() => cache.Remove(CacheKey);

    // Được gọi từ background task khi app khởi động
    public async Task SeedDefaultsAsync(AppDbContext db)
    {
        var existing = await db.FeatureFlags.Select(f => f.Key).ToListAsync();
        var toAdd = KnownFlags.All
            .Where(f => !existing.Contains(f.Key))
            .Select(f => new FeatureFlag { Key = f.Key, Enabled = f.Default, Label = f.Label });

        if (toAdd.Any())
        {
            db.FeatureFlags.AddRange(toAdd);
            await db.SaveChangesAsync();
        }

        await RefreshCacheAsync(db);
    }

    public async Task SetFlagAsync(string key, bool enabled, AppDbContext db)
    {
        var flag = await db.FeatureFlags.FindAsync(key);
        if (flag is null) return;
        flag.Enabled   = enabled;
        flag.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        await RefreshCacheAsync(db);
    }

    // Đọc toàn bộ flags từ DB và build FeaturesConfig, lưu cache
    public async Task RefreshCacheAsync(AppDbContext db)
    {
        var flags = await db.FeatureFlags.ToDictionaryAsync(f => f.Key, f => f.Enabled);
        bool Get(string key, bool def) => flags.TryGetValue(key, out var v) ? v : def;

        var config = new FeaturesConfig
        {
            App = new AppCfg
            {
                Maintenance = new MaintenanceCfg { Enabled = Get("app.maintenance", false) }
            },
            Features = new FeaturesCfg
            {
                Guest = new GuestCfg
                {
                    LanguagePicker = new EnabledCfg { Enabled = Get("guest.languagePicker", true) },
                    ExplorePois    = new ExplorePoisCfg
                    {
                        Enabled       = Get("guest.explorePois", true),
                        LocalizedName = new EnabledCfg { Enabled = true },
                        Thumbnail     = new EnabledCfg { Enabled = true },
                    },
                    PoiDetail = new PoiDetailCfg
                    {
                        Enabled      = Get("guest.poiDetail", true),
                        Media        = new EnabledCfg { Enabled = Get("guest.poiDetail.media", true) },
                        Localization = new EnabledCfg { Enabled = true },
                        Audio        = new EnabledCfg { Enabled = Get("guest.poiDetail.audio", true) },
                    },
                    Qna         = new EnabledCfg { Enabled = Get("guest.qna", true) },
                    GpsVisitLog = new GpsVisitLogCfg
                    {
                        Enabled  = Get("guest.gpsVisitLog", true),
                        QrScan   = new EnabledCfg { Enabled = Get("guest.gpsVisitLog.qrScan", true) },
                        Session  = new EnabledCfg { Enabled = true },
                        VisitLog = new EnabledCfg { Enabled = true },
                    },
                    UsageLog = new EnabledCfg { Enabled = Get("guest.usageLog", true) },
                },
                Seller = new SellerCfg
                {
                    Profile         = new EnabledCfg { Enabled = Get("seller.profile", true) },
                    VipUpgrade      = new VipUpgradeCfg
                    {
                        Enabled     = Get("seller.vipUpgrade", true),
                        MockPayment = new EnabledCfg { Enabled = true },
                    },
                    Dashboard       = new SellerDashboardCfg
                    {
                        Enabled         = Get("seller.dashboard", true),
                        TotalVisits     = new EnabledCfg { Enabled = true },
                        Top5Pois        = new EnabledCfg { Enabled = true },
                        VisitChart7Days = new EnabledCfg { Enabled = true },
                    },
                    PoiManagement   = new PoiManagementCfg
                    {
                        Enabled   = Get("seller.poiManagement", true),
                        Create    = new EnabledCfg { Enabled = true },
                        Update    = new EnabledCfg { Enabled = true },
                        Delete    = new EnabledCfg { Enabled = true },
                        PlanLimit = new PlanLimitCfg { Enabled = true, FreePlanMaxPois = 1 },
                    },
                    Localization    = new LocalizationCfg
                    {
                        Enabled = Get("seller.localization", true),
                        Upsert  = new EnabledCfg { Enabled = true },
                        Delete  = new EnabledCfg { Enabled = true },
                    },
                    AudioUpload     = new AudioUploadCfg
                    {
                        Enabled            = Get("seller.audioUpload", true),
                        UploadToCloudinary = new EnabledCfg { Enabled = true },
                        DeleteOldOnReplace = new EnabledCfg { Enabled = true },
                    },
                    AutoTranslate   = new AutoTranslateCfg
                    {
                        Enabled            = Get("seller.autoTranslate", true),
                        SkipExistingManual = new EnabledCfg { Enabled = true },
                    },
                    MediaManagement = new MediaManagementCfg
                    {
                        Enabled = Get("seller.mediaManagement", true),
                        Upload  = new MediaUploadCfg
                        {
                            Enabled = true,
                            Image   = new EnabledCfg { Enabled = true },
                            Video   = new EnabledCfg { Enabled = true },
                        },
                        Reorder = new EnabledCfg { Enabled = true },
                        Delete  = new EnabledCfg { Enabled = true },
                    },
                    QnaManagement   = new QnaManagementCfg
                    {
                        Enabled        = Get("seller.qnaManagement", true),
                        CreateQuestion = new EnabledCfg { Enabled = true },
                        UpsertAnswer   = new EnabledCfg { Enabled = true },
                        DeleteQuestion = new EnabledCfg { Enabled = true },
                    },
                },
                Admin = new AdminCfg
                {
                    Dashboard         = new AdminDashboardCfg
                    {
                        Enabled         = Get("admin.dashboard", true),
                        SystemStats     = new EnabledCfg { Enabled = true },
                        Top5Pois        = new EnabledCfg { Enabled = true },
                        VisitChart7Days = new EnabledCfg { Enabled = true },
                    },
                    SellerManagement  = new SellerManagementCfg
                    {
                        Enabled = Get("admin.sellerManagement", true),
                        List    = new EnabledCfg { Enabled = true },
                        Approve = new EnabledCfg { Enabled = true },
                        Create  = new EnabledCfg { Enabled = true },
                    },
                    UserManagement    = new UserManagementCfg
                    {
                        Enabled    = Get("admin.userManagement", true),
                        List       = new EnabledCfg { Enabled = true },
                        ToggleLock = new EnabledCfg { Enabled = true },
                        Delete     = new EnabledCfg { Enabled = true },
                    },
                    MediaModeration   = new MediaModerationCfg
                    {
                        Enabled         = Get("admin.mediaModeration", true),
                        ViewAll         = new EnabledCfg { Enabled = true },
                        DeleteViolation = new DeleteCloudinaryCfg
                        {
                            Enabled         = true,
                            CleanCloudinary = new EnabledCfg { Enabled = true },
                        },
                    },
                    PoiModeration     = new PoiModerationCfg
                    {
                        Enabled      = Get("admin.poiModeration", true),
                        List         = new EnabledCfg { Enabled = true },
                        Detail       = new EnabledCfg { Enabled = true },
                        ToggleActive = new EnabledCfg { Enabled = true },
                        Delete       = new DeleteCloudinaryCfg
                        {
                            Enabled         = true,
                            CleanCloudinary = new EnabledCfg { Enabled = true },
                        },
                    },
                    ZoneManagement    = new ZoneManagementCfg
                    {
                        Enabled = Get("admin.zoneManagement", true),
                        Create  = new EnabledCfg { Enabled = true },
                        Update  = new EnabledCfg { Enabled = true },
                        Delete  = new EnabledCfg { Enabled = true },
                    },
                    LanguageManagement = new LanguageManagementCfg
                    {
                        Enabled      = Get("admin.languageManagement", true),
                        Create       = new EnabledCfg { Enabled = true },
                        Update       = new EnabledCfg { Enabled = true },
                        ToggleActive = new EnabledCfg { Enabled = true },
                    },
                    DeviceTracking    = new DeviceTrackingCfg
                    {
                        Enabled = Get("admin.deviceTracking", true),
                        Delete  = new EnabledCfg { Enabled = true },
                    },
                },
            }
        };

        cache.Set(CacheKey, config, CacheTtl);
    }
}
