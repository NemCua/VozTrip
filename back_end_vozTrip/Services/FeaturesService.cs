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
        ("app.maintenance",          false, "Bảo trì toàn app"),
        ("guest.languagePicker",     true,  "Chọn ngôn ngữ"),
        ("guest.explorePois",        true,  "Khám phá POI (danh sách)"),
        ("guest.poiDetail",          true,  "Chi tiết POI"),
        ("guest.poiDetail.media",    true,  "Media trong POI detail"),
        ("guest.poiDetail.audio",    true,  "Audio thuyết minh"),
        ("guest.qna",                true,  "Hỏi đáp tại POI"),
        ("guest.gpsVisitLog",        true,  "GPS trigger & visit log"),
        ("guest.gpsVisitLog.qrScan", true,  "Tab quét QR (web + mobile)"),
        ("guest.usageLog",           true,  "Ghi sự kiện dùng app"),
    ];
}

public interface IFeaturesService
{
    FeaturesConfig GetConfig();
    Task SeedDefaultsAsync(AppDbContext db);
    Task SetFlagAsync(string key, bool enabled, AppDbContext db);
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
        InvalidateCache();
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
                    Qna          = new EnabledCfg { Enabled = Get("guest.qna", true) },
                    GpsVisitLog  = new GpsVisitLogCfg
                    {
                        Enabled  = Get("guest.gpsVisitLog", true),
                        QrScan   = new EnabledCfg { Enabled = Get("guest.gpsVisitLog.qrScan", true) },
                        Session  = new EnabledCfg { Enabled = true },
                        VisitLog = new EnabledCfg { Enabled = true },
                    },
                    UsageLog = new EnabledCfg { Enabled = Get("guest.usageLog", true) },
                }
            }
        };

        cache.Set(CacheKey, config, CacheTtl);
    }
}
