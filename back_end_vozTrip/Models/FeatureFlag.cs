namespace back_end_vozTrip.Models;

public class FeatureFlag
{
    public string   Key       { get; set; } = "";
    public bool     Enabled   { get; set; } = true;
    public string   Label     { get; set; } = "";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
