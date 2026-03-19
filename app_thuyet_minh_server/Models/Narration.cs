// Models/Narration.cs
namespace app_thuyet_minh_server.Models;

public class Narration
{
    public int Id { get; set; }
    public int PoiId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Language { get; set; } = "vi";
    public int? AudioId { get; set; }
    public int Status { get; set; } = 1;

    
    public Poi Poi { get; set; } = null!;
    public Audio? Audio { get; set; }
}