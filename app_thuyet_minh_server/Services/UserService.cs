// using Microsoft.Extensions.ObjectPool;
// using Microsoft.VisualBasic;
using Npgsql;
using app_thuyet_minh_server.Models;
namespace app_thuyet_minh_server.Services;

public class UserService
{
    private readonly string _connStr;
    public UserService(string connStr)
    {
        _connStr = connStr;
    }
    public async Task<User?> GetThisUser(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(
            @"select id,name,phone,email,role,pass_hash,status,created_at,updated_at 
              from users 
              where id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id", id);

        var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new User
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Phone = reader.IsDBNull(2) ? null : reader.GetString(2),
                Email = reader.GetString(3),
                Role = reader.GetString(4),
                PassHash = reader.GetString(5),
                Status = reader.GetInt32(6),
                CreatedAt = reader.GetDateTime(7),
                UpdatedAt = reader.GetDateTime(8)
            };
        }

        return null; 
    }
}