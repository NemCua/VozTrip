// Services/QuestionService.cs
using Npgsql;
using app_thuyet_minh_server.Models;
using app_thuyet_minh_server.dto;

namespace app_thuyet_minh_server.Services;

public class QuestionService
{
    private readonly string _connStr;

    public QuestionService(string connStr)
    {
        _connStr = connStr;
    }

    // ─── Helper ────────────────────────────────────────────────────────────────
    private static Question MapQuestion(NpgsqlDataReader r) => new()
    {
        Id           = r.GetInt32(r.GetOrdinal("id")),
        PoiId        = r.GetInt32(r.GetOrdinal("poi_id")),
        QuestionText = r.GetString(r.GetOrdinal("question_text")),
        SortOrder    = r.IsDBNull(r.GetOrdinal("sort_order")) ? 0 : r.GetInt32(r.GetOrdinal("sort_order")),
        Status       = r.IsDBNull(r.GetOrdinal("status"))     ? 1 : r.GetInt32(r.GetOrdinal("status"))
    };

    private const string SelectColumns =
        "id, poi_id, question_text, sort_order, status";

    // ─── GET ALL ───────────────────────────────────────────────────────────────
    public async Task<List<Question>> GetQuestions()
    {
        var questions = new List<Question>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question ORDER BY poi_id, sort_order",
            conn
        );

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            questions.Add(MapQuestion(reader));

        return questions;
    }

    // ─── GET ALL BY POI ────────────────────────────────────────────────────────
    public async Task<List<Question>> GetQuestionsByPoi(int poiId)
    {
        var questions = new List<Question>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question WHERE poi_id = @poi_id ORDER BY sort_order",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            questions.Add(MapQuestion(reader));

        return questions;
    }

    // ─── GET ALL ACTIVE BY POI ─────────────────────────────────────────────────
    public async Task<List<Question>> GetActiveQuestionsByPoi(int poiId)
    {
        var questions = new List<Question>();

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question WHERE poi_id = @poi_id AND status = 1 ORDER BY sort_order",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            questions.Add(MapQuestion(reader));

        return questions;
    }

    // ─── GET ONE ───────────────────────────────────────────────────────────────
    public async Task<Question?> GetQuestionById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            $"SELECT {SelectColumns} FROM question WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapQuestion(reader) : null;
    }

    // ─── CREATE ────────────────────────────────────────────────────────────────
    public async Task<int?> CreateQuestion(CreateQuestionDto dto)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            INSERT INTO question (poi_id, question_text, sort_order)
            VALUES (@poi_id, @question_text, @sort_order)
            RETURNING id",
            conn
        );

        cmd.Parameters.AddWithValue("poi_id",        dto.PoiId);
        cmd.Parameters.AddWithValue("question_text", dto.QuestionText);
        cmd.Parameters.AddWithValue("sort_order",    dto.SortOrder);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null ? Convert.ToInt32(result) : null;
    }

    // ─── UPDATE ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateQuestion(int id, Question updated)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(@"
            UPDATE question
            SET question_text = @question_text,
                sort_order    = @sort_order,
                status        = @status
            WHERE id = @id",
            conn
        );

        cmd.Parameters.AddWithValue("id",            id);
        cmd.Parameters.AddWithValue("question_text", updated.QuestionText);
        cmd.Parameters.AddWithValue("sort_order",    updated.SortOrder);
        cmd.Parameters.AddWithValue("status",        updated.Status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── UPDATE PARTIAL ────────────────────────────────────────────────────────
    public async Task<bool> UpdateQuestionPartial(int id, string? questionText, int? sortOrder, int? status)
    {
        var setClauses = new List<string>();
        var cmdParams  = new Dictionary<string, object?>();

        if (questionText is not null) { setClauses.Add("question_text = @question_text"); cmdParams["question_text"] = questionText; }
        if (sortOrder    is not null) { setClauses.Add("sort_order = @sort_order");       cmdParams["sort_order"]    = sortOrder; }
        if (status       is not null) { setClauses.Add("status = @status");               cmdParams["status"]        = status; }

        if (setClauses.Count == 0) return false;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        var sql = $"UPDATE question SET {string.Join(", ", setClauses)} WHERE id = @id";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);
        foreach (var (key, val) in cmdParams)
            cmd.Parameters.AddWithValue(key, val ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── REORDER ───────────────────────────────────────────────────────────────
    public async Task<bool> ReorderQuestions(List<(int Id, int SortOrder)> orders)
    {
        if (orders.Count == 0) return false;

        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            foreach (var (qId, sortOrder) in orders)
            {
                await using var cmd = new NpgsqlCommand(
                    "UPDATE question SET sort_order = @sort_order WHERE id = @id",
                    conn, tx
                );
                cmd.Parameters.AddWithValue("id",         qId);
                cmd.Parameters.AddWithValue("sort_order", sortOrder);
                await cmd.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return true;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ─── SET STATUS ────────────────────────────────────────────────────────────
    public async Task<bool> SetQuestionStatus(int id, int status)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "UPDATE question SET status = @status WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id",     id);
        cmd.Parameters.AddWithValue("status", status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ONE ────────────────────────────────────────────────────────────
    public async Task<bool> DeleteQuestionById(int id)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM question WHERE id = @id",
            conn
        );
        cmd.Parameters.AddWithValue("id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ─── DELETE ALL BY POI ─────────────────────────────────────────────────────
    public async Task<int> DeleteQuestionsByPoi(int poiId)
    {
        await using var conn = new NpgsqlConnection(_connStr);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "DELETE FROM question WHERE poi_id = @poi_id",
            conn
        );
        cmd.Parameters.AddWithValue("poi_id", poiId);

        return await cmd.ExecuteNonQueryAsync();
    }
}