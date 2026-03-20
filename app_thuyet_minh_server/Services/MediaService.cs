using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class MediaService
{
    private readonly string _connStr;

    public MediaService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Media MapMedia(NpgsqlDataReader r) => new()
    {
        Id    = r.GetInt32(r.GetOrdinal("id")),
        PoiId = r.GetInt32(r.GetOrdinal("poi_id")),
        Url   = r.GetString(r.GetOrdinal("url")),
        Type  = r.GetString(r.GetOrdinal("type"))
    };

    private const string SelectColumns = "id, poi_id, url, type";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Media>> GetMedias()
    {
        var medias = new List<Media>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM media ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            medias.Add(MapMedia(reader));

        return medias;
    }

    // ─── GET ALL BY POI ────────────────────────────────────────────────────────
    public async Task<List<Media>> GetMediasByPoi(int poiId)
    {
        var medias = new List<Media>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM media WHERE poi_id = @poi_id ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            medias.Add(MapMedia(reader));

        return medias;
    }

    // ─── GET BY POI + TYPE (chỉ lấy image hoặc video) ─────────────────────────
    public async Task<List<Media>> GetMediasByPoiAndType(int poiId, string type)
    {
        var medias = new List<Media>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM media WHERE poi_id = @poi_id AND type = @type ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);
        cmd.Parameters.AddWithValue("type",   type);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            medias.Add(MapMedia(reader));

        return medias;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Media?> GetMediaById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM media WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapMedia(reader) : null;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreateMedia(CreateMediaDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO media (poi_id, url, type)
            VALUES (@poi_id, @url, @type)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("poi_id", dto.PoiId);
        cmd.Parameters.AddWithValue("url",    dto.Url);
        cmd.Parameters.AddWithValue("type",   dto.Type);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── CREATE BULK (upload nhiều file 1 lần) ─────────────────────────────────
    public async Task<int> CreateMediaBulk(int poiId, List<(string Url, string Type)> files)
    {
        if (files.Count == 0) return 0;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        // Dùng transaction để đảm bảo insert all-or-nothing
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            int inserted = 0;

            foreach (var (url, type) in files)
            {
                await using var cmd = new NpgsqlCommand(@"
                    INSERT INTO media (poi_id, url, type)
                    VALUES (@poi_id, @url, @type)",
                    conn, tx
                );

                cmd.Parameters.AddWithValue("poi_id", poiId);
                cmd.Parameters.AddWithValue("url",    url);
                cmd.Parameters.AddWithValue("type",   type);

                inserted += await cmd.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return inserted;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ─── UPDATE URL (re-upload file) ───────────────────────────────────────────
    public async Task<bool> UpdateMediaUrl(int id, string newUrl)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE media SET url = @url WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",  id);
        cmd.Parameters.AddWithValue("url", newUrl);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE FULL ───────────────────────────────────────────────────────────
    public async Task<bool> UpdateMedia(int id, Media updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE media
            SET url    = @url,
                type   = @type,
                poi_id = @poi_id
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",     id);
        cmd.Parameters.AddWithValue("url",    updated.Url);
        cmd.Parameters.AddWithValue("type",   updated.Type);
        cmd.Parameters.AddWithValue("poi_id", updated.PoiId);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ONE ────────────────────────────────────────────────────────────
    public async Task<bool> DeleteMediaById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM media WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ALL BY POI (khi xóa POI thủ công hoặc reset media) ────────────
    public async Task<int> DeleteMediasByPoi(int poiId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM media WHERE poi_id = @poi_id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        
        return await cmd.ExecuteNonQueryAsync();
    }

    // ─── DELETE BY POI + TYPE (xóa toàn bộ image hoặc video của 1 POI) ────────
    public async Task<int> DeleteMediasByPoiAndType(int poiId, string type)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM media WHERE poi_id = @poi_id AND type = @type",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);
        cmd.Parameters.AddWithValue("type",   type);

        return await cmd.ExecuteNonQueryAsync();
    }
}