namespace back_end_vozTrip.Models;

public class Poi
{
    public string PoiId { get; set; } = Guid.NewGuid().ToString();
    public string SellerId { get; set; } = string.Empty;
    public string? ZoneId { get; set; }
    public string PoiName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double TriggerRadius { get; set; } = 10.0; // met
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public DateTime? FeaturedUntil { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Seller Seller { get; set; } = null!;
    public Zone? Zone { get; set; }
    public ICollection<PoiLocalization> Localizations { get; set; } = [];
    public ICollection<PoiMedia> Media { get; set; } = [];
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<VisitLog> VisitLogs { get; set; } = [];
}
