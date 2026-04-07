using Microsoft.EntityFrameworkCore;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class AdminRoutes
{
    public static void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization(policy =>
            policy.RequireRole("admin"));

        // GET /api/admin/sellers — danh sách tất cả seller
        group.MapGet("/sellers", async (AppDbContext db) =>
        {
            var sellers = await db.Sellers
                .Include(s => s.User)
                .Include(s => s.ApprovedByUser)
                .OrderBy(s => s.ApprovedAt == null ? 0 : 1) // pending lên đầu
                .ThenByDescending(s => s.User.CreatedAt)
                .Select(s => new
                {
                    sellerId    = s.SellerId,
                    username    = s.User.Username,
                    fullName    = s.User.FullName,
                    email       = s.User.Email,
                    shopName    = s.ShopName,
                    contactPhone = s.ContactPhone,
                    description = s.Description,
                    isActive    = s.User.IsActive,
                    approvedAt  = s.ApprovedAt,
                    approvedBy  = s.ApprovedByUser != null ? s.ApprovedByUser.Username : null,
                    createdAt   = s.User.CreatedAt
                })
                .ToListAsync();

            return Results.Ok(sellers);
        });

        // PUT /api/admin/sellers/{id}/approve — duyệt seller
        group.MapPut("/sellers/{id}/approve", async (string id, AppDbContext db, HttpContext ctx) =>
        {
            var seller = await db.Sellers.Include(s => s.User).FirstOrDefaultAsync(s => s.SellerId == id);
            if (seller is null)
                return Results.NotFound(new { message = "Seller không tồn tại" });

            if (seller.ApprovedAt is not null)
                return Results.BadRequest(new { message = "Seller đã được duyệt rồi" });

            var adminId = ctx.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            seller.ApprovedAt = DateTime.UtcNow;
            seller.ApprovedBy = adminId;

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Duyệt thành công" });
        });

        // PUT /api/admin/users/{id}/toggle — khóa / mở khóa tài khoản
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
        });

        // ─── ZONES ───────────────────────────────────────────

        group.MapGet("/zones", async (AppDbContext db) =>
            Results.Ok(await db.Zones.OrderBy(z => z.ZoneName).ToListAsync()));

        group.MapPost("/zones", async (ZoneRequest req, AppDbContext db) =>
        {
            var zone = new Zone { ZoneName = req.ZoneName, Description = req.Description };
            db.Zones.Add(zone);
            await db.SaveChangesAsync();
            return Results.Ok(new { zone.ZoneId });
        });

        group.MapPut("/zones/{id}", async (string id, ZoneRequest req, AppDbContext db) =>
        {
            var zone = await db.Zones.FindAsync(id);
            if (zone is null) return Results.NotFound();
            zone.ZoneName    = req.ZoneName;
            zone.Description = req.Description;
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        group.MapDelete("/zones/{id}", async (string id, AppDbContext db) =>
        {
            var zone = await db.Zones.FindAsync(id);
            if (zone is null) return Results.NotFound();
            db.Zones.Remove(zone);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // ─── LANGUAGES ───────────────────────────────────────

        group.MapGet("/languages", async (AppDbContext db) =>
            Results.Ok(await db.Languages.OrderBy(l => l.LanguageCode).ToListAsync()));

        group.MapPost("/languages", async (LanguageRequest req, AppDbContext db) =>
        {
            var lang = new Language { LanguageCode = req.LanguageCode, LanguageName = req.LanguageName };
            db.Languages.Add(lang);
            await db.SaveChangesAsync();
            return Results.Ok(new { lang.LanguageId });
        });

        group.MapPut("/languages/{id}", async (string id, LanguageRequest req, AppDbContext db) =>
        {
            var lang = await db.Languages.FindAsync(id);
            if (lang is null) return Results.NotFound();
            lang.LanguageCode = req.LanguageCode;
            lang.LanguageName = req.LanguageName;
            lang.IsActive     = req.IsActive ?? lang.IsActive;
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}

record ZoneRequest(string ZoneName, string? Description);
record LanguageRequest(string LanguageCode, string? LanguageName, bool? IsActive);
