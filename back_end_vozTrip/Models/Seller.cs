namespace back_end_vozTrip.Models;

public class Seller
{
    public string SellerId { get; set; } = string.Empty; // FK -> User.UserId
    public string ShopName { get; set; } = string.Empty;
    public string? ShopLogo { get; set; }
    public string? ContactPhone { get; set; }
    public string? Description { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; } // FK -> User.UserId
    public string Plan { get; set; } = "free"; // "free" | "vip"
    public DateTime? PlanUpgradedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public User? ApprovedByUser { get; set; }
    public ICollection<Poi> Pois { get; set; } = [];
}
