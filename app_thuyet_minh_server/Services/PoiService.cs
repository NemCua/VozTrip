using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class PoiService
{
    private readonly string _connStr;

    public PoiService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Poi MapPoi(NpgsqlDataReader r) => new()
    {
        Id                  = r.GetInt32(r.GetOrdinal("id")),
        SellerId            = r.GetInt32(r.GetOrdinal("seller_id")),
        Name                = r.GetString(r.GetOrdinal("name")),
        Description         = r.IsDBNull(r.GetOrdinal("description")) ? null : r.GetString(r.GetOrdinal("description")),
        Latitude            = r.GetDecimal(r.GetOrdinal("latitude")),
        Longitude           = r.GetDecimal(r.GetOrdinal("longitude")),
        TriggerRadiusMeters = r.IsDBNull(r.GetOrdinal("trigger_radius_meters")) ? 5f : (float)r.GetDouble(r.GetOrdinal("trigger_radius_meters")),
        Status              = r.IsDBNull(r.GetOrdinal("status")) ? 1 : r.GetInt32(r.GetOrdinal("status")),
        CreatedAt           = r.GetDateTime(r.GetOrdinal("created_at")),
        UpdatedAt           = r.GetDateTime(r.GetOrdinal("updated_at"))
    };

    private const string SelectColumns =
        "id, seller_id, name, description, latitude, longitude, trigger_radius_meters, status, created_at, updated_at";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Poi>> GetPois()
    {
        var pois = new List<Poi>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM poi ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            pois.Add(MapPoi(reader));

        return pois;
    }

    // ─── GET ALL BY SELLER ─────────────────────────────────────────────────────
    public async Task<List<Poi>> GetPoisBySeller(int sellerId)
    {
        var pois = new List<Poi>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM poi WHERE seller_id = @seller_id ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("seller_id", sellerId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            pois.Add(MapPoi(reader));

        return pois;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Poi?> GetPoiById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM poi WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapPoi(reader) : null;
    }

    // ─── GET NEARBY (theo tọa độ GPS + bán kính) ──────────────────────────────
    // Dùng công thức Haversine để tính khoảng cách thực tế (đơn vị: mét)
    public async Task<List<Poi>> GetNearbyPois(decimal lat, decimal lng, float radiusMeters = 100)
    {
        var pois = new List<Poi>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand($@"
            SELECT {SelectColumns},
                   (6371000 * acos(
                       LEAST(1.0, cos(radians(@lat)) * cos(radians(latitude))
                       * cos(radians(longitude) - radians(@lng))
                       + sin(radians(@lat)) * sin(radians(latitude)))
                   )) AS distance_meters
            FROM poi
            WHERE status = 1
            ORDER BY distance_meters
            HAVING (6371000 * acos(
                       LEAST(1.0, cos(radians(@lat)) * cos(radians(latitude))
                       * cos(radians(longitude) - radians(@lng))
                       + sin(radians(@lat)) * sin(radians(latitude)))
                   )) <= @radius",
            conn
        );

        cmd.Parameters.AddWithValue("lat",    lat);
        cmd.Parameters.AddWithValue("lng",    lng);
        cmd.Parameters.AddWithValue("radius", radiusMeters);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            pois.Add(MapPoi(reader));

        return pois;
    }

    // ─── GET TRIGGER (tourist vào vùng trigger_radius_meters của poi nào) ──────
    // Khác GetNearby: so với trigger_radius_meters của từng POI, không phải radius cố định
    public async Task<List<Poi>> GetTriggeredPois(decimal lat, decimal lng)
    {
        var pois = new List<Poi>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand($@"
            SELECT {SelectColumns}
            FROM poi
            WHERE status = 1
              AND (6371000 * acos(
                      LEAST(1.0, cos(radians(@lat)) * cos(radians(latitude))
                      * cos(radians(longitude) - radians(@lng))
                      + sin(radians(@lat)) * sin(radians(latitude)))
                  )) <= trigger_radius_meters",
            conn
        );

        cmd.Parameters.AddWithValue("lat", lat);
        cmd.Parameters.AddWithValue("lng", lng);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            pois.Add(MapPoi(reader));

        return pois;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreatePoi(CreatePoiDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO poi (seller_id, name, description, latitude, longitude, trigger_radius_meters)
            VALUES (@seller_id, @name, @description, @latitude, @longitude, @trigger_radius_meters)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("seller_id",             dto.SellerId);
        cmd.Parameters.AddWithValue("name",                  dto.Name);
        cmd.Parameters.AddWithValue("description",           (object?)dto.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("latitude",              dto.Latitude);
        cmd.Parameters.AddWithValue("longitude",             dto.Longitude);
        cmd.Parameters.AddWithValue("trigger_radius_meters", dto.TriggerRadiusMeters);

        // RETURNING id → trả về id vừa tạo, tiện để gắn media/narration sau
        var result = await cmd.ExecuteScalarAsync();
        return result is int newId ? newId : null;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdatePoi(int id, Poi updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE poi
            SET name                   = @name,
                description            = @description,
                latitude               = @latitude,
                longitude              = @longitude,
                trigger_radius_meters  = @trigger_radius_meters,
                status                 = @status,
                updated_at             = NOW()
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",                    id);
        cmd.Parameters.AddWithValue("name",                  updated.Name);
        cmd.Parameters.AddWithValue("description",           (object?)updated.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("latitude",              updated.Latitude);
        cmd.Parameters.AddWithValue("longitude",             updated.Longitude);
        cmd.Parameters.AddWithValue("trigger_radius_meters", updated.TriggerRadiusMeters);
        cmd.Parameters.AddWithValue("status",                updated.Status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE PARTIAL ────────────────────────────────────────────────────────
    public async Task<bool> UpdatePoiPartial(int id, string? name, string? description,
                                             decimal? lat, decimal? lng,
                                             float? radius, int? status)
    {
        var setClauses = new List<string> { "updated_at = NOW()" };
        var cmdParams  = new Dictionary<string, object?>();

        if (name        is not null) { setClauses.Add("name = @name");                                       cmdParams["name"]        = name; }
        if (description is not null) { setClauses.Add("description = @description");                         cmdParams["description"] = description; }
        if (lat         is not null) { setClauses.Add("latitude = @latitude");                               cmdParams["latitude"]    = lat; }
        if (lng         is not null) { setClauses.Add("longitude = @longitude");                             cmdParams["longitude"]   = lng; }
        if (radius      is not null) { setClauses.Add("trigger_radius_meters = @trigger_radius_meters");     cmdParams["trigger_radius_meters"] = radius; }
        if (status      is not null) { setClauses.Add("status = @status");                                   cmdParams["status"]      = status; }

        if (setClauses.Count == 1) return false;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE poi SET {string.Join(", ", setClauses)} WHERE id = @id";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmdParams)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ────────────────────────────────────────────────────────────────
    // Poi dùng hard delete vì DB đã có ON DELETE CASCADE xuống media/narration/question
    public async Task<bool> DeletePoiById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM poi WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── TOGGLE STATUS (active/inactive nhanh) ────────────────────────────────
    public async Task<bool> SetPoiStatus(int id, int status)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE poi SET status = @status, updated_at = NOW() WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",     id);
        cmd.Parameters.AddWithValue("status", status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}