namespace back_end_vozTrip.Models;

public class GuestSession
{
    public string SessionId { get; set; } = string.Empty; // UUID tu app sinh ra
    public string? LanguageId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Language? Language { get; set; }
    public ICollection<VisitLog> VisitLogs { get; set; } = [];
}
