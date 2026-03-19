// Models/Audio.cs
namespace app_thuyet_minh_server.Models;

public class Audio
{
    public int Id { get; set; }
    public string AudioUrl { get; set; } = string.Empty;
    public int? DurationSec { get; set; }
    public string? SourceType { get; set; } 

    // Navigation
    public ICollection<Narration> Narrations { get; set; } = [];
    public ICollection<QuestionAnswer> QuestionAnswers { get; set; } = [];
}