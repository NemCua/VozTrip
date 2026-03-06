using SQLite;

namespace SmartTour.Models
{
    /// <summary>
    /// Log truy cập và thăm điểm
    /// </summary>
    [Table("AccessLogs")]
    public class AccessLog
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int? POIId { get; set; }

        /// <summary>
        /// Loại sự kiện: Entry, Exit, POIVisit
        /// </summary>
        public AccessEventType EventType { get; set; }

        /// <summary>
        /// Vĩ độ tại thời điểm truy cập
        /// </summary>
        public double? Latitude { get; set; }

        /// <summary>
        /// Kinh độ tại thời điểm truy cập
        /// </summary>
        public double? Longitude { get; set; }

        /// <summary>
        /// Thời gian truy cập
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.Now;

        /// <summary>
        /// Thời gian ở tại điểm (phút)
        /// </summary>
        public int? DurationMinutes { get; set; }

        /// <summary>
        /// Ghi chú bổ sung
        /// </summary>
        public string Notes { get; set; } = string.Empty;

        /// <summary>
        /// Đã phát audio thuyết minh chưa
        /// </summary>
        public bool AudioPlayed { get; set; } = false;
    }

    public enum AccessEventType
    {
        Entry = 0,      // Vào cổng
        Exit = 1,       // Ra cổng
        POIVisit = 2    // Thăm điểm thuyết minh
    }
}
