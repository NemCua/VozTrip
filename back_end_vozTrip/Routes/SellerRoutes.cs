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

        // POST /api/seller/pois/{id}/localizations/{languageId}/audio — upload audio lên Cloudinary
        group.MapPost("/pois/{id}/localizations/{languageId}/audio", async (
            string id, string languageId, IFormFile file,
            AppDbContext db, HttpContext ctx, CloudinaryService cloudinary) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var contentType = file.ContentType.ToLower();
            if (!contentType.StartsWith("audio/"))
                return Results.BadRequest(new { message = "Chỉ chấp nhận file audio" });

            // Xóa audio cũ nếu có
            var existing = await db.PoiLocalizations
                .FirstOrDefaultAsync(l => l.PoiId == id && l.LanguageId == languageId);
            if (existing?.AudioPublicId != null)
                await cloudinary.DeleteAsync(existing.AudioPublicId);

            var uploaded = await cloudinary.UploadAudioAsync(file, sellerId);

            if (existing is null)
            {
                existing = new back_end_vozTrip.Models.PoiLocalization { PoiId = id, LanguageId = languageId };
                db.PoiLocalizations.Add(existing);
            }
            existing.AudioUrl      = uploaded.Url;
            existing.AudioPublicId = uploaded.PublicId;

            await db.SaveChangesAsync();
            return Results.Ok(new { audioUrl = uploaded.Url });
        }).DisableAntiforgery();

        // DELETE /api/seller/pois/{id}/localizations/{languageId}
        group.MapDelete("/pois/{id}/localizations/{languageId}", async (
            string id, string languageId, AppDbContext db, HttpContext ctx, CloudinaryService cloudinary) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var loc = await db.PoiLocalizations
                .Include(l => l.Poi)
                .FirstOrDefaultAsync(l => l.PoiId == id && l.LanguageId == languageId && l.Poi.SellerId == sellerId);
            if (loc is null) return Results.NotFound();

            if (!string.IsNullOrEmpty(loc.AudioPublicId))
                await cloudinary.DeleteAsync(loc.AudioPublicId);

            db.PoiLocalizations.Remove(loc);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // POST /api/seller/pois/{id}/localizations/translate
        // Tự động dịch từ 1 ngôn ngữ gốc sang tất cả ngôn ngữ còn thiếu
        group.MapPost("/pois/{id}/localizations/translate", async (
            string id, TranslateRequest req,
            AppDbContext db, HttpContext ctx, LibreTranslateService translator) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi = await db.Pois
                .Include(p => p.Localizations)
                .FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            // Lấy localization gốc (nguồn dịch)
            var source = poi.Localizations.FirstOrDefault(l => l.LanguageId == req.SourceLanguageId);
            if (source is null)
                return Results.BadRequest(new { message = "Chưa có nội dung ở ngôn ngữ nguồn" });

            if (string.IsNullOrWhiteSpace(source.Title) && string.IsNullOrWhiteSpace(source.Description))
                return Results.BadRequest(new { message = "Nội dung nguồn trống, không có gì để dịch" });

            // Lấy tất cả ngôn ngữ active, loại trừ ngôn ngữ nguồn và những ngôn ngữ đã có nội dung (không auto-translated)
            var allLanguages = await db.Languages
                .Where(l => l.IsActive && l.LanguageId != req.SourceLanguageId)
                .ToListAsync();

            var existingIds = poi.Localizations
                .Where(l => l.LanguageId != req.SourceLanguageId && !l.IsAutoTranslated)
                .Select(l => l.LanguageId)
                .ToHashSet();

            var targetLanguages = allLanguages.Where(l => !existingIds.Contains(l.LanguageId)).ToList();
            if (targetLanguages.Count == 0)
                return Results.Ok(new { message = "Tất cả ngôn ngữ đã có nội dung", translated = 0 });

            // Lấy language code của nguồn
            var sourceLang = await db.Languages.FindAsync(req.SourceLanguageId);
            if (sourceLang is null) return Results.BadRequest(new { message = "Ngôn ngữ nguồn không hợp lệ" });

            // Dịch song song
            var targetCodes = targetLanguages.Select(l => l.LanguageCode).ToList();
            var translations = await translator.TranslateToManyAsync(
                source.Title, source.Description, sourceLang.LanguageCode, targetCodes);

            int count = 0;
            foreach (var lang in targetLanguages)
            {
                if (!translations.TryGetValue(lang.LanguageCode, out var t)) continue;
                if (t.Title is null && t.Description is null) continue;

                var existing = poi.Localizations.FirstOrDefault(l => l.LanguageId == lang.LanguageId);
                if (existing is null)
                {
                    existing = new PoiLocalization { PoiId = id, LanguageId = lang.LanguageId };
                    db.PoiLocalizations.Add(existing);
                    poi.Localizations.Add(existing);
                }
                existing.Title            = t.Title ?? existing.Title;
                existing.Description      = t.Description ?? existing.Description;
                existing.IsAutoTranslated = true;
                count++;
            }

            await db.SaveChangesAsync();
            return Results.Ok(new { message = $"Đã dịch sang {count} ngôn ngữ", translated = count });
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

        // POST /api/seller/pois/{id}/media/upload — upload ảnh hoặc video lên Cloudinary
        group.MapPost("/pois/{id}/media/upload", async (
            string id, IFormFile file, AppDbContext db, HttpContext ctx, CloudinaryService cloudinary) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var ownsPoi = await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (!ownsPoi) return Results.NotFound();

            var contentType = file.ContentType.ToLower();
            UploadResult uploaded;
            string mediaType;

            if (contentType.StartsWith("video/"))
            {
                uploaded = await cloudinary.UploadVideoAsync(file, sellerId);
                mediaType = "video";
            }
            else if (contentType.StartsWith("image/"))
            {
                uploaded = await cloudinary.UploadImageAsync(file, sellerId);
                mediaType = "image";
            }
            else
            {
                return Results.BadRequest(new { message = "Chỉ chấp nhận ảnh hoặc video" });
            }

            var sortOrder = await db.PoiMedia.CountAsync(m => m.PoiId == id);
            var media = new PoiMedia
            {
                PoiId     = id,
                MediaType = mediaType,
                MediaUrl  = uploaded.Url,
                PublicId  = uploaded.PublicId,
                SortOrder = sortOrder
            };
            db.PoiMedia.Add(media);
            await db.SaveChangesAsync();

            return Results.Ok(new { media.MediaId, media.MediaUrl, media.MediaType });
        }).DisableAntiforgery();

        // DELETE /api/seller/media/{mediaId}
        group.MapDelete("/media/{mediaId}", async (
            string mediaId, AppDbContext db, HttpContext ctx, CloudinaryService cloudinary) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var media = await db.PoiMedia
                .Include(m => m.Poi)
                .FirstOrDefaultAsync(m => m.MediaId == mediaId && m.Poi.SellerId == sellerId);
            if (media is null) return Results.NotFound();

            if (!string.IsNullOrEmpty(media.PublicId))
            {
                var resourceType = media.MediaType == "video"
                    ? CloudinaryDotNet.Actions.ResourceType.Video
                    : CloudinaryDotNet.Actions.ResourceType.Image;
                await cloudinary.DeleteAsync(media.PublicId, resourceType);
            }

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

record TranslateRequest(string SourceLanguageId);
