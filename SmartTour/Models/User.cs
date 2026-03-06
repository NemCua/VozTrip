using SQLite;

namespace SmartTour.Models
{
    /// <summary>
    /// Người dùng/Du khách
    /// </summary>
    [Table("Users")]
    public class User
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Template vân tay (hash hoặc binary)
        /// </summary>
        public string FingerprintTemplate { get; set; } = string.Empty;

        /// <summary>
        /// Mã RFID/NFC
        /// </summary>
        public string RFIDTag { get; set; } = string.Empty;

        /// <summary>
        /// Loại người dùng: Tourist, VIP, Staff, Admin
        /// </summary>
        public UserRole Role { get; set; } = UserRole.Tourist;

        /// <summary>
        /// Ngày hết hạn vé
        /// </summary>
        public DateTime? TicketExpiryDate { get; set; }

        /// <summary>
        /// Số lần truy cập còn lại (null = không giới hạn)
        /// </summary>
        public int? RemainingAccess { get; set; }

        /// <summary>
        /// Ngôn ngữ ưa thích
        /// </summary>
        public string PreferredLanguage { get; set; } = "vi";

        /// <summary>
        /// Trạng thái kích hoạt
        /// </summary>
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime LastAccessAt { get; set; } = DateTime.Now;
    }

    public enum UserRole
    {
        Tourist = 0,    // Du khách thường (1 lần)
        VIP = 1,        // VIP (nhiều lần)
        Staff = 2,      // Nhân viên
        Admin = 3       // Quản trị viên
    }
}
