namespace back_end_vozTrip.Models;

public class UsageLog
{
    public string LogId { get; set; } = Guid.NewGuid().ToString();
    public string? SessionId { get; set; }
    public string EventType { get; set; } = string.Empty; // "qr_scan" | "app_open"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
