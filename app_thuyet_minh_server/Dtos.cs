namespace app_thuyet_minh_server.dto;

public record LoginDto(string Email, string Password);

public class CreateUserDto
{
    public string Name { get; set; }
    public string? Phone { get; set; }
    public string Email { get; set; }
    public string PassHash { get; set; } // plain text

    public string Role { get; set; }
}
public class RegisterDto
{
    public string Name { get; set; }
    public string? Phone { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public string PassHash { get; set; } // plain text

}
public class CreatePoiDto
{
    public int     SellerId             { get; set; }
    public string  Name                 { get; set; } = string.Empty;
    public string? Description          { get; set; }
    public decimal Latitude             { get; set; }
    public decimal Longitude            { get; set; }
    public float   TriggerRadiusMeters  { get; set; } = 5f;
}
// dto/CreateSellerDto.cs


public class CreateSellerDto
{
    public int     OwnerId     { get; set; }
    public string  ShopName    { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address     { get; set; }
}
public class CreateAudioDto
{
    public string  AudioUrl    { get; set; } = string.Empty;
    public int?    DurationSec { get; set; }
    public string? SourceType  { get; set; } = "upload"; // upload / tts
}
public class CreateMediaDto
{
    public int    PoiId { get; set; }
    public string Url   { get; set; } = string.Empty;
    public string Type  { get; set; } = "image"; // image / video
}
public class CreateQuestionDto
{
    public int    PoiId        { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int    SortOrder    { get; set; } = 0;
}
// dto/CreateQuestionAnswerDto.cs


public class CreateQuestionAnswerDto
{
    public int     QuestionId { get; set; }
    public string  AnswerText { get; set; } = string.Empty;
    public string  Language   { get; set; } = "vi";
    public int?    AudioId    { get; set; }
}
// dto/CreateNarrationDto.cs


public class CreateNarrationDto
{
    public int     PoiId    { get; set; }
    public string  Text     { get; set; } = string.Empty;
    public string  Language { get; set; } = "vi";
    public int?    AudioId  { get; set; }
}