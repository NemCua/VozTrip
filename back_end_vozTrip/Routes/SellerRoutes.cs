using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class SellerRoutes
{
    public static void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/seller").RequireAuthorization(policy =>
            policy.RequireRole("seller"));

        // ─── PROFILE ─────────────────────────────────────────────────────────

        // GET /api/seller/profile — F08
        group.MapGet("/profile", async (AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var seller   = await db.Sellers.Include(s => s.User).FirstOrDefaultAsync(s => s.SellerId == sellerId);
            if (seller is null) return Results.NotFound();
            var poiCount = await db.Pois.CountAsync(p => p.SellerId == sellerId);
            return Results.Ok(new
            {
                shopName       = seller.ShopName,
                plan           = seller.Plan,
                planUpgradedAt = seller.PlanUpgradedAt,
                poiCount,
                poiLimit       = seller.Plan == "vip" ? (int?)null : 1,
            });
        })
        .WithFeatureFlag(f => f.Features.Seller.Profile.Enabled);

        // ─── VIP UPGRADE ─────────────────────────────────────────────────────

        // POST /api/seller/upgrade/order — tạo đơn thanh toán VIP qua SePay QR
        group.MapPost("/upgrade/order", async (AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var seller   = await db.Sellers.FindAsync(sellerId);
            if (seller is null) return Results.NotFound();
            if (seller.Plan == "vip")
                return Results.BadRequest(new { message = "Bạn đã là VIP rồi." });

            // Hủy các đơn pending cũ của seller này (tránh rác)
            var oldOrders = await db.PaymentOrders
                .Where(o => o.SellerId == sellerId && o.Type == "seller_vip" && o.Status == "pending")
                .ToListAsync();
            db.PaymentOrders.RemoveRange(oldOrders);

            var orderCode = GenerateOrderCode();
            var amount    = 3_000L;
            var order     = new PaymentOrder
            {
                SellerId  = sellerId,
                Type      = "seller_vip",
                Amount    = amount,
                OrderCode = orderCode,
            };
            db.PaymentOrders.Add(order);
            await db.SaveChangesAsync();

            var qrUrl = BuildVietQrUrl(amount, orderCode);
            return Results.Ok(new
            {
                orderId   = order.OrderId,
                orderCode,
                amount,
                qrUrl,
                expiresInSeconds = 900, // 15 phút
            });
        })
        .WithFeatureFlag(f => f.Features.Seller.VipUpgrade.Enabled);

        // GET /api/seller/upgrade/order/{orderId} — kiểm tra trạng thái thanh toán VIP
        group.MapGet("/upgrade/order/{orderId}", async (string orderId, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var order    = await db.PaymentOrders
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.SellerId == sellerId && o.Type == "seller_vip");
            if (order is null) return Results.NotFound();
            return Results.Ok(new { order.Status, order.PaidAt });
        })
        .WithFeatureFlag(f => f.Features.Seller.VipUpgrade.Enabled);

        // GET /api/seller/orders/{orderId} — trạng thái bất kỳ đơn hàng nào của seller
        group.MapGet("/orders/{orderId}", async (string orderId, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var order    = await db.PaymentOrders
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.SellerId == sellerId);
            if (order is null) return Results.NotFound();
            return Results.Ok(new { order.Status, order.Type, order.PaidAt });
        });

        // ─── POI BOOST ───────────────────────────────────────────────────────

        // POST /api/seller/pois/{id}/boost/order — tạo đơn boost POI qua SePay QR
        group.MapPost("/pois/{id}/boost/order", async (string id, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi      = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            var cfg       = features.Features.Seller.PoiBoost;
            var amount    = cfg.BoostPrice;
            var boostDays = cfg.BoostDays;

            // Hủy đơn pending cũ cho POI này
            var oldOrders = await db.PaymentOrders
                .Where(o => o.SellerId == sellerId && o.PoiId == id && o.Type == "poi_boost" && o.Status == "pending")
                .ToListAsync();
            db.PaymentOrders.RemoveRange(oldOrders);

            var orderCode = GenerateOrderCode();
            var order     = new PaymentOrder
            {
                SellerId  = sellerId,
                Type      = "poi_boost",
                PoiId     = id,
                Amount    = amount,
                OrderCode = orderCode,
            };
            db.PaymentOrders.Add(order);
            await db.SaveChangesAsync();

            var qrUrl = BuildVietQrUrl(amount, orderCode);
            return Results.Ok(new
            {
                orderId   = order.OrderId,
                orderCode,
                amount,
                boostDays,
                qrUrl,
                expiresInSeconds = 900,
            });
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiBoost.Enabled);

        // GET /api/seller/pois/{id}/boost/status — trạng thái boost hiện tại
        group.MapGet("/pois/{id}/boost/status", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi      = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            var pendingOrder = await db.PaymentOrders
                .Where(o => o.SellerId == sellerId && o.PoiId == id && o.Type == "poi_boost" && o.Status == "pending")
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            return Results.Ok(new
            {
                isFeatured   = poi.IsFeatured && (poi.FeaturedUntil == null || poi.FeaturedUntil > DateTime.UtcNow),
                featuredUntil = poi.FeaturedUntil,
                pendingOrderId = pendingOrder?.OrderId,
                pendingOrderCode = pendingOrder?.OrderCode,
                pendingOrderQrUrl = pendingOrder != null ? BuildVietQrUrl(pendingOrder.Amount, pendingOrder.OrderCode) : null,
            });
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiBoost.Enabled);

        // ─── DASHBOARD ───────────────────────────────────────────────────────

        // GET /api/seller/stats — F10
        group.MapGet("/stats", async (AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            var sellerId   = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var totalPois  = await db.Pois.CountAsync(p => p.SellerId == sellerId);
            var activePois = await db.Pois.CountAsync(p => p.SellerId == sellerId && p.IsActive);

            int?  totalVisits  = null;
            int?  visitsToday  = null;
            object? topPois    = null;
            object? visitsByDay = null;

            if (features.Features.Seller.Dashboard.TotalVisits.Enabled)
            {
                totalVisits = await db.VisitLogs
                    .Where(v => v.Poi != null && v.Poi.SellerId == sellerId).CountAsync();
                visitsToday = await db.VisitLogs
                    .Where(v => v.Poi != null && v.Poi.SellerId == sellerId
                             && v.TriggeredAt.Date == DateTime.UtcNow.Date).CountAsync();
            }

            if (features.Features.Seller.Dashboard.Top5Pois.Enabled)
            {
                topPois = await db.VisitLogs
                    .Where(v => v.PoiId != null && v.Poi != null && v.Poi.SellerId == sellerId)
                    .GroupBy(v => v.PoiId)
                    .Select(g => new { poiId = g.Key, count = g.Count() })
                    .OrderByDescending(x => x.count).Take(5)
                    .Join(db.Pois, x => x.poiId, p => p.PoiId,
                        (x, p) => new { p.PoiId, p.PoiName, x.count })
                    .ToListAsync();
            }

            if (features.Features.Seller.Dashboard.VisitChart7Days.Enabled)
            {
                var since = DateTime.UtcNow.Date.AddDays(-6);
                visitsByDay = await db.VisitLogs
                    .Where(v => v.Poi != null && v.Poi.SellerId == sellerId && v.TriggeredAt >= since)
                    .GroupBy(v => v.TriggeredAt.Date)
                    .Select(g => new { date = g.Key, count = g.Count() })
                    .OrderBy(x => x.date).ToListAsync();
            }

            return Results.Ok(new { totalPois, activePois, totalVisits, visitsToday, topPois, visitsByDay });
        })
        .WithFeatureFlag(f => f.Features.Seller.Dashboard.Enabled);

        // ─── POI MANAGEMENT ──────────────────────────────────────────────────

        // GET /api/seller/pois — F11
        group.MapGet("/pois", async (AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var pois = await db.Pois
                .Where(p => p.SellerId == sellerId)
                .Include(p => p.Zone).Include(p => p.Localizations)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.PoiId, p.PoiName, p.Latitude, p.Longitude,
                    p.TriggerRadius, p.IsActive, p.IsFeatured, p.FeaturedUntil, p.CreatedAt,
                    zoneName           = p.Zone != null ? p.Zone.ZoneName : null,
                    localizationCount  = p.Localizations.Count
                })
                .ToListAsync();
            return Results.Ok(pois);
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiManagement.Enabled);

        // POST /api/seller/pois — F11 (create)
        group.MapPost("/pois", async (CreatePoiRequest req, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.PoiManagement.Create.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var seller   = await db.Sellers.FindAsync(sellerId);
            if (seller is null) return Results.Forbid();

            // Sub-flag: plan limit
            if (features.Features.Seller.PoiManagement.PlanLimit.Enabled && seller.Plan == "free")
            {
                var count = await db.Pois.CountAsync(p => p.SellerId == sellerId);
                if (count >= features.Features.Seller.PoiManagement.PlanLimit.FreePlanMaxPois)
                    return Results.BadRequest(new
                    {
                        message = $"Gói Free chỉ được tạo {features.Features.Seller.PoiManagement.PlanLimit.FreePlanMaxPois} POI. Nâng cấp VIP để tạo thêm.",
                        code    = "PLAN_LIMIT"
                    });
            }

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
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiManagement.Enabled);

        // PUT /api/seller/pois/{id} — F11 (update)
        group.MapPut("/pois/{id}", async (string id, CreatePoiRequest req, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.PoiManagement.Update.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi      = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            poi.PoiName       = req.PoiName;
            poi.ZoneId        = req.ZoneId;
            poi.Latitude      = req.Latitude;
            poi.Longitude     = req.Longitude;
            poi.TriggerRadius = req.TriggerRadius ?? poi.TriggerRadius;
            poi.IsActive      = req.IsActive ?? poi.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiManagement.Enabled);

        // DELETE /api/seller/pois/{id} — F11 (delete)
        group.MapDelete("/pois/{id}", async (string id, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.PoiManagement.Delete.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi      = await db.Pois.FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();
            db.Pois.Remove(poi);
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Seller.PoiManagement.Enabled);

        // ─── LOCALIZATION ─────────────────────────────────────────────────────

        // GET /api/seller/pois/{id}/localizations — F12
        group.MapGet("/pois/{id}/localizations", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

            var locs = await db.PoiLocalizations
                .Where(l => l.PoiId == id).Include(l => l.Language)
                .Select(l => new
                {
                    l.LocalizationId, l.LanguageId,
                    languageCode = l.Language.LanguageCode,
                    languageName = l.Language.LanguageName,
                    l.Title, l.Description, l.AudioUrl, l.AudioDuration, l.IsAutoTranslated
                })
                .ToListAsync();
            return Results.Ok(locs);
        })
        .WithFeatureFlag(f => f.Features.Seller.Localization.Enabled);

        // PUT /api/seller/pois/{id}/localizations/{languageId} — F12 (upsert)
        group.MapPut("/pois/{id}/localizations/{languageId}", async (
            string id, string languageId, UpsertLocalizationRequest req,
            AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.Localization.Upsert.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

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
        })
        .WithFeatureFlag(f => f.Features.Seller.Localization.Enabled);

        // DELETE /api/seller/pois/{id}/localizations/{languageId} — F12 (delete)
        group.MapDelete("/pois/{id}/localizations/{languageId}", async (
            string id, string languageId,
            AppDbContext db, HttpContext ctx, CloudinaryService cloudinary, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.Localization.Delete.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

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
        })
        .WithFeatureFlag(f => f.Features.Seller.Localization.Enabled);

        // ─── AUDIO ───────────────────────────────────────────────────────────

        // POST /api/seller/pois/{id}/localizations/{languageId}/audio — F13
        group.MapPost("/pois/{id}/localizations/{languageId}/audio", async (
            string id, string languageId, IFormFile file,
            AppDbContext db, HttpContext ctx, CloudinaryService cloudinary, FeaturesConfig features) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

            if (!file.ContentType.ToLower().StartsWith("audio/"))
                return Results.BadRequest(new { message = "Chỉ chấp nhận file audio" });

            var existing = await db.PoiLocalizations
                .FirstOrDefaultAsync(l => l.PoiId == id && l.LanguageId == languageId);

            // Sub-flag: xóa audio cũ trên Cloudinary khi upload mới
            if (features.Features.Seller.AudioUpload.DeleteOldOnReplace.Enabled
                && existing?.AudioPublicId != null)
            {
                await cloudinary.DeleteAsync(existing.AudioPublicId);
            }

            var uploaded = await cloudinary.UploadAudioAsync(file, sellerId);

            if (existing is null)
            {
                existing = new PoiLocalization { PoiId = id, LanguageId = languageId };
                db.PoiLocalizations.Add(existing);
            }
            existing.AudioUrl      = uploaded.Url;
            existing.AudioPublicId = uploaded.PublicId;
            await db.SaveChangesAsync();
            return Results.Ok(new { audioUrl = uploaded.Url });
        })
        .DisableAntiforgery()
        .WithFeatureFlag(f => f.Features.Seller.AudioUpload.Enabled);

        // ─── AUTO TRANSLATE ───────────────────────────────────────────────────

        // POST /api/seller/pois/{id}/localizations/translate — F14
        group.MapPost("/pois/{id}/localizations/translate", async (
            string id, TranslateRequest req,
            AppDbContext db, HttpContext ctx, LibreTranslateService translator, FeaturesConfig features) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var poi = await db.Pois
                .Include(p => p.Localizations)
                .FirstOrDefaultAsync(p => p.PoiId == id && p.SellerId == sellerId);
            if (poi is null) return Results.NotFound();

            var source = poi.Localizations.FirstOrDefault(l => l.LanguageId == req.SourceLanguageId);
            if (source is null)
                return Results.BadRequest(new { message = "Chưa có nội dung ở ngôn ngữ nguồn" });
            if (string.IsNullOrWhiteSpace(source.Title) && string.IsNullOrWhiteSpace(source.Description))
                return Results.BadRequest(new { message = "Nội dung nguồn trống, không có gì để dịch" });

            var allLanguages = await db.Languages
                .Where(l => l.IsActive && l.LanguageId != req.SourceLanguageId).ToListAsync();

            // Sub-flag: bỏ qua những ngôn ngữ đã có nội dung thủ công
            IEnumerable<Language> targetLanguages;
            if (features.Features.Seller.AutoTranslate.SkipExistingManual.Enabled)
            {
                var existingIds = poi.Localizations
                    .Where(l => l.LanguageId != req.SourceLanguageId && !l.IsAutoTranslated)
                    .Select(l => l.LanguageId).ToHashSet();
                targetLanguages = allLanguages.Where(l => !existingIds.Contains(l.LanguageId));
            }
            else
            {
                targetLanguages = allLanguages;
            }

            var targetList = targetLanguages.ToList();
            if (targetList.Count == 0)
                return Results.Ok(new { message = "Tất cả ngôn ngữ đã có nội dung", translated = 0 });

            var sourceLang = await db.Languages.FindAsync(req.SourceLanguageId);
            if (sourceLang is null)
                return Results.BadRequest(new { message = "Ngôn ngữ nguồn không hợp lệ" });

            var targetCodes   = targetList.Select(l => l.LanguageCode).ToList();
            var translations  = await translator.TranslateToManyAsync(
                source.Title, source.Description, sourceLang.LanguageCode, targetCodes);

            int count = 0;
            foreach (var lang in targetList)
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
        })
        .WithFeatureFlag(f => f.Features.Seller.AutoTranslate.Enabled);

        // ─── MEDIA ───────────────────────────────────────────────────────────

        // GET /api/seller/pois/{id}/media — F15
        group.MapGet("/pois/{id}/media", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

            var media = await db.PoiMedia
                .Where(m => m.PoiId == id).OrderBy(m => m.SortOrder).ToListAsync();
            return Results.Ok(media);
        })
        .WithFeatureFlag(f => f.Features.Seller.MediaManagement.Enabled);

        // POST /api/seller/pois/{id}/media — F15 (add by URL)
        group.MapPost("/pois/{id}/media", async (string id, AddMediaRequest req, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

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
        })
        .WithFeatureFlag(f => f.Features.Seller.MediaManagement.Upload.Enabled);

        // POST /api/seller/pois/{id}/media/upload — F15 (upload Cloudinary)
        group.MapPost("/pois/{id}/media/upload", async (
            string id, IFormFile file, AppDbContext db, HttpContext ctx,
            CloudinaryService cloudinary, FeaturesConfig features) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

            var contentType = file.ContentType.ToLower();
            UploadResult uploaded;
            string mediaType;

            if (contentType.StartsWith("video/"))
            {
                if (!features.Features.Seller.MediaManagement.Upload.Video.Enabled)
                    return Results.BadRequest(new { message = "Upload video hiện không khả dụng." });
                uploaded  = await cloudinary.UploadVideoAsync(file, sellerId);
                mediaType = "video";
            }
            else if (contentType.StartsWith("image/"))
            {
                if (!features.Features.Seller.MediaManagement.Upload.Image.Enabled)
                    return Results.BadRequest(new { message = "Upload ảnh hiện không khả dụng." });
                uploaded  = await cloudinary.UploadImageAsync(file, sellerId);
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
        })
        .DisableAntiforgery()
        .WithFeatureFlag(f => f.Features.Seller.MediaManagement.Upload.Enabled);

        // DELETE /api/seller/media/{mediaId} — F15 (delete)
        group.MapDelete("/media/{mediaId}", async (
            string mediaId, AppDbContext db, HttpContext ctx, CloudinaryService cloudinary) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var media    = await db.PoiMedia.Include(m => m.Poi)
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
        })
        .WithFeatureFlag(f => f.Features.Seller.MediaManagement.Delete.Enabled);

        // ─── Q&A ─────────────────────────────────────────────────────────────

        // GET /api/seller/pois/{id}/questions — F16
        group.MapGet("/pois/{id}/questions", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

            var questions = await db.Questions
                .Where(q => q.PoiId == id)
                .Include(q => q.Language).Include(q => q.Answer)
                .OrderBy(q => q.SortOrder)
                .Select(q => new
                {
                    q.QuestionId, q.LanguageId,
                    languageCode = q.Language.LanguageCode,
                    q.QuestionText, q.SortOrder, q.IsActive,
                    answer = q.Answer == null ? null : new
                    {
                        q.Answer.AnswerId, q.Answer.AnswerText, q.Answer.AudioUrl
                    }
                })
                .ToListAsync();
            return Results.Ok(questions);
        })
        .WithFeatureFlag(f => f.Features.Seller.QnaManagement.Enabled);

        // POST /api/seller/pois/{id}/questions — F16 (create)
        group.MapPost("/pois/{id}/questions", async (
            string id, CreateQuestionRequest req, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.QnaManagement.CreateQuestion.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (!await db.Pois.AnyAsync(p => p.PoiId == id && p.SellerId == sellerId))
                return Results.NotFound();

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
        })
        .WithFeatureFlag(f => f.Features.Seller.QnaManagement.Enabled);

        // PUT /api/seller/questions/{questionId}/answer — F16 (upsert answer)
        group.MapPut("/questions/{questionId}/answer", async (
            string questionId, UpsertAnswerRequest req, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.QnaManagement.UpsertAnswer.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var question = await db.Questions
                .Include(q => q.Poi).Include(q => q.Answer)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId && q.Poi.SellerId == sellerId);
            if (question is null) return Results.NotFound();

            if (question.Answer is null)
            {
                db.Answers.Add(new Answer
                {
                    QuestionId    = questionId,
                    PoiId         = question.PoiId,
                    LanguageId    = question.LanguageId,
                    AnswerText    = req.AnswerText,
                    AudioUrl      = req.AudioUrl,
                    AudioPublicId = req.AudioPublicId
                });
            }
            else
            {
                question.Answer.AnswerText    = req.AnswerText;
                question.Answer.AudioUrl      = req.AudioUrl;
                question.Answer.AudioPublicId = req.AudioPublicId;
            }
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Seller.QnaManagement.Enabled);

        // DELETE /api/seller/questions/{questionId} — F16 (delete)
        group.MapDelete("/questions/{questionId}", async (
            string questionId, AppDbContext db, HttpContext ctx, FeaturesConfig features) =>
        {
            if (!features.Features.Seller.QnaManagement.DeleteQuestion.Enabled)
                return Results.NotFound(new { message = "Tính năng này hiện không khả dụng." });

            var sellerId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var question = await db.Questions.Include(q => q.Poi)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId && q.Poi.SellerId == sellerId);
            if (question is null) return Results.NotFound();
            db.Questions.Remove(question);
            await db.SaveChangesAsync();
            return Results.Ok();
        })
        .WithFeatureFlag(f => f.Features.Seller.QnaManagement.Enabled);
    }

    private static string GenerateOrderCode()
    {
        var ts  = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()[^6..]; // last 6 digits of unix ts
        var rnd = Random.Shared.Next(100, 999);
        return $"VOZ{ts}{rnd}";
    }

    private static string BuildVietQrUrl(long amount, string orderCode)
    {
        var bankId      = Environment.GetEnvironmentVariable("VIETQR_BANK_ID")      ?? "970422";
        var accountNo   = Environment.GetEnvironmentVariable("VIETQR_ACCOUNT_NO")   ?? "0000000000";
        var accountName = Uri.EscapeDataString(
            Environment.GetEnvironmentVariable("VIETQR_ACCOUNT_NAME") ?? "VOZTRIP");
        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact.png" +
               $"?amount={amount}&addInfo={Uri.EscapeDataString(orderCode)}&accountName={accountName}";
    }
}

record CreatePoiRequest(
    string PoiName, double Latitude, double Longitude,
    string? ZoneId, double? TriggerRadius, bool? IsActive);

record UpsertLocalizationRequest(
    string? Title, string? Description,
    string? AudioUrl, string? AudioPublicId, int? AudioDuration);

record AddMediaRequest(string MediaType, string MediaUrl, string? PublicId, int? SortOrder);
record CreateQuestionRequest(string LanguageId, string QuestionText, int? SortOrder);
record UpsertAnswerRequest(string AnswerText, string? AudioUrl, string? AudioPublicId);
record TranslateRequest(string SourceLanguageId);
