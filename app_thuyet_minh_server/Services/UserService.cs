// using Microsoft.Extensions.ObjectPool;
// using Microsoft.VisualBasic;
using Npgsql;
using app_thuyet_minh_server.Models;
using Microsoft.Extensions.ObjectPool;
using System.Collections.Generic;
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

        await using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new User
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Name = reader.GetString(reader.GetOrdinal("name")),

                Phone = reader.IsDBNull(reader.GetOrdinal("phone"))
            ? null
            : reader.GetString(reader.GetOrdinal("phone")),

                Email = reader.GetString(reader.GetOrdinal("email")),
                Role = reader.GetString(reader.GetOrdinal("role")),
                PassHash = reader.GetString(reader.GetOrdinal("pass_hash")),
                Status = reader.GetInt32(reader.GetOrdinal("status")),

                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }

        return null;
    }
    public async Task<List<User>> GetUsers()
    {
        List<User> users = new List<User>();
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(
            "select id,name,phone,email,role,pass_hash,status,created_at,updated_at from users",
            conn
        );
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            users.Add(new User
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Name = reader.GetString(reader.GetOrdinal("name")),

                Phone = reader.IsDBNull(reader.GetOrdinal("phone"))
            ? null
            : reader.GetString(reader.GetOrdinal("phone")),

                Email = reader.GetString(reader.GetOrdinal("email")),
                Role = reader.GetString(reader.GetOrdinal("role")),
                PassHash = reader.GetString(reader.GetOrdinal("pass_hash")),
                Status = reader.GetInt32(reader.GetOrdinal("status")),

                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("updated_at"))
            });
        }
        return users;
    }
    public async Task<User?> FindByEmail(string email)
{
    await using var conn = new NpgsqlConnection(_connStr);
    await conn.OpenAsync();

    var cmd = new NpgsqlCommand(
        @"select id,name,phone,email,role,pass_hash,status,created_at,updated_at
          from users
          where email = @email
          limit 1",
        conn
    );

    cmd.Parameters.AddWithValue("email", email);

    await using var reader = await cmd.ExecuteReaderAsync();

    if (await reader.ReadAsync())
    {
        return new User
        {
            Id = reader.GetInt32(reader.GetOrdinal("id")),
            Name = reader.GetString(reader.GetOrdinal("name")),

            Phone = reader.IsDBNull(reader.GetOrdinal("phone"))
                ? null
                : reader.GetString(reader.GetOrdinal("phone")),

            Email = reader.GetString(reader.GetOrdinal("email")),
            Role = reader.GetString(reader.GetOrdinal("role")),
            PassHash = reader.GetString(reader.GetOrdinal("pass_hash")),
            Status = reader.GetInt32(reader.GetOrdinal("status")),

            CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
            UpdatedAt = reader.GetDateTime(reader.GetOrdinal("updated_at"))
        };
    }

    return null;
}
}