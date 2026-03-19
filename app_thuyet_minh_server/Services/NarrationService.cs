using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class NarrationService
{
    private readonly string _connStr;

    public NarrationService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Narration MapNarration(NpgsqlDataReader r) => new()
    {
        Id       = r.GetInt32(r.GetOrdinal("id")),
        PoiId    = r.GetInt32(r.GetOrdinal("poi_id")),
        Text     = r.GetString(r.GetOrdinal("text")),
        Language = r.GetString(r.GetOrdinal("language")),
        AudioId  = r.IsDBNull(r.GetOrdinal("audio_id")) ? null : r.GetInt32(r.GetOrdinal("audio_id")),
        Status   = r.IsDBNull(r.GetOrdinal("status"))   ? 1    : r.GetInt32(r.GetOrdinal("status"))
    };

    private const string SelectColumns =
        "id, poi_id, text, language, audio_id, status";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Narration>> GetNarrations()
    {
        var narrations = new List<Narration>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM narration ORDER BY poi_id, id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            narrations.Add(MapNarration(reader));

        return narrations;
    }

    // ─── GET ALL BY POI ────────────────────────────────────────────────────────
    public async Task<List<Narration>> GetNarrationsByPoi(int poiId)
    {
        var narrations = new List<Narration>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM narration WHERE poi_id = @poi_id ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            narrations.Add(MapNarration(reader));

        return narrations;
    }

    // ─── GET BY POI + LANGUAGE ─────────────────────────────────────────────────
    // Đây là query chính khi tourist trigger POI — lấy đúng ngôn ngữ đang dùng
    public async Task<Narration?> GetNarrationByPoiAndLanguage(int poiId, string language)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $@"SELECT {SelectColumns} FROM narration
               WHERE poi_id  = @poi_id
                 AND language = @language
                 AND status   = 1
               LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id",   poiId);
        cmd.Parameters.AddWithValue("language", language);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapNarration(reader) : null;
    }

    // ─── GET BY POI + LANGUAGE WITH FALLBACK ───────────────────────────────────
    // Thử lấy đúng language → nếu không có thì fallback về 'vi'
    public async Task<Narration?> GetNarrationWithFallback(int poiId, string language)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $@"SELECT {SelectColumns} FROM narration
               WHERE poi_id = @poi_id
                 AND status = 1
                 AND language IN (@language, 'vi')
               ORDER BY
                   CASE WHEN language = @language THEN 0 ELSE 1 END
               LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id",   poiId);
        cmd.Parameters.AddWithValue("language", language);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapNarration(reader) : null;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Narration?> GetNarrationById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM narration WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapNarration(reader) : null;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreateNarration(CreateNarrationDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        // Mỗi POI chỉ nên có 1 narration mỗi language — kiểm tra trước
        await using var checkCmd = new NpgsqlCommand(
            "SELECT COUNT(1) FROM narration WHERE poi_id = @poi_id AND language = @language",
            conn
        );
        checkCmd.Parameters.AddWithValue("poi_id",   dto.PoiId);
        checkCmd.Parameters.AddWithValue("language", dto.Language);
        var count = (long)(await checkCmd.ExecuteScalarAsync() ?? 0L);
        if (count > 0) return null; // đã tồn tại narration cho language này

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO narration (poi_id, text, language, audio_id)
            VALUES (@poi_id, @text, @language, @audio_id)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("poi_id",   dto.PoiId);
        cmd.Parameters.AddWithValue("text",     dto.Text);
        cmd.Parameters.AddWithValue("language", dto.Language);
        cmd.Parameters.AddWithValue("audio_id", (object?)dto.AudioId ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── UPSERT (tạo mới nếu chưa có, update nếu đã có) ──────────────────────
    public async Task<int?> UpsertNarration(CreateNarrationDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO narration (poi_id, text, language, audio_id)
            VALUES (@poi_id, @text, @language, @audio_id)
            ON CONFLICT (poi_id, language)
            DO UPDATE SET
                text     = EXCLUDED.text,
                audio_id = EXCLUDED.audio_id,
                status   = 1
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("poi_id",   dto.PoiId);
        cmd.Parameters.AddWithValue("text",     dto.Text);
        cmd.Parameters.AddWithValue("language", dto.Language);
        cmd.Parameters.AddWithValue("audio_id", (object?)dto.AudioId ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateNarration(int id, Narration updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE narration
            SET text     = @text,
                language = @language,
                audio_id = @audio_id,
                status   = @status
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",       id);
        cmd.Parameters.AddWithValue("text",     updated.Text);
        cmd.Parameters.AddWithValue("language", updated.Language);
        cmd.Parameters.AddWithValue("audio_id", (object?)updated.AudioId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("status",   updated.Status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE TEXT (seller sửa nội dung, chưa có audio mới) ─────────────────
    public async Task<bool> UpdateNarrationText(int id, string newText)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE narration SET text = @text WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",   id);
        cmd.Parameters.AddWithValue("text", newText);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── ATTACH AUDIO (gắn audio sau khi TTS generate xong) ───────────────────
    public async Task<bool> AttachAudio(int narrationId, int? audioId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE narration SET audio_id = @audio_id WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",       narrationId);
        cmd.Parameters.AddWithValue("audio_id", (object?)audioId ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── SET STATUS ────────────────────────────────────────────────────────────
    public async Task<bool> SetNarrationStatus(int id, int status)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE narration SET status = @status WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",     id);
        cmd.Parameters.AddWithValue("status", status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ONE ────────────────────────────────────────────────────────────
    public async Task<bool> DeleteNarrationById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM narration WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ALL BY POI ─────────────────────────────────────────────────────
    public async Task<int> DeleteNarrationsByPoi(int poiId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM narration WHERE poi_id = @poi_id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        return await cmd.ExecuteNonQueryAsync();
    }

    // ─── DELETE BY POI + LANGUAGE ──────────────────────────────────────────────
    public async Task<bool> DeleteNarrationByPoiAndLanguage(int poiId, string language)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM narration WHERE poi_id = @poi_id AND language = @language",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id",   poiId);
        cmd.Parameters.AddWithValue("language", language);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}