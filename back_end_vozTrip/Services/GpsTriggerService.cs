using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace back_end_vozTrip.Services;

public record TriggerResult(
    string PoiId,
    string PoiName,
    string? AudioUrl,
    int?   AudioDuration,
    bool   IsVipAudio,
    bool   IsBoosted,
    double Distance,
    int    Priority
);

internal record PoiSnapshot(
    string    PoiId,
    string    PoiName,
    double    Latitude,
    double    Longitude,
    double    TriggerRadius,
    bool      IsVip,
    bool      IsFeatured,
    DateTime? FeaturedUntil
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
                p.Seller.Plan == "vip",
                p.IsFeatured,
                p.FeaturedUntil))
            .ToListAsync();

        cache.Set(CACHE_KEY, snapshots, CACHE_TTL);
        return snapshots;
    }

    /// <summary>
    /// Returns POIs within trigger range that haven't been triggered yet, ordered by priority then distance.
    /// Priority: 1=boosted+audio, 2=boosted, 3=vip+audio, 4=vip, 5=free.
    /// </summary>
    public async Task<List<TriggerResult>> ResolveTriggerAsync(
        double guestLat, double guestLon,
        string languageId,
        IReadOnlySet<string> alreadyTriggered)
    {
        var candidates = await GetCandidatesAsync();
        var now = DateTime.UtcNow;

        var inRange = candidates
            .Where(p => !alreadyTriggered.Contains(p.PoiId))
            .Select(p => (poi: p, dist: MetresBetween(guestLat, guestLon, p.Latitude, p.Longitude)))
            .Where(x => x.dist <= x.poi.TriggerRadius)
            .ToList();

        if (inRange.Count == 0) return [];

        var matchedIds = inRange.Select(x => x.poi.PoiId).ToList();
        var locales = await db.PoiLocalizations
            .Where(l => matchedIds.Contains(l.PoiId) && l.LanguageId == languageId)
            .ToDictionaryAsync(l => l.PoiId);

        var results = inRange.Select(x =>
        {
            var (poi, dist) = x;
            locales.TryGetValue(poi.PoiId, out var locale);

            var isBoosted = poi.IsFeatured && poi.FeaturedUntil.HasValue && poi.FeaturedUntil.Value > now;
            var hasAudio  = locale?.AudioUrl != null;

            int priority = (isBoosted, hasAudio, poi.IsVip) switch
            {
                (true,  true,  _)     => 1,
                (true,  false, _)     => 2,
                (false, true,  true)  => 3,
                (false, false, true)  => 4,
                _                     => 5,
            };

            return new TriggerResult(
                poi.PoiId,
                locale?.Title ?? poi.PoiName,
                locale?.AudioUrl,
                locale?.AudioDuration,
                hasAudio && poi.IsVip,
                isBoosted,
                Math.Round(dist, 1),
                priority
            );
        }).ToList();

        return [.. results.OrderBy(r => r.Priority).ThenBy(r => r.Distance)];
    }
}
