using Npgsql;
using app_thuyet_minh_server.Services;

var builder = WebApplication.CreateBuilder(args);

var connStr = "Host=localhost;Port=5432;Database=app_thuyet_minh;Username=nguyenquochuy;Password=mypassword;";


builder.Services.AddSingleton(new UserService(connStr));

var app = builder.Build();


app.MapGet("/api/get/user", async (UserService userService) =>
{
    return await userService.GetThisUser(1);
});

app.Run();

