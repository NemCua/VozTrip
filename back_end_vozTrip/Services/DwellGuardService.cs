using Microsoft.Extensions.Caching.Memory;

namespace back_end_vozTrip.Services;

/// <summary>
/// Ngăn audio trigger ngay lập tức khi user đi qua quá nhanh (xe máy, ô tô).
/// Logic: chỉ cho phép trigger khi session đã dừng / di chuyển chậm trong vùng POI
/// đủ lâu (dwell time) VÀ tốc độ ước tính dưới ngưỡng cho phép.
///
/// Cách dùng (trong endpoint GPS trigger, sau khi ResolveTriggerAsync trả về):
///   var allowed = dwellGuard.Filter(sessionId, lat, lon, resolvedResults);
///   // chỉ phát audio cho `allowed`, còn lại bỏ qua
/// </summary>
public sealed class DwellGuardService(IMemoryCache cache)
{
    // Tốc độ tối đa cho phép trigger (m/s). ~5 m/s ≈ 18 km/h (đi bộ nhanh / xe đạp chậm).
    private const double MAX_SPEED_MS      = 5.0;

    // Thời gian tối thiểu phải ở trong vùng POI trước khi trigger.
    private static readonly TimeSpan DWELL_REQUIRED = TimeSpan.FromSeconds(4);

    // TTL cache cho trạng thái session (tự dọn sau khi session không hoạt động).
    private static readonly TimeSpan SESSION_TTL    = TimeSpan.FromMinutes(10);

    // ── Cache keys ──────────────────────────────────────────────────────────

    private static string EntryKey(string sessionId, string poiId) =>
        $"dwell:entry:{sessionId}:{poiId}";

    private static string PosKey(string sessionId) =>
        $"dwell:pos:{sessionId}";

    // ── Public API ───────────────────────────────────────────────────────────

    /// <summary>
    /// Lọc danh sách POI đã resolve, chỉ giữ lại những POI được phép trigger
    /// dựa trên tốc độ di chuyển và thời gian dừng (dwell).
    /// </summary>
    public List<TriggerResult> Filter(
        string            sessionId,
        double            lat,
        double            lon,
        List<TriggerResult> candidates)
    {
        var now   = DateTime.UtcNow;
        var speed = EstimateSpeed(sessionId, lat, lon, now);

        UpdatePosition(sessionId, lat, lon, now);

        // Nếu đang di chuyển quá nhanh → không trigger bất kỳ POI nào lần này,
        // nhưng vẫn ghi nhận entry time để dwell timer không bị reset.
        if (speed > MAX_SPEED_MS)
        {
            RecordEntries(sessionId, candidates, now, resetIfMissing: false);
            return [];
        }

        RecordEntries(sessionId, candidates, now, resetIfMissing: true);

        return candidates
            .Where(r => HasDwelled(sessionId, r.PoiId, now))
            .ToList();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private record PositionStamp(double Lat, double Lon, DateTime At);

    private double EstimateSpeed(string sessionId, double lat, double lon, DateTime now)
    {
        if (!cache.TryGetValue(PosKey(sessionId), out PositionStamp? prev) || prev is null)
            return 0;

        var elapsed = (now - prev.At).TotalSeconds;
        if (elapsed <= 0) return 0;

        var dist = MetresBetween(prev.Lat, prev.Lon, lat, lon);
        return dist / elapsed; // m/s
    }

    private void UpdatePosition(string sessionId, double lat, double lon, DateTime now)
    {
        cache.Set(PosKey(sessionId), new PositionStamp(lat, lon, now), SESSION_TTL);
    }

    /// <summary>
    /// Ghi lần đầu vào vùng POI (entry timestamp).
    /// resetIfMissing=true  → tạo entry mới nếu chưa có (bắt đầu đếm dwell).
    /// resetIfMissing=false → bỏ qua nếu chưa có (user đang phóng qua, chưa đủ điều kiện).
    /// </summary>
    private void RecordEntries(
        string              sessionId,
        List<TriggerResult> candidates,
        DateTime            now,
        bool                resetIfMissing)
    {
        foreach (var r in candidates)
        {
            var key = EntryKey(sessionId, r.PoiId);
            if (!cache.TryGetValue(key, out DateTime _) && resetIfMissing)
                cache.Set(key, now, SESSION_TTL);
        }
    }

    private bool HasDwelled(string sessionId, string poiId, DateTime now)
    {
        if (!cache.TryGetValue(EntryKey(sessionId, poiId), out DateTime enteredAt))
            return false;

        return (now - enteredAt) >= DWELL_REQUIRED;
    }

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
}
