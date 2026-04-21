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

        // POST /api/visitlogs — F07 (ghi lượt thăm, enqueue → batch write)
        app.MapPost("/api/visitlogs", (VisitLogRequest req, VisitLogQueue queue) =>
        {
            var log = new VisitLog
            {
                SessionId   = req.SessionId,
                PoiId       = req.PoiId,
                TriggeredAt = DateTime.UtcNow
            };
            queue.TryEnqueue(log);
            return Results.Accepted();
        })
        .WithFeatureFlag(f => f.Features.Guest.GpsVisitLog.VisitLog.Enabled);

        // POST /api/webhook/sepay — SePay gọi khi có tiền vào
        app.MapPost("/api/webhook/sepay", async (SepayWebhookPayload payload, AppDbContext db, HttpContext ctx, IConfiguration config) =>
        {
            // Verify API key từ SePay
            var secret = config["SePay:WebhookSecret"];
            if (!string.IsNullOrEmpty(secret))
            {
                var auth = ctx.Request.Headers["Authorization"].ToString();
                if (auth != $"Apikey {secret}")
                    return Results.Unauthorized();
            }
            // Tìm "VOZTRIP XXXXXXXX" trong nội dung chuyển khoản
            var content = (payload.Content ?? payload.Description ?? "").ToUpper();
            var match = System.Text.RegularExpressions.Regex.Match(content, @"VOZTRIP\s+([A-F0-9]{8})");
            if (!match.Success)
                return Results.Ok(new { matched = false, reason = "no VOZTRIP code found" });

            var shortCode = match.Groups[1].Value.ToLower(); // 8 ký tự đầu của deviceId

            // Tìm device theo 8 ký tự đầu của deviceId
            var device = await db.DeviceRecords
                .FirstOrDefaultAsync(d => d.DeviceId.StartsWith(shortCode));

            if (device is null)
                return Results.Ok(new { matched = false, reason = "device not found" });

            if (!device.Approved)
            {
                device.Approved   = true;
                device.ApprovedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }

            return Results.Ok(new { matched = true, deviceId = device.DeviceId, approved = true });
        });

        // GET /api/devices/{id}/status — kiểm tra thiết bị đã được duyệt chưa
        app.MapGet("/api/devices/{id}/status", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.Ok(new { approved = false });
            return Results.Ok(new { approved = device.Approved });
        });

        // POST /api/devices/join — đăng ký thiết bị lần đầu
        app.MapPost("/api/devices/join", async (DeviceJoinRequest req, AppDbContext db) =>
        {
            var existing = await db.DeviceRecords.FindAsync(req.DeviceId);
            if (existing is not null)
            {
                existing.LastSeenAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.Ok(new { alreadyJoined = true, joinedAt = existing.JoinedAt });
            }

            var device = new DeviceRecord
            {
                DeviceId   = req.DeviceId,
                Platform   = req.Platform,
                OsVersion  = req.OsVersion ?? "",
                JoinedAt   = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow,
            };
            db.DeviceRecords.Add(device);
            await db.SaveChangesAsync();
            return Results.Ok(new { alreadyJoined = false, joinedAt = device.JoinedAt });
        })
        .WithFeatureFlag(f => f.Features.Guest.UsageLog.Enabled);

        // POST /api/feedback — gửi báo cáo / góp ý
        app.MapPost("/api/feedback", async (FeedbackRequest req, AppDbContext db) =>
        {
            var validTypes = new[] { "bug", "suggestion", "content", "other" };
            var type = validTypes.Contains(req.Type) ? req.Type : "other";

            if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Length > 1000)
                return Results.BadRequest(new { message = "Message không hợp lệ (1–1000 ký tự)" });

            var report = new FeedbackReport
            {
                SessionId = req.SessionId,
                DeviceId  = req.DeviceId,
                Type      = type,
                Message   = req.Message.Trim(),
                PoiId     = req.PoiId,
                Platform  = req.Platform ?? "web",
                Lang      = req.Lang ?? "vi",
            };
            db.FeedbackReports.Add(report);
            await db.SaveChangesAsync();
            return Results.Ok(new { report.ReportId });
        });

        // POST /api/usagelogs — ghi sự kiện dùng app
        app.MapPost("/api/usagelogs", async (UsageLogRequest req, AppDbContext db) =>
        {
            var validEvents = new[] { "qr_scan", "app_open", "device_join" };
            if (!validEvents.Contains(req.EventType))
                return Results.BadRequest(new { message = "EventType không hợp lệ" });

            var log = new UsageLog
            {
                SessionId = req.SessionId,
                EventType = req.EventType,
                CreatedAt = DateTime.UtcNow
            };
            db.UsageLogs.Add(log);
            await db.SaveChangesAsync();
            return Results.Ok(new { log.LogId });
        })
        .WithFeatureFlag(f => f.Features.Guest.UsageLog.Enabled);
    }
}

record SepayWebhookPayload(
    int? Id,
    string? Gateway,
    string? TransactionDate,
    string? AccountNumber,
    string? Content,
    string? Description,
    string? TransactionContent,
    string? Code,
    string? TransferType,
    decimal? TransferAmount,
    string? ReferenceCode
);
record FeedbackRequest(string? SessionId, string? DeviceId, string Type, string Message, string? PoiId, string? Platform, string? Lang);
record SessionRequest(string SessionId, string? LanguageId);
record VisitLogRequest(string SessionId, string PoiId);
record UsageLogRequest(string? SessionId, string EventType);
record DeviceJoinRequest(string DeviceId, string Platform, string? OsVersion);
