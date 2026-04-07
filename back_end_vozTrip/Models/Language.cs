namespace back_end_vozTrip.Models;

public class Language
{
    public string LanguageId { get; set; } = Guid.NewGuid().ToString();
    public string LanguageCode { get; set; } = string.Empty; // "en" | "zh" | "ko" | "ja"
    public string? LanguageName { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<PoiLocalization> PoiLocalizations { get; set; } = [];
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<Answer> Answers { get; set; } = [];
    public ICollection<GuestSession> GuestSessions { get; set; } = [];
}
