using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using back_end_vozTrip.Models;
using back_end_vozTrip.Routes;
using back_end_vozTrip.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// JWT
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Cloudinary
builder.Services.AddSingleton<CloudinaryService>();

// LibreTranslate
builder.Services.AddHttpClient<LibreTranslateService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Seed admin
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
}

AuthRoutes.Map(app);
AdminRoutes.Map(app);
SellerRoutes.Map(app);
GuestRoutes.Map(app);

app.MapGet("/", () => "voztrip api is running");

app.Run();
