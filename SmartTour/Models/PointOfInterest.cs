using SQLite;

namespace SmartTour.Models
{
    /// <summary>
    /// Điểm thuyết minh - Point of Interest
    /// </summary>
    [Table("POIs")]
    public class PointOfInterest
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Vĩ độ
        /// </summary>
        public double Latitude { get; set; }

        /// <summary>
        /// Kinh độ
        /// </summary>
        public double Longitude { get; set; }

        /// <summary>
        /// Đường dẫn ảnh minh họa
        /// </summary>
        public string ImagePath { get; set; } = string.Empty;

        /// <summary>
        /// Đường dẫn file audio thuyết minh (tiếng Việt)
        /// </summary>
        public string AudioPathVi { get; set; } = string.Empty;

        /// <summary>
        /// Đường dẫn file audio thuyết minh (tiếng Anh)
        /// </summary>
        public string AudioPathEn { get; set; } = string.Empty;

        /// <summary>
        /// Script cho Text-to-Speech (tiếng Việt)
        /// </summary>
        public string TTSScriptVi { get; set; } = string.Empty;

        /// <summary>
        /// Script cho Text-to-Speech (tiếng Anh)
        /// </summary>
        public string TTSScriptEn { get; set; } = string.Empty;

        /// <summary>
        /// Link bản đồ
        /// </summary>
        public string MapUrl { get; set; } = string.Empty;

        /// <summary>
        /// Bán kính kích hoạt (mét)
        /// </summary>
        public double ActivationRadius { get; set; } = 50; // 50m mặc định

        /// <summary>
        /// Loại POI (Đền, Chùa, Bảo tàng, Cổng...)
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Độ ưu tiên hiển thị
        /// </summary>
        public int Priority { get; set; } = 0;

        /// <summary>
        /// Trạng thái hoạt động
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Ngày tạo
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// Ngày cập nhật
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
