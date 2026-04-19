using Microsoft.EntityFrameworkCore;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class AdminRoutes
{
    public static void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization(policy =>
            policy.RequireRole("admin"));

        // ─── SELLERS ─────────────────────────────────────────────────────────

        // GET /api/admin/sellers — F18 (list)
        group.MapGet("/sellers", async (AppDbContext db) =>
        {
            var sellers = await db.Sellers
                .Include(s => s.User).Include(s => s.ApprovedByUser)
                .OrderBy(s => s.ApprovedAt == null ? 0 : 1)
                .ThenByDescending(s => s.User.CreatedAt)
                .Select(s => new
                {
                    sellerId     = s.SellerId,
                    username     = s.User.Username,
                    fullName     = s.User.FullName,
                    email        = s.User.Email,
                    shopName     = s.ShopName,
                    contactPhone = s.ContactPhone,
                    description  = s.Description,
                    isActive     = s.User.IsActive,
                    approvedAt   = s.ApprovedAt,
                    approvedBy   = s.ApprovedByUser != null ? s.ApprovedByUser.Username : null,
                    createdAt    = s.User.CreatedAt
                })
                .ToListAsync();
            return Results.Ok(sellers);
        })
        .WithFeatureFlag(f => f.Features.Admin.SellerManagement.List.Enabled);

        // POST /api/admin/sellers — F18 (create)
        group.MapPost("/sellers", async (CreateSellerRequest req, AppDbContext db, HttpContext ctx) =>
        {
            if (await db.Users.AnyAsync(u => u.Username == req.Username))
                return Results.BadRequest(new { message = "Username đã tồn tại" });

            var adminId = ctx.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userId  = Guid.NewGuid().ToString();
            var user    = new User
            {
                UserId       = userId,
                Username     = req.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role         = "seller",
                FullName     = req.FullName,
                Email        = req.Email,
            };
            var seller = new Seller
            {
                SellerId     = userId,
                ShopName     = req.ShopName,
                ContactPhone = req.ContactPhone,
                Description  = req.Description,
                ApprovedAt   = DateTime.UtcNow,
                ApprovedBy   = adminId,
            };
            db.Users.Add(user);
            db.Sellers.Add(seller);
            await db.SaveChangesAsync();
            return Results.Ok(new { sellerId = userId, message = "Tạo seller thành công" });
        })
        .WithFeatureFlag(f => f.Features.Admin.SellerManagement.Create.Enabled);

        // PUT /api/admin/sellers/{id}/approve — F18 (approve)
        group.MapPut("/sellers/{id}/approve", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var seller = await db.Sellers.Include(s => s.User).FirstOrDefaultAsync(s => s.SellerId == id);
            if (seller is null)
                return Results.NotFound(new { message = "Seller không tồn tại" });
            if (seller.ApprovedAt is not null)
                return Results.BadRequest(new { message = "Seller đã được duyệt rồi" });

            var adminId       = ctx.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            seller.ApprovedAt = DateTime.UtcNow;
            seller.ApprovedBy = adminId;
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Duyệt thành công" });
        })
        .WithFeatureFlag(f => f.Features.Admin.SellerManagement.Approve.Enabled);

        // ─── USERS ───────────────────────────────────────────────────────────

        // GET /api/admin/users — F19 (list)
        group.MapGet("/users", async (AppDbContext db) =>
        {
            var users = await db.Users
                .OrderBy(u => u.Role).ThenByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.UserId, u.Username, u.FullName, u.Email,
                    u.Role, u.IsActive, u.CreatedAt,
                    isSeller   = u.Seller != null,
                    shopName   = u.Seller != null ? u.Seller.ShopName : null,
                    plan       = u.Seller != null ? u.Seller.Plan : null,
                    approvedAt = u.Seller != null ? u.Seller.ApprovedAt : null,
                })
                .ToListAsync();
            return Results.Ok(users);
        })
        .WithFeatureFlag(f => f.Features.Admin.UserManagement.List.Enabled);

        // PUT /api/admin/users/{id}/toggle — F19 (lock/unlock)
        group.MapPut("/users/{id}/toggle", async (string id, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null)
                return Results.NotFound(new { message = "User không tồn tại" });
            if (user.Role == "admin")
                return Results.BadRequest(new { message = "Không thể khóa tài khoản admin" });

            user.IsActive = !user.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok(new { isActive = user.IsActive });
        })
        .WithFeatureFlag(f => f.Features.Admin.UserManagement.ToggleLock.Enabled);

        // DELETE /api/admin/users/{id} — F19 (delete)
        group.MapDelete("/users/{id}", async (string id, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null)
                return Results.NotFound(new { message = "User không tồn tại" });
            if (user.Role == "admin")
                return Results.BadRequest(new { message = "Không thể xóa tài khoản admin" });

            db.Users.Remove(user);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Đã xóa tài khoản" });
        })
        .WithFeatureFlag(f => f.Features.Admin.UserManagement.Delete.Enabled);

        // ─── ZONES — F22 ─────────────────────────────────────────────────────

        group.MapGet("/zones", async (AppDbContext db) =>
            Results.Ok(await db.Zones.OrderBy(z => z.ZoneName).ToListAsync()))
        .WithFeatureFlag(f => f.Features.Admin.ZoneManagement.Enabled);

        group.MapPost("/zones", async (ZoneRequest req, AppDbContext db) =>
        {
            var zone = new Zone { ZoneName = req.ZoneName, Description = req.Description };
            db.Zones.Add(zone);
            await db.SaveChangesAsync();
            return Results.Ok(new { zone.ZoneId });
        })
        .WithFeatureFlag(f => f.Features.Admin.ZoneManagement.Create.Enabled);

        group.MapPut("/zones/{id}", async (string id, ZoneRequest req, AppDbContext db) =>
        {
            var zone = await db.Zones.FindAsync(id);
            if (zone is null) return Results.NotFound();
            zone.ZoneName    = req.ZoneName;
            zone.Description = req.Description;
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Admin.ZoneManagement.Update.Enabled);

        group.MapDelete("/zones/{id}", async (string id, AppDbContext db) =>
        {
            var zone = await db.Zones.FindAsync(id);
            if (zone is null) return Results.NotFound();
            db.Zones.Remove(zone);
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Admin.ZoneManagement.Delete.Enabled);

        // ─── LANGUAGES — F23 ─────────────────────────────────────────────────

        group.MapGet("/languages", async (AppDbContext db) =>
            Results.Ok(await db.Languages.OrderBy(l => l.LanguageCode).ToListAsync()))
        .WithFeatureFlag(f => f.Features.Admin.LanguageManagement.Enabled);

        group.MapPost("/languages", async (LanguageRequest req, AppDbContext db) =>
        {
            var lang = new Language { LanguageCode = req.LanguageCode, LanguageName = req.LanguageName };
            db.Languages.Add(lang);
            await db.SaveChangesAsync();
            return Results.Ok(new { lang.LanguageId });
        })
        .WithFeatureFlag(f => f.Features.Admin.LanguageManagement.Create.Enabled);

        group.MapPut("/languages/{id}", async (string id, LanguageRequest req, AppDbContext db) =>
        {
            var lang = await db.Languages.FindAsync(id);
            if (lang is null) return Results.NotFound();
            lang.LanguageCode = req.LanguageCode;
            lang.LanguageName = req.LanguageName;
            lang.IsActive     = req.IsActive ?? lang.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Admin.LanguageManagement.Update.Enabled);

        // ─── STATS — F17 ─────────────────────────────────────────────────────

        group.MapGet("/stats", async (AppDbContext db, FeaturesConfig features) =>
        {
            var totalSellers   = await db.Sellers.CountAsync();
            var pendingSellers = await db.Sellers.CountAsync(s => s.ApprovedAt == null);
            var totalPois      = await db.Pois.CountAsync();
            var activePois     = await db.Pois.CountAsync(p => p.IsActive);
            var totalVisits    = await db.VisitLogs.CountAsync();
            var visitsToday    = await db.VisitLogs.CountAsync(v => v.TriggeredAt.Date == DateTime.UtcNow.Date);
            var totalSessions  = await db.GuestSessions.CountAsync();
            var totalQrScans     = await db.UsageLogs.CountAsync(u => u.EventType == "qr_scan");
            var totalAppOpens    = await db.UsageLogs.CountAsync(u => u.EventType == "app_open");
            var totalDeviceJoins = await db.DeviceRecords.CountAsync();

            object? topPois     = null;
            object? visitsByDay = null;
            object? qrScansByDay = null;

            if (features.Features.Admin.Dashboard.Top5Pois.Enabled)
            {
                topPois = await db.VisitLogs
                    .Where(v => v.PoiId != null)
                    .GroupBy(v => v.PoiId)
                    .Select(g => new { poiId = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count).Take(5)
                    .Join(db.Pois, x => x.poiId, p => p.PoiId,
                        (x, p) => new { p.PoiId, p.PoiName, x.count })
                    .ToListAsync();
            }

            if (features.Features.Admin.Dashboard.VisitChart7Days.Enabled)
            {
                var since = DateTime.UtcNow.Date.AddDays(-6);
                visitsByDay = await db.VisitLogs
                    .Where(v => v.TriggeredAt >= since)
                    .GroupBy(v => v.TriggeredAt.Date)
                    .Select(g => new { date = g.Key, count = g.Count() })
                    .OrderBy(x => x.date).ToListAsync();

                qrScansByDay = await db.UsageLogs
                    .Where(u => u.EventType == "qr_scan" && u.CreatedAt >= since)
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new { date = g.Key, count = g.Count() })
                    .OrderBy(x => x.date).ToListAsync();
            }

            return Results.Ok(new
            {
                totalSellers, pendingSellers,
                totalPois, activePois,
                totalVisits, visitsToday, totalSessions,
                totalQrScans, totalAppOpens, totalDeviceJoins,
                topPois, visitsByDay, qrScansByDay,
            });
        })
        .WithFeatureFlag(f => f.Features.Admin.Dashboard.Enabled);

        // ─── MEDIA MODERATION — F20 ──────────────────────────────────────────

        group.MapGet("/media", async (AppDbContext db) =>
        {
            var media = await db.PoiMedia
                .Include(m => m.Poi).ThenInclude(p => p.Seller).ThenInclude(s => s.User)
                .OrderByDescending(m => m.SortOrder)
                .Select(m => new
                {
                    m.MediaId, m.MediaType, m.MediaUrl, m.SortOrder,
                    poi = new { m.Poi.PoiId, m.Poi.PoiName, m.Poi.IsActive, m.Poi.CreatedAt },
                    owner = new
                    {
                        userId   = m.Poi.Seller.User.UserId,
                        username = m.Poi.Seller.User.Username,
                        fullName = m.Poi.Seller.User.FullName,
                        isActive = m.Poi.Seller.User.IsActive,
                        shopName = m.Poi.Seller.ShopName,
                        plan     = m.Poi.Seller.Plan,
                    }
                })
                .ToListAsync();
            return Results.Ok(media);
        })
        .WithFeatureFlag(f => f.Features.Admin.MediaModeration.ViewAll.Enabled);

        group.MapDelete("/media/{mediaId}", async (
            string mediaId, AppDbContext db, CloudinaryService cloudinary, FeaturesConfig features) =>
        {
            var media = await db.PoiMedia.FindAsync(mediaId);
            if (media is null) return Results.NotFound(new { message = "Media không tồn tại" });

            if (features.Features.Admin.MediaModeration.DeleteViolation.CleanCloudinary.Enabled
                && !string.IsNullOrEmpty(media.PublicId))
            {
                var resourceType = media.MediaType == "video"
                    ? CloudinaryDotNet.Actions.ResourceType.Video
                    : CloudinaryDotNet.Actions.ResourceType.Image;
                await cloudinary.DeleteAsync(media.PublicId, resourceType);
            }

            db.PoiMedia.Remove(media);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Đã xóa ảnh" });
        })
        .WithFeatureFlag(f => f.Features.Admin.MediaModeration.DeleteViolation.Enabled);

        // ─── ADMIN POIs — F21 ────────────────────────────────────────────────

        group.MapGet("/pois", async (AppDbContext db) =>
        {
            var pois = await db.Pois
                .Include(p => p.Seller).Include(p => p.Zone)
                .Include(p => p.Localizations).Include(p => p.VisitLogs)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.PoiId, p.PoiName, p.Latitude, p.Longitude,
                    p.TriggerRadius, p.IsActive, p.CreatedAt,
                    ZoneName          = p.Zone != null ? p.Zone.ZoneName : null,
                    ShopName          = p.Seller.ShopName,
                    SellerId          = p.SellerId,
                    LocalizationCount = p.Localizations.Count,
                    VisitCount        = p.VisitLogs.Count,
                })
                .ToListAsync();
            return Results.Ok(pois);
        })
        .WithFeatureFlag(f => f.Features.Admin.PoiModeration.List.Enabled);

        group.MapGet("/pois/{id}", async (string id, AppDbContext db) =>
        {
            var poi = await db.Pois
                .Include(p => p.Seller).ThenInclude(s => s.User)
                .Include(p => p.Zone)
                .Include(p => p.Media.OrderBy(m => m.SortOrder))
                .Include(p => p.Localizations).ThenInclude(l => l.Language)
                .Include(p => p.Questions).ThenInclude(q => q.Answer)
                .FirstOrDefaultAsync(p => p.PoiId == id);

            if (poi is null) return Results.NotFound(new { message = "POI không tồn tại" });

            return Results.Ok(new
            {
                poi.PoiId, poi.PoiName, poi.Latitude, poi.Longitude,
                poi.TriggerRadius, poi.IsActive, poi.CreatedAt,
                zone  = poi.Zone == null ? null : new { poi.Zone.ZoneId, poi.Zone.ZoneName },
                owner = new
                {
                    userId       = poi.Seller.User.UserId,
                    username     = poi.Seller.User.Username,
                    fullName     = poi.Seller.User.FullName,
                    email        = poi.Seller.User.Email,
                    isActive     = poi.Seller.User.IsActive,
                    createdAt    = poi.Seller.User.CreatedAt,
                    shopName     = poi.Seller.ShopName,
                    contactPhone = poi.Seller.ContactPhone,
                    plan         = poi.Seller.Plan,
                    approvedAt   = poi.Seller.ApprovedAt,
                },
                media = poi.Media.Select(m => new
                    { m.MediaId, m.MediaType, m.MediaUrl, m.PublicId, m.SortOrder }),
                localizations = poi.Localizations.Select(l => new
                {
                    l.LocalizationId, l.LanguageId,
                    languageCode = l.Language.LanguageCode,
                    languageName = l.Language.LanguageName,
                    l.Title, l.Description, l.AudioUrl, l.AudioDuration, l.IsAutoTranslated,
                }),
                questions = poi.Questions.Select(q => new
                {
                    q.QuestionId, q.QuestionText, q.SortOrder, q.IsActive,
                    answer = q.Answer == null ? null : new { q.Answer.AnswerText, q.Answer.AudioUrl }
                }),
            });
        })
        .WithFeatureFlag(f => f.Features.Admin.PoiModeration.Detail.Enabled);

        group.MapPut("/pois/{id}/toggle", async (string id, AppDbContext db) =>
        {
            var poi = await db.Pois.FindAsync(id);
            if (poi is null) return Results.NotFound();
            poi.IsActive = !poi.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok(new { poi.IsActive });
        })
        .WithFeatureFlag(f => f.Features.Admin.PoiModeration.ToggleActive.Enabled);

        group.MapDelete("/pois/{id}", async (
            string id, AppDbContext db, CloudinaryService cloudinary, FeaturesConfig features) =>
        {
            var poi = await db.Pois
                .Include(p => p.Media).Include(p => p.Localizations)
                .FirstOrDefaultAsync(p => p.PoiId == id);
            if (poi is null) return Results.NotFound(new { message = "POI không tồn tại" });

            if (features.Features.Admin.PoiModeration.Delete.CleanCloudinary.Enabled)
            {
                foreach (var m in poi.Media)
                {
                    if (string.IsNullOrEmpty(m.PublicId)) continue;
                    var resourceType = m.MediaType == "video"
                        ? CloudinaryDotNet.Actions.ResourceType.Video
                        : CloudinaryDotNet.Actions.ResourceType.Image;
                    await cloudinary.DeleteAsync(m.PublicId, resourceType);
                }
                foreach (var loc in poi.Localizations)
                {
                    if (!string.IsNullOrEmpty(loc.AudioPublicId))
                        await cloudinary.DeleteAsync(loc.AudioPublicId);
                }
            }

            db.Pois.Remove(poi);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Đã xóa POI" });
        })
        .WithFeatureFlag(f => f.Features.Admin.PoiModeration.Delete.Enabled);

        // ─── DEVICES — thống kê thiết bị ────────────────────────────────────────

        group.MapGet("/devices", async (AppDbContext db) =>
        {
            var devices = await db.DeviceRecords
                .OrderByDescending(d => d.LastSeenAt ?? d.JoinedAt)
                .Select(d => new
                {
                    d.DeviceId, d.Platform, d.OsVersion,
                    d.JoinedAt, d.LastSeenAt,
                    d.Approved, d.ApprovedAt,
                })
                .ToListAsync();
            return Results.Ok(devices);
        })
        .WithFeatureFlag(f => f.Features.Admin.DeviceTracking.Enabled);

        group.MapPost("/devices/{id}/approve", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.NotFound(new { message = "Thiết bị không tồn tại" });
            device.Approved   = true;
            device.ApprovedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(new { device.DeviceId, device.Approved, device.ApprovedAt });
        })
        .WithFeatureFlag(f => f.Features.Admin.DeviceTracking.Enabled);

        group.MapPost("/devices/{id}/revoke", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.NotFound(new { message = "Thiết bị không tồn tại" });
            device.Approved   = false;
            device.ApprovedAt = null;
            await db.SaveChangesAsync();
            return Results.Ok(new { device.DeviceId, device.Approved });
        })
        .WithFeatureFlag(f => f.Features.Admin.DeviceTracking.Enabled);

        group.MapDelete("/devices/{id}", async (string id, AppDbContext db) =>
        {
            var device = await db.DeviceRecords.FindAsync(id);
            if (device is null) return Results.NotFound(new { message = "Thiết bị không tồn tại" });
            db.DeviceRecords.Remove(device);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Đã xóa thiết bị" });
        })
        .WithFeatureFlag(f => f.Features.Admin.DeviceTracking.Delete.Enabled);

        // ─── FEEDBACK ────────────────────────────────────────────────────────────

        // GET /api/admin/feedback?status=pending
        group.MapGet("/feedback", async (string? status, AppDbContext db) =>
        {
            var query = db.FeedbackReports.AsQueryable();
            if (!string.IsNullOrEmpty(status))
                query = query.Where(f => f.Status == status);

            var reports = await query
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.ReportId, f.Type, f.Message, f.PoiId,
                    f.SessionId, f.DeviceId, f.Platform, f.Lang,
                    f.Status, f.AdminNote, f.CreatedAt, f.ReviewedAt,
                })
                .ToListAsync();
            return Results.Ok(reports);
        });

        // PATCH /api/admin/feedback/{id} — đổi status + ghi note
        group.MapPatch("/feedback/{id}", async (string id, FeedbackReviewRequest req, AppDbContext db) =>
        {
            var report = await db.FeedbackReports.FindAsync(id);
            if (report is null) return Results.NotFound();

            var validStatuses = new[] { "pending", "reviewed", "resolved" };
            if (!string.IsNullOrEmpty(req.Status) && validStatuses.Contains(req.Status))
                report.Status = req.Status;

            if (req.AdminNote is not null)
                report.AdminNote = req.AdminNote;

            report.ReviewedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(new { report.ReportId, report.Status, report.AdminNote });
        });

        // DELETE /api/admin/feedback/{id}
        group.MapDelete("/feedback/{id}", async (string id, AppDbContext db) =>
        {
            var report = await db.FeedbackReports.FindAsync(id);
            if (report is null) return Results.NotFound();
            db.FeedbackReports.Remove(report);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}

record FeedbackReviewRequest(string? Status, string? AdminNote);
record ZoneRequest(string ZoneName, string? Description);
record LanguageRequest(string LanguageCode, string? LanguageName, bool? IsActive);
record CreateSellerRequest(
    string Username, string Password, string ShopName,
    string? FullName, string? Email, string? ContactPhone, string? Description);
