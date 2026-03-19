// Models/Question.cs
namespace app_thuyet_minh_server.Models;

public class Question
{
    public int Id { get; set; }
    public int PoiId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public int Status { get; set; } = 1;

    // Navigation
    public Poi Poi { get; set; } = null!;
    public ICollection<QuestionAnswer> Answers { get; set; } = [];
}