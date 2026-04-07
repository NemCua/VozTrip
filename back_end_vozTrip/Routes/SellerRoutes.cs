using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class SellerRoutes
{
    public static void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/seller").RequireAuthorization(policy =>
            policy.RequireRole("seller"));

        // ─── POI ────────────────────────────────────────────

        // GET /api/seller/pois
        group.MapGet("/pois", async (AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var pois = await db.Pois
                .Where(p => p.SellerId == sellerId)
                .Include(p => p.Zone)
                .Include(p => p.Localizations)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.PoiId, p.PoiName, p.Latitude, p.Longitude,
                    p.TriggerRadius, p.IsActive, p.CreatedAt,
                    zoneName = p.Zone != null ? p.Zone.ZoneName : null,
                    localizationCount = p.Localizations.Count
                })
                .ToListAsync();
            return Results.Ok(pois);
        });

        // POST /api/seller/pois
        group.MapPost("/pois", async (CreatePoiRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi = new Poi
            {
                SellerId      = sellerId,
                ZoneId        = req.ZoneId,
                PoiName       = req.PoiName,
                Latitude      = req.Latitude,
                Longitude     = req.Longitude,
                TriggerRadius = req.TriggerRadius ?? 10.0
            };
            db.Pois.Add(poi);
            await db.SaveChangesAsync();
            return Results.Ok(new { poi.PoiId });
        });

        // PUT /api/seller/pois/{id}
        group.MapPut("/pois/{id}", async (string id, CreatePoiRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            poi.PoiName       = req.PoiName;
            poi.ZoneId        = req.ZoneId;
            poi.Latitude      = req.Latitude;
            poi.Longitude     = req.Longitude;
            poi.TriggerRadius = req.TriggerRadius ?? poi.TriggerRadius;
            poi.IsActive      = req.IsActive ?? poi.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // DELETE /api/seller/pois/{id}
        group.MapDelete("/pois/{id}", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();
            db.Pois.Remove(poi);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // ─── LOCALIZATION ────────────────────────────────────

        // GET /api/seller/pois/{id}/localizations
        group.MapGet("/pois/{id}/localizations", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var locs = await db.PoiLocalizations
                .Where(l => l.PoiId == id)
                .Include(l => l.Language)
                .Select(l => new
                {
                    l.LocalizationId, l.LanguageId,
                    languageCode = l.Language.LanguageCode,
                    languageName = l.Language.LanguageName,
                    l.Title, l.Description, l.AudioUrl, l.AudioDuration, l.IsAutoTranslated
                })
                .ToListAsync();
            return Results.Ok(locs);
        });

        // PUT /api/seller/pois/{id}/localizations/{languageId} — upsert
        group.MapPut("/pois/{id}/localizations/{languageId}", async (
            string id, string languageId, UpsertLocalizationRequest req,
            AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var loc = await db.PoiLocalizations
                .FirstOrDefaultAsync(l => l.PoiId == id && l.LanguageId == languageId);

            if (loc is null)
            {
                loc = new PoiLocalization { PoiId = id, LanguageId = languageId };
                db.PoiLocalizations.Add(loc);
            }

            loc.Title            = req.Title;
            loc.Description      = req.Description;
            loc.AudioUrl         = req.AudioUrl;
            loc.AudioPublicId    = req.AudioPublicId;
            loc.AudioDuration    = req.AudioDuration;
            loc.IsAutoTranslated = false;

            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // DELETE /api/seller/pois/{id}/localizations/{languageId}
        group.MapDelete("/pois/{id}/localizations/{languageId}", async (
            string id, string languageId, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var loc = await db.PoiLocalizations
                .Include(l => l.Poi)
                .FirstOrDefaultAsync(l => l.PoiId == id && l.LanguageId == languageId && l.Poi.SellerId == sellerId);
            if (loc is null) return Results.NotFound();
            db.PoiLocalizations.Remove(loc);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // ─── MEDIA ───────────────────────────────────────────

        // GET /api/seller/pois/{id}/media
        group.MapGet("/pois/{id}/media", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var media = await db.PoiMedia
                .Where(m => m.PoiId == id)
                .OrderBy(m => m.SortOrder)
                .ToListAsync();
            return Results.Ok(media);
        });

        // POST /api/seller/pois/{id}/media
        group.MapPost("/pois/{id}/media", async (string id, AddMediaRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var media = new PoiMedia
            {
                PoiId     = id,
                MediaType = req.MediaType,
                MediaUrl  = req.MediaUrl,
                PublicId  = req.PublicId ?? string.Empty,
                SortOrder = req.SortOrder ?? 0
            };
            db.PoiMedia.Add(media);
            await db.SaveChangesAsync();
            return Results.Ok(new { media.MediaId });
        });

        // DELETE /api/seller/media/{mediaId}
        group.MapDelete("/media/{mediaId}", async (string mediaId, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var media = await db.PoiMedia
                .Include(m => m.Poi)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId && m.Poi.SellerId == sellerId);
            if (media is null) return Results.NotFound();
            db.PoiMedia.Remove(media);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // ─── QUESTIONS & ANSWERS ─────────────────────────────

        // GET /api/seller/pois/{id}/questions
        group.MapGet("/pois/{id}/questions", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var questions = await db.Questions
                .Where(q => q.PoiId == id)
                .Include(q => q.Language)
                .Include(q => q.Answer)
                .OrderBy(q => q.SortOrder)
                .Select(q => new
                {
                    q.QuestionId, q.LanguageId,
                    languageCode = q.Language.LanguageCode,
                    q.QuestionText, q.SortOrder, q.IsActive,
                    answer = q.Answer == null ? null : new
                    {
                        q.Answer.AnswerId,
                        q.Answer.AnswerText,
                        q.Answer.AudioUrl
                    }
                })
                .ToListAsync();
            return Results.Ok(questions);
        });

        // POST /api/seller/pois/{id}/questions
        group.MapPost("/pois/{id}/questions", async (string id, CreateQuestionRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var question = new Question
            {
                PoiId        = id,
                LanguageId   = req.LanguageId,
                QuestionText = req.QuestionText,
                SortOrder    = req.SortOrder ?? 0
            };
            db.Questions.Add(question);
            await db.SaveChangesAsync();
            return Results.Ok(new { question.QuestionId });
        });

        // PUT /api/seller/questions/{questionId}/answer — upsert answer
        group.MapPut("/questions/{questionId}/answer", async (
            string questionId, UpsertAnswerRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var question = await db.Questions
                .Include(q => q.Poi)
                .Include(q => q.Answer)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId && q.Poi.SellerId == sellerId);
            if (question is null) return Results.NotFound();

            if (question.Answer is null)
            {
                var answer = new Answer
                {
                    QuestionId  = questionId,
                    PoiId       = question.PoiId,
                    LanguageId  = question.LanguageId,
                    AnswerText  = req.AnswerText,
                    AudioUrl    = req.AudioUrl,
                    AudioPublicId = req.AudioPublicId
                };
                db.Answers.Add(answer);
            }
            else
            {
                question.Answer.AnswerText   = req.AnswerText;
                question.Answer.AudioUrl     = req.AudioUrl;
                question.Answer.AudioPublicId = req.AudioPublicId;
            }
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // DELETE /api/seller/questions/{questionId}
        group.MapDelete("/questions/{questionId}", async (string questionId, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var question = await db.Questions
                .Include(q => q.Poi)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId && q.Poi.SellerId == sellerId);
            if (question is null) return Results.NotFound();
            db.Questions.Remove(question);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}

record CreatePoiRequest(
    string PoiName,
    double Latitude,
    double Longitude,
    string? ZoneId,
    double? TriggerRadius,
    bool? IsActive
);

record UpsertLocalizationRequest(
    string? Title,
    string? Description,
    string? AudioUrl,
    string? AudioPublicId,
    int? AudioDuration
);

record AddMediaRequest(
    string MediaType,
    string MediaUrl,
    string? PublicId,
    int? SortOrder
);

record CreateQuestionRequest(
    string LanguageId,
    string QuestionText,
    int? SortOrder
);

record UpsertAnswerRequest(
    string AnswerText,
    string? AudioUrl,
    string? AudioPublicId
);
