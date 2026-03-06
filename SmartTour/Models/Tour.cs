using SQLite;

namespace SmartTour.Models
{
    /// <summary>
    /// Tour thuyết minh (nhóm các POI)
    /// </summary>
    [Table("Tours")]
    public class Tour
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Thời gian ước tính (phút)
        /// </summary>
        public int EstimatedDuration { get; set; }

        /// <summary>
        /// Độ khó: Easy, Medium, Hard
        /// </summary>
        public string Difficulty { get; set; } = "Easy";

        /// <summary>
        /// Danh sách ID các POI (phân cách bằng dấu phẩy)
        /// </summary>
        public string POIIds { get; set; } = string.Empty;

        /// <summary>
        /// Hình ảnh thumbnail
        /// </summary>
        public string ThumbnailPath { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Ignore]
        public List<int> POIList
        {
            get
            {
                if (string.IsNullOrEmpty(POIIds))
                    return new List<int>();

                return POIIds.Split(',')
                    .Where(s => int.TryParse(s, out _))
                    .Select(int.Parse)
                    .ToList();
            }
        }
    }
}
