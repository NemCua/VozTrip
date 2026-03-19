using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class UserService
{
    private readonly string _connStr;

    public UserService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static User MapUser(NpgsqlDataReader r) => new()
    {
        Id        = r.GetInt32(r.GetOrdinal("id")),
        Name      = r.GetString(r.GetOrdinal("name")),
        Phone     = r.IsDBNull(r.GetOrdinal("phone")) ? null : r.GetString(r.GetOrdinal("phone")),
        Email     = r.GetString(r.GetOrdinal("email")),
        Role      = r.GetString(r.GetOrdinal("role")),
        PassHash  = r.GetString(r.GetOrdinal("pass_hash")),
        Status    = r.GetInt32(r.GetOrdinal("status")),
        CreatedAt = r.GetDateTime(r.GetOrdinal("created_at")),
        UpdatedAt = r.GetDateTime(r.GetOrdinal("updated_at"))
    };

    private const string SelectColumns =
        "id, name, phone, email, role, pass_hash, status, created_at, updated_at";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<User>> GetUsers()
    {
        var users = new List<User>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM users WHERE is_deleted IS NOT TRUE ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            users.Add(MapUser(reader));

        return users;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<User?> GetUserById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM users WHERE id = @id AND is_deleted IS NOT TRUE",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapUser(reader) : null;
    }

    // ─── GET BY EMAIL ──────────────────────────────────────────────────────────
    public async Task<User?> FindByEmail(string email)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM users WHERE email = @email LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("email", email);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapUser(reader) : null;
    }

    // ─── ADD (Admin tạo thủ công) ──────────────────────────────────────────────
    public async Task<bool> AddUser(CreateUserDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO users (name, phone, email, role, pass_hash)
            VALUES (@name, @phone, @email, @role, @pass_hash)",
            conn
        );

        cmd.Parameters.AddWithValue("name",      dto.Name);
        cmd.Parameters.AddWithValue("phone",     (object?)dto.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("email",     dto.Email);
        cmd.Parameters.AddWithValue("role",      dto.Role);
        cmd.Parameters.AddWithValue("pass_hash", dto.PassHash);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── REGISTER (Tourist tự đăng ký) ────────────────────────────────────────
    public async Task<bool> Register(RegisterDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO users (name, phone, email, role, pass_hash)
            VALUES (@name, @phone, @email, @role, @pass_hash)",
            conn
        );

        cmd.Parameters.AddWithValue("name",      dto.Name);
        cmd.Parameters.AddWithValue("phone",     (object?)dto.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("email",     dto.Email);
        cmd.Parameters.AddWithValue("role",      dto.Role);
        cmd.Parameters.AddWithValue("pass_hash", dto.PassHash);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateUser(int id, User updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE users
            SET name       = @name,
                phone      = @phone,
                email      = @email,
                role       = @role,
                pass_hash  = @pass_hash,
                status     = @status,
                updated_at = NOW()
            WHERE id = @id
              AND is_deleted IS NOT TRUE",
            conn
        );

        cmd.Parameters.AddWithValue("id",        id);
        cmd.Parameters.AddWithValue("name",      updated.Name);
        cmd.Parameters.AddWithValue("phone",     (object?)updated.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("email",     updated.Email);
        cmd.Parameters.AddWithValue("role",      updated.Role);
        cmd.Parameters.AddWithValue("pass_hash", updated.PassHash);
        cmd.Parameters.AddWithValue("status",    updated.Status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE PARTIAL (chỉ đổi name / phone / status) ───────────────────────
    public async Task<bool> UpdateUserPartial(int id, string? name, string? phone, int? status)
    {
        // Xây dynamic SET clause — chỉ update field nào được truyền vào
        var setClauses = new List<string> { "updated_at = NOW()" };
        var cmd_params = new Dictionary<string, object?>();

        if (name   is not null) { setClauses.Add("name = @name");     cmd_params["name"]   = name; }
        if (phone  is not null) { setClauses.Add("phone = @phone");   cmd_params["phone"]  = phone; }
        if (status is not null) { setClauses.Add("status = @status"); cmd_params["status"] = status; }

        if (setClauses.Count == 1) return false; // không có gì để update

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE users SET {string.Join(", ", setClauses)} WHERE id = @id AND is_deleted IS NOT TRUE";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmd_params)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── SOFT DELETE ───────────────────────────────────────────────────────────
    public async Task<bool> DeleteUserById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE users
            SET is_deleted = TRUE,
                updated_at = NOW()
            WHERE id = @id
              AND role <> 'admin'
              AND is_deleted IS NOT TRUE",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── HARD DELETE (dùng cẩn thận, chỉ admin mới gọi) ──────────────────────
    public async Task<bool> HardDeleteUserById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM users WHERE id = @id AND role <> 'admin'",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}