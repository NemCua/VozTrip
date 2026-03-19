// Models/Poi.cs
namespace app_thuyet_minh_server.Models;

public class Poi
{
    public int Id { get; set; }
    public int SellerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public float TriggerRadiusMeters { get; set; } = 5f;
    public int Status { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Seller Seller { get; set; } = null!;
    public ICollection<Media> Medias { get; set; } = [];
    public ICollection<Narration> Narrations { get; set; } = [];
    public ICollection<Question> Questions { get; set; } = [];
}