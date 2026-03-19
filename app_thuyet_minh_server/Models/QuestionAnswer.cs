// Models/QuestionAnswer.cs
namespace app_thuyet_minh_server.Models;

public class QuestionAnswer
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public string Language { get; set; } = "vi";
    public int? AudioId { get; set; }

    // Navigation
    public Question Question { get; set; } = null!;
    public Audio? Audio { get; set; }
}