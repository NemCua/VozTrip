// Models/Seller.cs
namespace app_thuyet_minh_server.Models;

public class Seller
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public bool Verified { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User Owner { get; set; } = null!;
    public ICollection<Poi> Pois { get; set; } = [];
}