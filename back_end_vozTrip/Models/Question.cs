namespace back_end_vozTrip.Models;

public class Question
{
    public string QuestionId { get; set; } = Guid.NewGuid().ToString();
    public string PoiId { get; set; } = string.Empty;
    public string LanguageId { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public Poi Poi { get; set; } = null!;
    public Language Language { get; set; } = null!;
    public Answer? Answer { get; set; }
}
