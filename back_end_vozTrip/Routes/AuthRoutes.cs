using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using back_end_vozTrip.Models;
using back_end_vozTrip.Services;

namespace back_end_vozTrip.Routes;

public static class AuthRoutes
{
    public static void Map(WebApplication app)
    {
        // POST /api/auth/login
        app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, IConfiguration config) =>
        {
            var user = await db.Users
                .Include(u => u.Seller)
                .FirstOrDefaultAsync(u => u.Username == req.Username);

            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

            if (!user.IsActive)
                return Results.Forbid();

            // Seller chưa được admin duyệt thì không cho vào
            if (user.Role == "seller" && user.Seller?.ApprovedAt is null)
                return Results.Json(new { message = "Tài khoản chưa được duyệt" }, statusCode: 403);

            var token = GenerateToken(user, config);
            return Results.Ok(new
            {
                token,
                user.UserId,
                user.Username,
                user.Role,
                user.FullName,
                shopName = user.Seller?.ShopName
            });
        });

        // POST /api/auth/register — seller tự đăng ký, chờ admin duyệt
        app.MapPost("/api/auth/register", async (RegisterRequest req, AppDbContext db) =>
        {
            var exists = await db.Users.AnyAsync(u => u.Username == req.Username);
            if (exists)
                return Results.Conflict(new { message = "Username đã tồn tại" });

            var user = new User
            {
                Username  = req.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role      = "seller",
                FullName  = req.FullName,
                Email     = req.Email
            };

            var seller = new Seller
            {
                SellerId     = user.UserId,
                ShopName     = req.ShopName,
                ContactPhone = req.ContactPhone,
                Description  = req.Description
            };

            db.Users.Add(user);
            db.Sellers.Add(seller);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Đăng ký thành công, chờ admin duyệt" });
        });
    }

    private static string GenerateToken(User user, IConfiguration config)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId),
            new Claim(ClaimTypes.Name,           user.Username),
            new Claim(ClaimTypes.Role,           user.Role)
        };

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

record LoginRequest(string Username, string Password);
record RegisterRequest(
    string Username,
    string Password,
    string ShopName,
    string? FullName,
    string? Email,
    string? ContactPhone,
    string? Description
);
