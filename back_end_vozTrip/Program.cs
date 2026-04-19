using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;
using back_end_vozTrip.Routes;
using back_end_vozTrip.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Feature Flags ───────────────────────────────────────────────────────────

var featuresPath = Path.GetFullPath(
    Path.Combine(builder.Environment.ContentRootPath, "..", "config", "features.json"));

FeaturesConfig features;
if (File.Exists(featuresPath))
{
    var json = File.ReadAllText(featuresPath);
    features = JsonSerializer.Deserialize<FeaturesConfig>(json, new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    }) ?? new FeaturesConfig();
}
else
{
    Console.WriteLine($"[FeatureFlags] Không tìm thấy {featuresPath} — dùng mặc định (tất cả enabled).");
    features = new FeaturesConfig();
}

builder.Services.AddSingleton(features);

// ─── CORS ────────────────────────────────────────────────────────────────────

var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:3000,http://localhost:3001")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ─── Database ────────────────────────────────────────────────────────────────

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// ─── JWT ─────────────────────────────────────────────────────────────────────

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ─── External Services ───────────────────────────────────────────────────────

builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddHttpClient<LibreTranslateService>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<VisitLogQueue>();
builder.Services.AddHostedService<VisitLogWorker>();

// ─── Swagger ─────────────────────────────────────────────────────────────────

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

// ─── Maintenance Middleware ───────────────────────────────────────────────────
// Chặn toàn bộ request nếu maintenance đang bật, ngoại trừ /api/features

app.Use(async (ctx, next) =>
{
    if (features.App.Maintenance.Enabled
        && !ctx.Request.Path.StartsWithSegments("/api/features"))
    {
        ctx.Response.StatusCode  = 503;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new
        {
            maintenance = true,
            message     = features.App.Maintenance.Message
        });
        return;
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// ─── Seed ────────────────────────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Users.Any(u => u.Role == "admin"))
    {
        db.Users.Add(new User
        {
            Username     = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role         = "admin",
            FullName     = "Administrator"
        });
        db.SaveChanges();
    }

    var defaultLanguages = new[]
    {
        new Language { LanguageCode = "vi", LanguageName = "Tiếng Việt" },
        new Language { LanguageCode = "en", LanguageName = "English" },
        new Language { LanguageCode = "zh", LanguageName = "中文" },
        new Language { LanguageCode = "ko", LanguageName = "한국어" },
        new Language { LanguageCode = "ja", LanguageName = "日本語" },
    };
    foreach (var lang in defaultLanguages)
    {
        if (!db.Languages.Any(l => l.LanguageCode == lang.LanguageCode))
            db.Languages.Add(lang);
    }
    db.SaveChanges();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/features — public, trả về toàn bộ config (bypass maintenance)
app.MapGet("/api/features", (FeaturesConfig f) => Results.Ok(f));

AuthRoutes.Map(app);
AdminRoutes.Map(app);
SellerRoutes.Map(app);
GuestRoutes.Map(app);

app.MapGet("/", () => "voztrip api is running");

app.Run();
