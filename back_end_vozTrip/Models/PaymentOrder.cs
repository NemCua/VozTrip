namespace back_end_vozTrip.Models;

public class PaymentOrder
{
    public string OrderId { get; set; } = Guid.NewGuid().ToString();
    public string SellerId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "seller_vip" | "poi_boost"
    public string? PoiId { get; set; }
    public long Amount { get; set; }
    public string OrderCode { get; set; } = string.Empty; // unique ref in transfer description
    public string Status { get; set; } = "pending"; // "pending" | "paid" | "expired"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    // Navigation
    public Seller Seller { get; set; } = null!;
    public Poi? Poi { get; set; }
}
