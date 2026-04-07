namespace back_end_vozTrip.Models;

public class Answer
{
    public string AnswerId { get; set; } = Guid.NewGuid().ToString();
    public string QuestionId { get; set; } = string.Empty;
    public string PoiId { get; set; } = string.Empty;
    public string LanguageId { get; set; } = string.Empty;
    public string AnswerText { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }      // Cloudinary URL
    public string? AudioPublicId { get; set; } // Cloudinary public_id de xoa

    // Navigation
    public Question Question { get; set; } = null!;
    public Poi Poi { get; set; } = null!;
    public Language Language { get; set; } = null!;
}
