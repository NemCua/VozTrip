using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class AudioService
{
    private readonly string _connStr;

    public AudioService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Audio MapAudio(NpgsqlDataReader r) => new()
    {
        Id          = r.GetInt32(r.GetOrdinal("id")),
        AudioUrl    = r.GetString(r.GetOrdinal("audio_url")),
        DurationSec = r.IsDBNull(r.GetOrdinal("duration_sec")) ? null : r.GetInt32(r.GetOrdinal("duration_sec")),
        SourceType  = r.IsDBNull(r.GetOrdinal("source_type"))  ? null : r.GetString(r.GetOrdinal("source_type"))
    };

    private const string SelectColumns =
        "id, audio_url, duration_sec, source_type";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Audio>> GetAudios()
    {
        var audios = new List<Audio>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM audio ORDER BY id",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            audios.Add(MapAudio(reader));

        return audios;
    }

    // ─── GET ALL BY SOURCE TYPE ────────────────────────────────────────────────
    public async Task<List<Audio>> GetAudiosBySourceType(string sourceType)
    {
        var audios = new List<Audio>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM audio WHERE source_type = @source_type ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("source_type", sourceType);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            audios.Add(MapAudio(reader));

        return audios;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Audio?> GetAudioById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM audio WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapAudio(reader) : null;
    }

    // ─── CREATE (upload thủ công) ──────────────────────────────────────────────
    public async Task<int?> CreateAudio(CreateAudioDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO audio (audio_url, duration_sec, source_type)
            VALUES (@audio_url, @duration_sec, @source_type)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("audio_url",    dto.AudioUrl);
        cmd.Parameters.AddWithValue("duration_sec", (object?)dto.DurationSec ?? DBNull.Value);
        cmd.Parameters.AddWithValue("source_type",  (object?)dto.SourceType  ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── CREATE TTS (tạo từ text-to-speech, url do TTS engine trả về) ─────────
    public async Task<int?> CreateTtsAudio(string audioUrl, int? durationSec = null)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO audio (audio_url, duration_sec, source_type)
            VALUES (@audio_url, @duration_sec, 'tts')
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("audio_url",    audioUrl);
        cmd.Parameters.AddWithValue("duration_sec", (object?)durationSec ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateAudio(int id, Audio updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE audio
            SET audio_url    = @audio_url,
                duration_sec = @duration_sec,
                source_type  = @source_type
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",           id);
        cmd.Parameters.AddWithValue("audio_url",    updated.AudioUrl);
        cmd.Parameters.AddWithValue("duration_sec", (object?)updated.DurationSec ?? DBNull.Value);
        cmd.Parameters.AddWithValue("source_type",  (object?)updated.SourceType  ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE URL (khi re-upload hoặc TTS generate lại) ─────────────────────
    public async Task<bool> UpdateAudioUrl(int id, string newUrl, int? newDurationSec = null)
    {
        var setClauses = new List<string> { "audio_url = @audio_url" };
        var cmdParams  = new Dictionary<string, object?> { ["audio_url"] = newUrl };

        if (newDurationSec is not null)
        {
            setClauses.Add("duration_sec = @duration_sec");
            cmdParams["duration_sec"] = newDurationSec;
        }

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE audio SET {string.Join(", ", setClauses)} WHERE id = @id";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmdParams)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ────────────────────────────────────────────────────────────────
    // Audio không cascade — narration/question_answer sẽ SET NULL audio_id
    public async Task<bool> DeleteAudioById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM audio WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ORPHANS (dọn audio không còn được dùng ở đâu) ─────────────────
    public async Task<int> DeleteOrphanAudios()
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            DELETE FROM audio
            WHERE id NOT IN (
                SELECT audio_id FROM narration      WHERE audio_id IS NOT NULL
                UNION
                SELECT audio_id FROM question_answer WHERE audio_id IS NOT NULL
            )",
            conn
        );

        // trả về số bản ghi đã xóa
        return await cmd.ExecuteNonQueryAsync();
    }
}