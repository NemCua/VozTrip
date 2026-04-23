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
                    isFeatured = p.IsFeatured && p.FeaturedUntil > DateTime.UtcNow,
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

        // POST /api/gps/trigger — resolve POIs in range, enqueue visit logs, return prioritised list
        app.MapPost("/api/gps/trigger", async (GpsTriggerRequest req, GpsTriggerService svc, VisitLogQueue queue) =>
        {
            var already = req.AlreadyTriggered?.ToHashSet() ?? new HashSet<string>();
            var results = await svc.ResolveTriggerAsync(req.Lat, req.Lon, req.LanguageId, already);

            foreach (var r in results)
                queue.TryEnqueue(new VisitLog
                {
                    SessionId   = req.SessionId,
                    PoiId       = r.PoiId,
                    TriggeredAt = DateTime.UtcNow
                });

            return Results.Ok(results);
        })
        .WithFeatureFlag(f => f.Features.Guest.GpsVisitLog.Enabled);

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

        // POST /api/webhook/sepay — SePay gọi khi có tiền vào (dùng chung cho du khách và seller)
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

            if (payload.TransferType != "in")
                return Results.Ok(new { success = true });

            var content = (payload.Content ?? payload.Description ?? "").ToUpper();

            // ── Seller: order code có dạng VOZ + 9 chữ số ─────────────────
            var sellerMatch = System.Text.RegularExpressions.Regex.Match(content, @"\bVOZ\d{9}\b");
            if (sellerMatch.Success)
            {
                var orderCode = sellerMatch.Value; // uppercase đã match
                // OrderCode trong DB được tạo uppercase, so sánh trực tiếp
                var order = await db.PaymentOrders
                    .Where(o => o.Status == "pending" && o.OrderCode == orderCode)
                    .FirstOrDefaultAsync();

                if (order is not null && payload.TransferAmount >= order.Amount)
                {
                    order.Status = "paid";
                    order.PaidAt = DateTime.UtcNow;

                    if (order.Type == "seller_vip")
                    {
                        var seller = await db.Sellers.FindAsync(order.SellerId);
                        if (seller is not null)
                        {
                            seller.Plan           = "vip";
                            seller.PlanUpgradedAt = DateTime.UtcNow;
                        }
                    }
                    else if (order.Type == "poi_boost" && order.PoiId is not null)
                    {
                        var poi = await db.Pois.FindAsync(order.PoiId);
                        if (poi is not null)
                        {
                            var boostDays = int.Parse(Environment.GetEnvironmentVariable("POI_BOOST_DAYS") ?? "30");
                            var from = poi.IsFeatured && poi.FeaturedUntil > DateTime.UtcNow
                                ? poi.FeaturedUntil.Value : DateTime.UtcNow;
                            poi.IsFeatured    = true;
                            poi.FeaturedUntil = from.AddDays(boostDays);
                        }
                    }

                    await db.SaveChangesAsync();
                    return Results.Ok(new { matched = true, type = order.Type });
                }

                return Results.Ok(new { matched = false, reason = "order not found or amount insufficient" });
            }

            // ── Du khách: "VOZTRIP XXXXXXXX" ──────────────────────────────
            var deviceMatch = System.Text.RegularExpressions.Regex.Match(content, @"VOZTRIP\s+([A-F0-9]{8})");
            if (!deviceMatch.Success)
                return Results.Ok(new { matched = false, reason = "no recognizable code found" });

            var shortCode = deviceMatch.Groups[1].Value.ToLower();
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

            return Results.Ok(new { matched = true, type = "device", deviceId = device.DeviceId });
        });

        // GET /api/devices/{id}/status — kiểm tra thiết bị đã được duyệt chưa
        app.MapGet("/api/devices/{id}/status", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.Ok(new { approved = false });
            return Results.Ok(new { approved = device.Approved });
        });

        // POST /api/devices/{id}/ping — heartbeat, cập nhật lastSeenAt
        app.MapPost("/api/devices/{id}/ping", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.NotFound();
            device.LastSeenAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok();
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
        })
        .WithFeatureFlag(f => f.Pages.Feedback.Enabled);

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
record GpsTriggerRequest(double Lat, double Lon, string LanguageId, string SessionId, List<string>? AlreadyTriggered);
