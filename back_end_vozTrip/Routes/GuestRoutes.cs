using Microsoft.EntityFrameworkCore;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class GuestRoutes
{
    public static void Map(WebApplication app)
    {
        // GET /api/languages
        app.MapGet("/api/languages", async (AppDbContext db) =>
        {
            var languages = await db.Languages
                .Where(l => l.IsActive)
                .Select(l => new { l.LanguageId, l.LanguageCode, l.LanguageName })
                .ToListAsync();
            return Results.Ok(languages);
        });

        // GET /api/pois — tất cả POI active (mobile dùng để hiện trên bản đồ)
        app.MapGet("/api/pois", async (AppDbContext db) =>
        {
            var pois = await db.Pois
                .Where(p => p.IsActive)
                .Select(p => new
                {
                    p.PoiId, p.PoiName, p.Latitude, p.Longitude, p.TriggerRadius,
                    shopName = p.Seller.User.FullName ?? p.Seller.ShopName
                })
                .ToListAsync();
            return Results.Ok(pois);
        });

        // GET /api/pois/{id}?languageId=... — chi tiết POI kèm media + localization
        app.MapGet("/api/pois/{id}", async (string id, string? languageId, AppDbContext db) =>
        {
            var poi = await db.Pois
                .Where(p => p.PoiId == id && p.IsActive)
                .Include(p => p.Zone)
                .Include(p => p.Media.OrderBy(m => m.SortOrder))
                .Include(p => p.Localizations.Where(l => languageId == null || l.LanguageId == languageId))
                    .ThenInclude(l => l.Language)
                .FirstOrDefaultAsync();

            if (poi is null) return Results.NotFound();

            return Results.Ok(new
            {
                poi.PoiId, poi.PoiName, poi.Latitude, poi.Longitude, poi.TriggerRadius,
                zoneName = poi.Zone?.ZoneName,
                media = poi.Media.Select(m => new { m.MediaId, m.MediaType, m.MediaUrl, m.SortOrder }),
                localizations = poi.Localizations.Select(l => new
                {
                    l.LanguageId,
                    languageCode = l.Language.LanguageCode,
                    l.Title, l.Description, l.AudioUrl, l.AudioDuration
                })
            });
        });

        // GET /api/pois/{id}/questions?languageId=...
        app.MapGet("/api/pois/{id}/questions", async (string id, string? languageId, AppDbContext db) =>
        {
            var questions = await db.Questions
                .Where(q => q.PoiId == id && q.IsActive
                    && (languageId == null || q.LanguageId == languageId))
                .Include(q => q.Answer)
                .OrderBy(q => q.SortOrder)
                .Select(q => new
                {
                    q.QuestionId, q.QuestionText,
                    answer = q.Answer == null ? null : new
                    {
                        q.Answer.AnswerText,
                        q.Answer.AudioUrl
                    }
                })
                .ToListAsync();
            return Results.Ok(questions);
        });

        // POST /api/sessions — mobile gửi sessionId tự sinh, upsert
        app.MapPost("/api/sessions", async (SessionRequest req, AppDbContext db) =>
        {
            var session = await db.GuestSessions.FindAsync(req.SessionId);
            if (session is null)
            {
                session = new GuestSession
                {
                    SessionId  = req.SessionId,
                    LanguageId = req.LanguageId
                };
                db.GuestSessions.Add(session);
                await db.SaveChangesAsync();
            }
            return Results.Ok(new { session.SessionId, session.StartedAt });
        });

        // POST /api/visitlogs — ghi lại khi GPS trigger POI
        app.MapPost("/api/visitlogs", async (VisitLogRequest req, AppDbContext db) =>
        {
            var log = new VisitLog
            {
                SessionId   = req.SessionId,
                PoiId       = req.PoiId,
                TriggeredAt = DateTime.UtcNow
            };
            db.VisitLogs.Add(log);
            await db.SaveChangesAsync();
            return Results.Ok(new { log.LogId });
        });
    }
}

record SessionRequest(string SessionId, string? LanguageId);
record VisitLogRequest(string SessionId, string PoiId);
