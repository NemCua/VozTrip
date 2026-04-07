namespace back_end_vozTrip.Models;

public class Zone
{
    public string ZoneId { get; set; } = Guid.NewGuid().ToString();
    public string ZoneName { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Poi> Pois { get; set; } = [];
}
