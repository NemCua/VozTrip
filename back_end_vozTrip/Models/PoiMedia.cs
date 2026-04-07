namespace back_end_vozTrip.Models;

public class PoiMedia
{
    public string MediaId { get; set; } = Guid.NewGuid().ToString();
    public string PoiId { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty; // "image" | "video"
    public string MediaUrl { get; set; } = string.Empty;  // Cloudinary URL
    public string PublicId { get; set; } = string.Empty;  // Cloudinary public_id de xoa
    public int SortOrder { get; set; } = 0;

    // Navigation
    public Poi Poi { get; set; } = null!;
}
