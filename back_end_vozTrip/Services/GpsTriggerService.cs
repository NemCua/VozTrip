using Microsoft.EntityFrameworkCore;

namespace back_end_vozTrip.Services;

public record TriggerResult(
    string PoiId,
    string PoiName,
    string? AudioUrl,
    int?   AudioDuration,
    bool   IsVipAudio
);

public class GpsTriggerService(AppDbContext db)
{
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

    public async Task<List<TriggerResult>> ResolveTriggerAsync(
        double guestLat, double guestLon, string languageId)
    {
        var candidates = await db.Pois
            .Where(p => p.IsActive)
            .Include(p => p.Seller)
            .Include(p => p.Localizations.Where(l => l.LanguageId == languageId))
            .ToListAsync();

        var results = new List<TriggerResult>();

        foreach (var poi in candidates)
        {
            var dist = MetresBetween(guestLat, guestLon, poi.Latitude, poi.Longitude);
            if (dist > poi.TriggerRadius) continue;

            var isVip  = poi.Seller.Plan == "vip";
            var locale = poi.Localizations.FirstOrDefault();

            results.Add(new TriggerResult(
                poi.PoiId,
                locale?.Title ?? poi.PoiName,
                isVip ? locale?.AudioUrl      : null,
                isVip ? locale?.AudioDuration : null,
                isVip && locale?.AudioUrl != null
            ));
        }

        return [.. results.OrderByDescending(r => r.IsVipAudio)];
    }
}
