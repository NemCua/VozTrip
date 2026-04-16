using Microsoft.EntityFrameworkCore;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class GuestRoutes
{
    public static void Map(WebApplication app)
    {
        // GET /api/languages — F03
        app.MapGet("/api/languages", async (AppDbContext db) =>
        {
            var languages = await db.Languages
                .Where(l => l.IsActive)
                .Select(l => new { l.LanguageId, l.LanguageCode, l.LanguageName })
                .ToListAsync();
            return Results.Ok(languages);
        })
        .WithFeatureFlag(f => f.Features.Guest.LanguagePicker.Enabled);

        // GET /api/pois?languageId=... — F04
        app.MapGet("/api/pois", async (string? languageId, AppDbContext db, FeaturesConfig features) =>
        {
            var pois = await db.Pois
                .Where(p => p.IsActive)
                .Select(p => new
                {
                    p.PoiId, p.PoiName, p.Latitude, p.Longitude, p.TriggerRadius,
                    shopName = p.Seller.User.FullName ?? p.Seller.ShopName,
                    thumbnailUrl = features.Features.Guest.ExplorePois.Thumbnail.Enabled
                        ? p.Media.OrderBy(m => m.SortOrder).Select(m => m.MediaUrl).FirstOrDefault()
                        : null,
                    localizedName = (features.Features.Guest.ExplorePois.LocalizedName.Enabled && languageId != null)
                        ? p.Localizations.Where(l => l.LanguageId == languageId).Select(l => l.Title).FirstOrDefault()
                        : null
                })
                .ToListAsync();
            return Results.Ok(pois);
        })
        .WithFeatureFlag(f => f.Features.Guest.ExplorePois.Enabled);

        // GET /api/pois/{id}?languageId=... — F05
        app.MapGet("/api/pois/{id}", async (string id, string? languageId, AppDbContext db, FeaturesConfig features) =>
        {
            IQueryable<Poi> query = db.Pois.Where(p => p.PoiId == id && p.IsActive).Include(p => p.Zone);

            if (features.Features.Guest.PoiDetail.Media.Enabled)
                query = query.Include(p => p.Media.OrderBy(m => m.SortOrder));

            if (features.Features.Guest.PoiDetail.Localization.Enabled)
                query = query
                    .Include(p => p.Localizations.Where(l => languageId == null || l.LanguageId == languageId))
                    .ThenInclude(l => l.Language);

            var poi = await query.FirstOrDefaultAsync();
            if (poi is null) return Results.NotFound();

            return Results.Ok(new
            {
                poi.PoiId, poi.PoiName, poi.Latitude, poi.Longitude, poi.TriggerRadius,
                zoneName = poi.Zone?.ZoneName,
                media = features.Features.Guest.PoiDetail.Media.Enabled
                    ? poi.Media.Select(m => new { m.MediaId, m.MediaType, m.MediaUrl, m.SortOrder })
                    : [],
                localizations = features.Features.Guest.PoiDetail.Localization.Enabled
                    ? poi.Localizations.Select(l => new
                    {
                        l.LanguageId,
                        languageCode = l.Language.LanguageCode,
                        l.Title, l.Description,
                        audioUrl     = features.Features.Guest.PoiDetail.Audio.Enabled ? l.AudioUrl : null,
                        audioDuration = features.Features.Guest.PoiDetail.Audio.Enabled ? l.AudioDuration : null
                    })
                    : []
            });
        })
        .WithFeatureFlag(f => f.Features.Guest.PoiDetail.Enabled);

        // GET /api/pois/{id}/questions?languageId=... — F06
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
        })
        .WithFeatureFlag(f => f.Features.Guest.Qna.Enabled);

        // POST /api/sessions — F07 (tạo session)
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
        })
        .WithFeatureFlag(f => f.Features.Guest.GpsVisitLog.Session.Enabled);

        // POST /api/visitlogs — F07 (ghi lượt thăm)
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
        })
        .WithFeatureFlag(f => f.Features.Guest.GpsVisitLog.VisitLog.Enabled);
    }
}

record SessionRequest(string SessionId, string? LanguageId);
record VisitLogRequest(string SessionId, string PoiId);
