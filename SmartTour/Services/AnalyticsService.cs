using SmartTour.Data;
using SmartTour.Models;

namespace SmartTour.Services
{
    /// <summary>
    /// Service phân tích dữ liệu du khách
    /// </summary>
    public class AnalyticsService
    {
        private readonly DatabaseService _database;

        public AnalyticsService(DatabaseService database)
        {
            _database = database;
        }

        /// <summary>
        /// Ghi log truy cập
        /// </summary>
        public async Task LogAccessAsync(int userId, AccessEventType eventType, int? poiId = null, double? latitude = null, double? longitude = null)
        {
            var log = new AccessLog
            {
                UserId = userId,
                EventType = eventType,
                POIId = poiId,
                Latitude = latitude,
                Longitude = longitude,
                Timestamp = DateTime.Now
            };

            await _database.SaveAccessLogAsync(log);
        }

        /// <summary>
        /// Lấy thống kê lượt thăm theo POI
        /// </summary>
        public async Task<Dictionary<string, int>> GetPOIVisitStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var pois = await _database.GetPOIsAsync();
            var stats = new Dictionary<string, int>();

            foreach (var poi in pois)
            {
                var logs = await _database.GetPOIVisitLogsAsync(poi.Id);
                
                if (startDate.HasValue && endDate.HasValue)
                {
                    logs = logs.Where(l => l.Timestamp >= startDate.Value && l.Timestamp <= endDate.Value).ToList();
                }

                stats[poi.Name] = logs.Count;
            }

            return stats.OrderByDescending(x => x.Value).ToDictionary(x => x.Key, x => x.Value);
        }

        /// <summary>
        /// Lấy POI được thăm nhiều nhất
        /// </summary>
        public async Task<List<(PointOfInterest POI, int VisitCount)>> GetTopVisitedPOIsAsync(int topN = 10)
        {
            var pois = await _database.GetPOIsAsync();
            var result = new List<(PointOfInterest, int)>();

            foreach (var poi in pois)
            {
                var logs = await _database.GetPOIVisitLogsAsync(poi.Id);
                result.Add((poi, logs.Count));
            }

            return result.OrderByDescending(x => x.Item2).Take(topN).ToList();
        }

        /// <summary>
        /// Lấy thời gian trung bình tại mỗi POI
        /// </summary>
        public async Task<Dictionary<string, double>> GetAverageDurationByPOIAsync()
        {
            var pois = await _database.GetPOIsAsync();
            var stats = new Dictionary<string, double>();

            foreach (var poi in pois)
            {
                var logs = await _database.GetPOIVisitLogsAsync(poi.Id);
                var durations = logs.Where(l => l.DurationMinutes.HasValue).Select(l => l.DurationMinutes!.Value);
                
                if (durations.Any())
                {
                    stats[poi.Name] = durations.Average();
                }
                else
                {
                    stats[poi.Name] = 0;
                }
            }

            return stats;
        }

        /// <summary>
        /// Lấy heatmap vị trí du khách
        /// </summary>
        public async Task<List<(double Latitude, double Longitude, int Count)>> GetUserHeatmapAsync()
        {
            var allLogs = await _database.GetAccessLogsByDateAsync(DateTime.Now);
            
            var heatmap = allLogs
                .Where(l => l.Latitude.HasValue && l.Longitude.HasValue)
                .GroupBy(l => new { Lat = Math.Round(l.Latitude!.Value, 4), Lon = Math.Round(l.Longitude!.Value, 4) })
                .Select(g => (g.Key.Lat, g.Key.Lon, g.Count()))
                .OrderByDescending(x => x.Item3)
                .ToList();

            return heatmap;
        }

        /// <summary>
        /// Lấy thống kê lượng khách theo ngày
        /// </summary>
        public async Task<Dictionary<DateTime, int>> GetDailyVisitorStatsAsync(int days = 7)
        {
            var stats = new Dictionary<DateTime, int>();
            
            for (int i = 0; i < days; i++)
            {
                var date = DateTime.Now.Date.AddDays(-i);
                var logs = await _database.GetAccessLogsByDateAsync(date);
                var uniqueVisitors = logs.Select(l => l.UserId).Distinct().Count();
                stats[date] = uniqueVisitors;
            }

            return stats.OrderBy(x => x.Key).ToDictionary(x => x.Key, x => x.Value);
        }

        /// <summary>
        /// Lấy đường đi phổ biến nhất (chuỗi POI)
        /// </summary>
        public async Task<List<string>> GetPopularRoutesAsync()
        {
            // Lấy logs của tất cả users
            var users = await _database.GetUsersAsync();
            var routes = new Dictionary<string, int>();

            foreach (var user in users)
            {
                var logs = await _database.GetAccessLogsAsync(user.Id);
                var poiVisits = logs
                    .Where(l => l.EventType == AccessEventType.POIVisit && l.POIId.HasValue)
                    .OrderBy(l => l.Timestamp)
                    .Select(l => l.POIId!.Value)
                    .ToList();

                if (poiVisits.Count > 1)
                {
                    var route = string.Join(" -> ", poiVisits);
                    if (routes.ContainsKey(route))
                        routes[route]++;
                    else
                        routes[route] = 1;
                }
            }

            return routes.OrderByDescending(x => x.Value).Take(5).Select(x => x.Key).ToList();
        }

        /// <summary>
        /// Xuất báo cáo
        /// </summary>
        public async Task<string> GenerateReportAsync(DateTime startDate, DateTime endDate)
        {
            var report = new System.Text.StringBuilder();
            
            report.AppendLine("=== BÁO CÁO THỐNG KÊ SMARTTOUR ===");
            report.AppendLine($"Từ ngày: {startDate:dd/MM/yyyy}");
            report.AppendLine($"Đến ngày: {endDate:dd/MM/yyyy}");
            report.AppendLine();

            // Thống kê tổng quan
            var allLogs = new List<AccessLog>();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var logs = await _database.GetAccessLogsByDateAsync(date);
                allLogs.AddRange(logs);
            }

            var uniqueVisitors = allLogs.Select(l => l.UserId).Distinct().Count();
            var totalVisits = allLogs.Count(l => l.EventType == AccessEventType.POIVisit);

            report.AppendLine($"Tổng số du khách: {uniqueVisitors}");
            report.AppendLine($"Tổng lượt thăm điểm: {totalVisits}");
            report.AppendLine();

            // Top POI
            report.AppendLine("=== TOP ĐIỂM THĂM NHIỀU NHẤT ===");
            var topPOIs = await GetTopVisitedPOIsAsync(5);
            foreach (var (poi, count) in topPOIs)
            {
                report.AppendLine($"{poi.Name}: {count} lượt");
            }
            report.AppendLine();

            // Thời gian trung bình
            report.AppendLine("=== THỜI GIAN TRUNG BÌNH TẠI MỖI ĐIỂM ===");
            var avgDurations = await GetAverageDurationByPOIAsync();
            foreach (var kvp in avgDurations.Where(x => x.Value > 0))
            {
                report.AppendLine($"{kvp.Key}: {kvp.Value:F1} phút");
            }

            return report.ToString();
        }
    }
}
