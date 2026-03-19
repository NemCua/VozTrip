using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class SellerService
{
    private readonly string _connStr;

    public SellerService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Seller MapSeller(NpgsqlDataReader r) => new()
    {
        Id          = r.GetInt32(r.GetOrdinal("id")),
        OwnerId     = r.GetInt32(r.GetOrdinal("owner_id")),
        ShopName    = r.GetString(r.GetOrdinal("shop_name")),
        Description = r.IsDBNull(r.GetOrdinal("description")) ? null : r.GetString(r.GetOrdinal("description")),
        Address     = r.IsDBNull(r.GetOrdinal("address"))     ? null : r.GetString(r.GetOrdinal("address")),
        Verified    = r.IsDBNull(r.GetOrdinal("verified"))    ? false : r.GetBoolean(r.GetOrdinal("verified")),
        CreatedAt   = r.GetDateTime(r.GetOrdinal("created_at")),
        UpdatedAt   = r.GetDateTime(r.GetOrdinal("updated_at"))
    };

    private const string SelectColumns =
        "id, owner_id, shop_name, description, address, verified, created_at, updated_at";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Seller>> GetSellers()
    {
        var sellers = new List<Seller>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM seller ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            sellers.Add(MapSeller(reader));

        return sellers;
    }

    // ─── GET ALL UNVERIFIED (admin duyệt) ─────────────────────────────────────
    public async Task<List<Seller>> GetUnverifiedSellers()
    {
        var sellers = new List<Seller>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM seller WHERE verified = FALSE ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            sellers.Add(MapSeller(reader));

        return sellers;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Seller?> GetSellerById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM seller WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapSeller(reader) : null;
    }

    // ─── GET BY OWNER ──────────────────────────────────────────────────────────
    // 1 user chỉ có 1 shop nên trả về Seller? thay vì List
    public async Task<Seller?> GetSellerByOwnerId(int ownerId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM seller WHERE owner_id = @owner_id LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("owner_id", ownerId);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapSeller(reader) : null;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreateSeller(CreateSellerDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        // Kiểm tra owner đã có shop chưa
        await using var checkCmd = new NpgsqlCommand(
            "SELECT COUNT(1) FROM seller WHERE owner_id = @owner_id",
            conn
        );
        checkCmd.Parameters.AddWithValue("owner_id", dto.OwnerId);
        var count = (long)(await checkCmd.ExecuteScalarAsync() ?? 0L);
        if (count > 0) return null; // đã tồn tại shop

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO seller (owner_id, shop_name, description, address)
            VALUES (@owner_id, @shop_name, @description, @address)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("owner_id",    dto.OwnerId);
        cmd.Parameters.AddWithValue("shop_name",   dto.ShopName);
        cmd.Parameters.AddWithValue("description", (object?)dto.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("address",     (object?)dto.Address     ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is int newId ? newId : Convert.ToInt32(result);
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateSeller(int id, Seller updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE seller
            SET shop_name   = @shop_name,
                description = @description,
                address     = @address,
                updated_at  = NOW()
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",          id);
        cmd.Parameters.AddWithValue("shop_name",   updated.ShopName);
        cmd.Parameters.AddWithValue("description", (object?)updated.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("address",     (object?)updated.Address     ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE PARTIAL ────────────────────────────────────────────────────────
    public async Task<bool> UpdateSellerPartial(int id, string? shopName, string? description, string? address)
    {
        var setClauses = new List<string> { "updated_at = NOW()" };
        var cmdParams  = new Dictionary<string, object?>();

        if (shopName    is not null) { setClauses.Add("shop_name = @shop_name");     cmdParams["shop_name"]   = shopName; }
        if (description is not null) { setClauses.Add("description = @description"); cmdParams["description"] = description; }
        if (address     is not null) { setClauses.Add("address = @address");         cmdParams["address"]     = address; }

        if (setClauses.Count == 1) return false;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE seller SET {string.Join(", ", setClauses)} WHERE id = @id";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmdParams)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── VERIFY (admin duyệt shop) ─────────────────────────────────────────────
    public async Task<bool> VerifySeller(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE seller
            SET verified   = TRUE,
                updated_at = NOW()
            WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── REVOKE VERIFY (admin thu hồi) ────────────────────────────────────────
    public async Task<bool> RevokeSeller(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE seller
            SET verified   = FALSE,
                updated_at = NOW()
            WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ────────────────────────────────────────────────────────────────
    // Hard delete — DB đã có ON DELETE CASCADE xuống poi → media/narration/question
    public async Task<bool> DeleteSellerById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM seller WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE BY OWNER ───────────────────────────────────────────────────────
    public async Task<bool> DeleteSellerByOwnerId(int ownerId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM seller WHERE owner_id = @owner_id",
            conn
        );
        cmd.Parameters.AddWithValue("owner_id", ownerId);
    
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}