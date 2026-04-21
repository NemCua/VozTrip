using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using back_end_vozTrip.Config;
using back_end_vozTrip.Models;
using back_end_vozTrip.Routes;
using back_end_vozTrip.Services;

var builder = WebApplication.CreateBuilder(args);

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

// ─── Services ────────────────────────────────────────────────────────────────

builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddHttpClient<LibreTranslateService>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<VisitLogQueue>();
builder.Services.AddHostedService<VisitLogWorker>();
builder.Services.AddSingleton<IFeaturesService, FeaturesService>();

// FeaturesConfig được resolve mỗi request từ cache của FeaturesService
builder.Services.AddScoped<FeaturesConfig>(sp =>
    sp.GetRequiredService<IFeaturesService>().GetConfig());

// ─── Swagger ─────────────────────────────────────────────────────────────────

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

// ─── Maintenance Middleware ───────────────────────────────────────────────────

app.Use(async (ctx, next) =>
{
    // Lấy config từ service (đã cache) mỗi request
    var featSvc = ctx.RequestServices.GetRequiredService<IFeaturesService>();
    var cfg     = featSvc.GetConfig();

    if (cfg.App.Maintenance.Enabled
        && !ctx.Request.Path.StartsWithSegments("/api/features"))
    {
        ctx.Response.StatusCode  = 503;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new
        {
            maintenance = true,
            message     = cfg.App.Maintenance.Message
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
    var db      = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var featSvc = scope.ServiceProvider.GetRequiredService<IFeaturesService>();

    // Tự apply migration khi khởi động (an toàn khi chạy nhiều lần)
    await db.Database.MigrateAsync();

    // Seed admin user
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

    // Seed languages
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

    // Seed feature flags từ defaults + load vào cache
    await featSvc.SeedDefaultsAsync(db);
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
