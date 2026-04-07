namespace back_end_vozTrip.Models;

public class PoiLocalization
{
    public string LocalizationId { get; set; } = Guid.NewGuid().ToString();
    public string PoiId { get; set; } = string.Empty;
    public string LanguageId { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? AudioUrl { get; set; }       // Cloudinary URL
    public string? AudioPublicId { get; set; }  // Cloudinary public_id de xoa
    public int? AudioDuration { get; set; }     // giay
    public bool IsAutoTranslated { get; set; } = false;

    // Navigation
    public Poi Poi { get; set; } = null!;
    public Language Language { get; set; } = null!;
}
