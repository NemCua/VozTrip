namespace back_end_vozTrip.Models;

public class DeviceRecord
{
    public string DeviceId { get; set; } = string.Empty; // UUID từ AsyncStorage của app
    public string Platform { get; set; } = string.Empty; // "ios" | "android"
    public string OsVersion { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSeenAt { get; set; }
    public bool Approved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
}
