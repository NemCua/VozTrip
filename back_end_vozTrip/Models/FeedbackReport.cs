namespace back_end_vozTrip.Models;

public class FeedbackReport
{
    public string ReportId { get; set; } = Guid.NewGuid().ToString();
    public string? SessionId { get; set; }
    public string? DeviceId { get; set; }
    public string Type { get; set; } = "other";       // bug | suggestion | content | other
    public string Message { get; set; } = string.Empty;
    public string? PoiId { get; set; }                // optional: feedback về POI cụ thể
    public string Platform { get; set; } = "web";     // web | ios | android
    public string Lang { get; set; } = "vi";          // ngôn ngữ user đang dùng
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Admin fields
    public string Status { get; set; } = "pending";   // pending | reviewed | resolved
    public string? AdminNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
