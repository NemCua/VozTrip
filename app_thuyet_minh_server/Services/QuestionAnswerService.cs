// Services/QuestionAnswerService.cs
using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class QuestionAnswerService
{
    private readonly string _connStr;

    public QuestionAnswerService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static QuestionAnswer MapAnswer(NpgsqlDataReader r) => new()
    {
        Id         = r.GetInt32(r.GetOrdinal("id")),
        QuestionId = r.GetInt32(r.GetOrdinal("question_id")),
        AnswerText = r.GetString(r.GetOrdinal("answer_text")),
        Language   = r.GetString(r.GetOrdinal("language")),
        AudioId    = r.IsDBNull(r.GetOrdinal("audio_id")) ? null : r.GetInt32(r.GetOrdinal("audio_id"))
    };

    private const string SelectColumns =
        "id, question_id, answer_text, language, audio_id";

    // ─── GET ALL BY QUESTION ───────────────────────────────────────────────────
    public async Task<List<QuestionAnswer>> GetAnswersByQuestion(int questionId)
    {
        var answers = new List<QuestionAnswer>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question_answer WHERE question_id = @question_id ORDER BY id",
            conn
        );
        cmd.Parameters.AddWithValue("question_id", questionId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            answers.Add(MapAnswer(reader));

        return answers;
    }

    // ─── GET BY QUESTION + LANGUAGE ────────────────────────────────────────────
    public async Task<QuestionAnswer?> GetAnswerByLanguage(int questionId, string language)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question_answer WHERE question_id = @question_id AND language = @language LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("question_id", questionId);
        cmd.Parameters.AddWithValue("language",    language);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapAnswer(reader) : null;
    }

    // ─── GET WITH FALLBACK ─────────────────────────────────────────────────────
    public async Task<QuestionAnswer?> GetAnswerWithFallback(int questionId, string language)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $@"SELECT {SelectColumns} FROM question_answer
               WHERE question_id = @question_id
                 AND language IN (@language, 'vi')
               ORDER BY
                   CASE WHEN language = @language THEN 0 ELSE 1 END
               LIMIT 1",
            conn
        );
        cmd.Parameters.AddWithValue("question_id", questionId);
        cmd.Parameters.AddWithValue("language",    language);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapAnswer(reader) : null;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<QuestionAnswer?> GetAnswerById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question_answer WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapAnswer(reader) : null;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreateAnswer(CreateQuestionAnswerDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO question_answer (question_id, answer_text, language, audio_id)
            VALUES (@question_id, @answer_text, @language, @audio_id)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("question_id", dto.QuestionId);
        cmd.Parameters.AddWithValue("answer_text", dto.AnswerText);
        cmd.Parameters.AddWithValue("language",    dto.Language);
        cmd.Parameters.AddWithValue("audio_id",    (object?)dto.AudioId ?? DBNull.Value);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateAnswer(int id, QuestionAnswer updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE question_answer
            SET answer_text = @answer_text,
                language    = @language,
                audio_id    = @audio_id
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",          id);
        cmd.Parameters.AddWithValue("answer_text", updated.AnswerText);
        cmd.Parameters.AddWithValue("language",    updated.Language);
        cmd.Parameters.AddWithValue("audio_id",    (object?)updated.AudioId ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE PARTIAL ────────────────────────────────────────────────────────
    public async Task<bool> UpdateAnswerPartial(int id, string? answerText, string? language, int? audioId)
    {
        var setClauses = new List<string>();
        var cmdParams  = new Dictionary<string, object?>();

        if (answerText is not null) { setClauses.Add("answer_text = @answer_text"); cmdParams["answer_text"] = answerText; }
        if (language   is not null) { setClauses.Add("language = @language");       cmdParams["language"]    = language; }
        if (audioId    is not null) { setClauses.Add("audio_id = @audio_id");       cmdParams["audio_id"]    = audioId; }

        if (setClauses.Count == 0) return false;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE question_answer SET {string.Join(", ", setClauses)} WHERE id = @id";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmdParams)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── ATTACH AUDIO ──────────────────────────────────────────────────────────
    public async Task<bool> AttachAudio(int answerId, int? audioId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE question_answer SET audio_id = @audio_id WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",       answerId);
        cmd.Parameters.AddWithValue("audio_id", (object?)audioId ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ONE ────────────────────────────────────────────────────────────
    public async Task<bool> DeleteAnswerById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM question_answer WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ALL BY QUESTION ────────────────────────────────────────────────
    public async Task<int> DeleteAnswersByQuestion(int questionId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM question_answer WHERE question_id = @question_id",
            conn
        );
        cmd.Parameters.AddWithValue("question_id", questionId);

        return await cmd.ExecuteNonQueryAsync();
    }

    // ─── DELETE ALL BY POI (join qua question) ─────────────────────────────────
    public async Task<int> DeleteAnswersByPoi(int poiId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            DELETE FROM question_answer
            WHERE question_id IN (
                SELECT id FROM question WHERE poi_id = @poi_id
            )",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        return await cmd.ExecuteNonQueryAsync();
    }
}