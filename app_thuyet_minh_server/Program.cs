using Npgsql;
using app_thuyet_minh_server.Services;

var builder = WebApplication.CreateBuilder(args);

var connStr = "Host=localhost;Port=5432;Database=app_thuyet_minh;Username=nguyenquochuy;Password=mypassword;";

builder.Services.AddSingleton(new UserService(connStr));


// ✅ đọc origins từ appsettings.*
var origins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

// ✅ đăng ký CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// ✅ bật CORS (phải nằm trước MapGet)
app.UseCors("frontend");


app.MapGet("/api/web/get/all/user", async (UserService userService) =>
{
    return await userService.GetUsers();
});

app.Run();
