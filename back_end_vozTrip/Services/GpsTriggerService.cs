using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace back_end_vozTrip.Services;

public record TriggerResult(
    string PoiId,
    string PoiName,
    string? AudioUrl,
    int?   AudioDuration,
    bool   IsVipAudio,
    double Distance,   // metres from user
    int    Priority    // 1 = VIP+audio, 2 = VIP no audio, 3 = free
);

// Cached snapshot of a POI — lightweight, language-independent
internal record PoiSnapshot(
    string  PoiId,
    string  PoiName,
    double  Latitude,
    double  Longitude,
    double  TriggerRadius,
    bool    IsVip
);

public class GpsTriggerService(AppDbContext db, IMemoryCache cache)
{
    private const string CACHE_KEY = "gps_poi_candidates";
    private static readonly TimeSpan CACHE_TTL = TimeSpan.FromSeconds(30);

    private static double MetresBetween(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6_371_000;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180)
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private async Task<List<PoiSnapshot>> GetCandidatesAsync()
    {
        if (cache.TryGetValue(CACHE_KEY, out List<PoiSnapshot>? cached) && cached is not null)
            return cached;

        var snapshots = await db.Pois
            .Where(p => p.IsActive)
            .Include(p => p.Seller)
            .Select(p => new PoiSnapshot(
                p.PoiId,
                p.PoiName,
                p.Latitude,
                p.Longitude,
                p.TriggerRadius,
                p.Seller.Plan == "vip"))
            .ToListAsync();

        cache.Set(CACHE_KEY, snapshots, CACHE_TTL);
        return snapshots;
    }

    /// <summary>
    /// Returns all POIs within trigger range, ordered by priority then distance.
    /// Client plays index 0; may queue the rest.
    /// Priority: 1 = VIP with audio, 2 = VIP no audio, 3 = free plan.
    /// POI geometry is cached for 30s — localization is fetched only for matched POIs.
    /// </summary>
    public async Task<List<TriggerResult>> ResolveTriggerAsync(
        double guestLat, double guestLon, string languageId)
    {
        var candidates = await GetCandidatesAsync();

        // Step 1: geometry filter (in-memory, no DB)
        var inRange = candidates
            .Select(p => (poi: p, dist: MetresBetween(guestLat, guestLon, p.Latitude, p.Longitude)))
            .Where(x => x.dist <= x.poi.TriggerRadius)
            .ToList();

        if (inRange.Count == 0) return [];

        // Step 2: fetch localization only for matched POIs
        var matchedIds = inRange.Select(x => x.poi.PoiId).ToList();
        var locales = await db.PoiLocalizations
            .Where(l => matchedIds.Contains(l.PoiId) && l.LanguageId == languageId)
            .ToDictionaryAsync(l => l.PoiId);

        // Step 3: build results
        var results = inRange.Select(x =>
        {
            var (poi, dist) = x;
            locales.TryGetValue(poi.PoiId, out var locale);
            var hasAudio = poi.IsVip && locale?.AudioUrl != null;
            var priority = hasAudio ? 1 : poi.IsVip ? 2 : 3;

            return new TriggerResult(
                poi.PoiId,
                locale?.Title ?? poi.PoiName,
                hasAudio ? locale!.AudioUrl      : null,
                hasAudio ? locale!.AudioDuration : null,
                hasAudio,
                Math.Round(dist, 1),
                priority
            );
        }).ToList();

        return [.. results.OrderBy(r => r.Priority).ThenBy(r => r.Distance)];
    }
}
