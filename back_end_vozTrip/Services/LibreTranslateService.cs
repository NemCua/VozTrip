using System.Text;
using System.Text.Json;

namespace back_end_vozTrip.Services;

public class LibreTranslateService
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public LibreTranslateService(IConfiguration config, HttpClient http)
    {
        _http    = http;
        _baseUrl = config["LibreTranslate:Url"] ?? "https://libretranslate.com";
        _apiKey  = config["LibreTranslate:ApiKey"] ?? "";
    }

    // Dịch một đoạn text từ sourceLang sang targetLang
    // sourceLang / targetLang là ISO code: vi, en, zh, ko, ja
    public async Task<string?> TranslateAsync(string text, string sourceLang, string targetLang)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        if (sourceLang == targetLang) return text;

        var payload = new
        {
            q      = text,
            source = sourceLang,
            target = targetLang,
            api_key = _apiKey
        };

        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await _http.PostAsync($"{_baseUrl}/translate", content);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("translatedText").GetString();
        }
        catch
        {
            return null;
        }
    }

    // Dịch title + description sang nhiều ngôn ngữ cùng lúc
    public async Task<Dictionary<string, (string? Title, string? Description)>> TranslateToManyAsync(
        string? title, string? description, string sourceLang, IEnumerable<string> targetLangs)
    {
        var result = new Dictionary<string, (string? Title, string? Description)>();
        var tasks  = targetLangs.Select(async lang =>
        {
            var translatedTitle = title != null
                ? await TranslateAsync(title, sourceLang, lang)
                : null;
            var translatedDesc = description != null
                ? await TranslateAsync(description, sourceLang, lang)
                : null;
            result[lang] = (translatedTitle, translatedDesc);
        });
        await Task.WhenAll(tasks);
        return result;
    }
}
