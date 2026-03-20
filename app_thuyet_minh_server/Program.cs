// Program.cs
using app_thuyet_minh_server.Services;
using app_thuyet_minh_server.dto;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// ===== CONNECTION STRING =====
var connStr = builder.Configuration.GetConnectionString("Default")!;

// ===== SERVICES =====
builder.Services.AddScoped(_ => new UserService(connStr));
builder.Services.AddScoped(_ => new SellerService(connStr));
builder.Services.AddScoped(_ => new PoiService(connStr));
builder.Services.AddScoped(_ => new MediaService(connStr));
builder.Services.AddScoped(_ => new AudioService(connStr));
builder.Services.AddScoped(_ => new NarrationService(connStr));
builder.Services.AddScoped(_ => new QuestionService(connStr));
builder.Services.AddScoped(_ => new QuestionAnswerService(connStr));

// ===== JWT =====
var jwtKey      = builder.Configuration["Jwt:Key"]!;
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime         = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAudience,
        IssuerSigningKey         = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        )
    };

    
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("access_token", out var cookieToken))
                context.Token = cookieToken;

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== BUILD =====
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();


// ================================================================
// AUTH
// ================================================================

// POST /api/auth/login
app.MapPost("/api/auth/login", async (UserService userService, LoginDto dto) =>
{
    var user = await userService.FindByEmail(dto.Email);

    if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PassHash))
        return Results.Unauthorized();

    var jwt = GenerateJwt(user.Id, user.Role, user.Email, jwtKey, jwtIssuer, jwtAudience);

    return Results.Ok(new { token = jwt, role = user.Role });
});


// ================================================================
// AUTH - WEB (admin/seller) → HttpOnly Cookie
// ================================================================
app.MapPost("/api/web/login", async (UserService userService, LoginDto dto, HttpResponse response) =>
{
    var user = await userService.FindByEmail(dto.Email);

    if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PassHash))
        return Results.Unauthorized();

    // Chỉ cho admin và seller login web
    if (user.Role == "tourist")
        return Results.Forbid();

    var jwt = GenerateJwt(user.Id, user.Role, user.Email, jwtKey, jwtIssuer, jwtAudience);

    // Set HttpOnly Cookie — JS không đọc được
    response.Cookies.Append("access_token", jwt, new CookieOptions
    {
        HttpOnly = true,
        Secure   = true,        // chỉ gửi qua HTTPS
        SameSite = SameSiteMode.Strict,
        Expires  = DateTimeOffset.UtcNow.AddHours(2)
    });

    return Results.Ok(new { role = user.Role });
});

// POST /api/web/logout
app.MapPost("/api/web/logout", (HttpResponse response) =>
{
    response.Cookies.Delete("access_token");
    return Results.Ok(new { message = "Logged out" });
});

// GET /api/auth/me — lấy thông tin user đang đăng nhập
app.MapGet("/api/auth/me", async (ClaimsPrincipal claims, UserService userService) =>
{
    var idStr = claims.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!int.TryParse(idStr, out var id))
        return Results.Unauthorized();

    var user = await userService.GetUserById(id);
    return user is null ? Results.NotFound() : Results.Ok(user);
})
.RequireAuthorization();


// ================================================================
// USERS (admin)
// ================================================================
    
// GET /api/admin/users
app.MapGet("/api/admin/users", async (UserService svc) =>
{
    var users = await svc.GetUsers();
    return Results.Ok(users);
})
.RequireAuthorization();

// GET /api/admin/users/{id}
app.MapGet("/api/admin/users/{id:int}", async (int id, UserService svc) =>
{
    var user = await svc.GetUserById(id);
    return user is null ? Results.NotFound() : Results.Ok(user);
})
.RequireAuthorization();

// POST /api/admin/users — admin tạo seller
app.MapPost("/api/admin/users", async (CreateUserDto dto, UserService svc) =>
{
    dto.PassHash = BCrypt.Net.BCrypt.HashPassword(dto.PassHash);
    var newId = await svc.AddUser(dto);
    return newId ? Results.Ok(new { message = "User created" }) : Results.BadRequest(new { message = "Create failed" });
})
.RequireAuthorization();

// DELETE /api/admin/users/{id}
app.MapDelete("/api/admin/users/{id:int}", async (int id, UserService svc) =>
{
    var ok = await svc.DeleteUserById(id);
    return ok ? Results.Ok() : Results.NotFound();
})
.RequireAuthorization();


// ================================================================
// REGISTER (public)
// ================================================================

// POST /api/auth/register — tourist tự đăng ký
app.MapPost("/api/auth/register", async (RegisterDto dto, UserService svc) =>
{
    dto.Role     = "tourist";
    dto.PassHash = BCrypt.Net.BCrypt.HashPassword(dto.PassHash);
    var ok = await svc.Register(dto);
    return ok
        ? Results.Ok(new { message = "Registered successfully" })
        : Results.BadRequest(new { message = "Registration failed" });
});


// ================================================================
// POI (ví dụ tượng trưng)
// ================================================================

// GET /api/poi — lấy tất cả poi
app.MapGet("/api/poi", async (PoiService svc) =>
{
    var pois = await svc.GetPois();
    return Results.Ok(pois);
});

// GET /api/poi/{id}
app.MapGet("/api/poi/{id:int}", async (int id, PoiService svc) =>
{
    var poi = await svc.GetPoiById(id);
    return poi is null ? Results.NotFound() : Results.Ok(poi);
});

// GET /api/poi/nearby?lat=...&lng=...&radius=...
app.MapGet("/api/poi/nearby", async (decimal lat, decimal lng, PoiService svc, float radius = 100) =>
{
    var pois = await svc.GetNearbyPois(lat, lng, radius);
    return Results.Ok(pois);
});

// GET /api/poi/trigger?lat=...&lng=... — tourist gọi liên tục khi di chuyển
app.MapGet("/api/poi/trigger", async (decimal lat, decimal lng, PoiService svc) =>
{
    var pois = await svc.GetTriggeredPois(lat, lng);
    return Results.Ok(pois);
});

// POST /api/poi
app.MapPost("/api/poi", async (CreatePoiDto dto, PoiService svc) =>
{
    var newId = await svc.CreatePoi(dto);
    return newId is null
        ? Results.BadRequest(new { message = "Create failed" })
        : Results.Ok(new { id = newId });
})
.RequireAuthorization();

// DELETE /api/poi/{id}
app.MapDelete("/api/poi/{id:int}", async (int id, PoiService svc) =>
{
    var ok = await svc.DeletePoiById(id);
    return ok ? Results.Ok() : Results.NotFound();
})
.RequireAuthorization();

static string GenerateJwt(int userId, string role, string email,
                           string key, string issuer, string audience)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Role,           role),
        new Claim(ClaimTypes.Name,           email)
    };

    var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
        issuer:             issuer,
        audience:           audience,
        claims:             claims,
        expires:            DateTime.UtcNow.AddHours(2),
        signingCredentials: new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        )
    );

    return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler()
        .WriteToken(token);
}
app.Run();