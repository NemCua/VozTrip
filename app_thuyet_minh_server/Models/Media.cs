// Models/Media.cs
namespace app_thuyet_minh_server.Models;

public class Media
{
    public int Id { get; set; }
    public int PoiId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

   
    public Poi Poi { get; set; } = null!;
}