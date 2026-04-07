namespace back_end_vozTrip.Models;

public class VisitLog
{
    public string LogId { get; set; } = Guid.NewGuid().ToString();
    public string? SessionId { get; set; }
    public string? PoiId { get; set; }
    public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public GuestSession? GuestSession { get; set; }
    public Poi? Poi { get; set; }
}
